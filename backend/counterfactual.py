import copy
from typing import Dict, Any, List, Optional
from task_sequencer import TaskSequencer


def generate_counterfactual_scenarios(
    base_scenario: Dict[str, Any],
    task_ids: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Generate 3 counterfactual scenarios with integrated task sequencing.
    
    If task_ids provided: sequences are included in the scenario.
    If task_ids is None: uses existing behavior (backward compatible).
    """
    scenarios = []
    
    # Initialize task sequencer if tasks provided
    task_sequencer = None
    if task_ids:
        task_sequencer = TaskSequencer(task_ids)

    # SCENARIO A: Delay-Minimizing
    scenario_a = _create_delay_minimizing_scenario(copy.deepcopy(base_scenario))
    if task_sequencer:
        delay_sequence = task_sequencer.generate_delay_minimizing_sequence()
        delay_timeline = task_sequencer.calculate_sequence_timeline(delay_sequence)
        scenario_a["task_sequence"] = delay_sequence
        scenario_a["task_timeline"] = delay_timeline
    
    scenarios.append({
        "id": "A",
        "strategy": "Delay-Minimizing",
        "description": "Prioritize on-time departure above all else. Aggressive task sequencing, parallel operations where safe, higher APU usage to avoid ground power dependency. Accept higher fuel burn for punctuality.",
        "priority_weights": {"delay": 0.7, "fuel": 0.15, "safety": 0.15},
        "scenario": scenario_a,
    })

    # SCENARIO B: Fuel-Minimizing
    scenario_b = _create_fuel_minimizing_scenario(copy.deepcopy(base_scenario))
    if task_sequencer:
        fuel_sequence = task_sequencer.generate_fuel_minimizing_sequence()
        fuel_timeline = task_sequencer.calculate_sequence_timeline(fuel_sequence)
        scenario_b["task_sequence"] = fuel_sequence
        scenario_b["task_timeline"] = fuel_timeline
    
    scenarios.append({
        "id": "B",
        "strategy": "Fuel-Minimizing",
        "description": "Minimize APU usage and fuel consumption. Sequential task execution to reduce idle time, maximize ground power usage, accept schedule delays to conserve fuel. Optimal for cost-sensitive operations.",
        "priority_weights": {"delay": 0.15, "fuel": 0.7, "safety": 0.15},
        "scenario": scenario_b,
    })

    # SCENARIO C: Balanced
    scenario_c = _create_balanced_scenario(copy.deepcopy(base_scenario))
    if task_sequencer:
        balanced_sequence = task_sequencer.generate_balanced_sequence()
        balanced_timeline = task_sequencer.calculate_sequence_timeline(balanced_sequence)
        scenario_c["task_sequence"] = balanced_sequence
        scenario_c["task_timeline"] = balanced_timeline
    
    scenarios.append({
        "id": "C",
        "strategy": "Balanced",
        "description": "Optimize across all dimensions with equal weight. Balanced task sequencing, moderate APU usage, reasonable delay tolerance. Best for standard operations where no single factor dominates.",
        "priority_weights": {"delay": 0.4, "fuel": 0.3, "safety": 0.3},
        "scenario": scenario_c,
    })

    return scenarios


def _create_delay_minimizing_scenario(scenario: Dict[str, Any]) -> Dict[str, Any]:
    scenario["strategy_modifications"] = {
        "task_sequencing": "aggressive_parallel",
        "apu_policy": "always_on",
        "delay_tolerance": "minimal",
        "ground_power_preference": "use_if_faster",
        "buffer_time_reduction": 0.5,
    }

    for task in scenario.get("tasks", []):
        if task.get("category") in ("service", "cargo"):
            task["duration_min"] = max(5, int(task.get("duration_min", 10) * 0.85))

    scenario["apu_always_on"] = True
    scenario["parallel_operations_allowed"] = True

    return scenario


def _create_fuel_minimizing_scenario(scenario: Dict[str, Any]) -> Dict[str, Any]:
    scenario["strategy_modifications"] = {
        "task_sequencing": "strictly_sequential",
        "apu_policy": "minimal_usage",
        "delay_tolerance": "high",
        "ground_power_preference": "always_use",
        "buffer_time_increase": 0.3,
    }

    for task in scenario.get("tasks", []):
        if task.get("category") in ("service", "cargo"):
            task["duration_min"] = int(task.get("duration_min", 10) * 1.15)

    scenario["apu_always_on"] = False
    scenario["parallel_operations_allowed"] = False
    scenario["max_apu_minutes"] = 15

    return scenario


def _create_balanced_scenario(scenario: Dict[str, Any]) -> Dict[str, Any]:
    scenario["strategy_modifications"] = {
        "task_sequencing": "selective_parallel",
        "apu_policy": "conditional",
        "delay_tolerance": "moderate",
        "ground_power_preference": "use_when_available",
        "buffer_time_reduction": 0.1,
    }

    for task in scenario.get("tasks", []):
        if task.get("category") in ("service", "cargo"):
            factor = 0.95 + (0.1 * (task.get("duration_min", 10) % 10 / 10))
            task["duration_min"] = int(task.get("duration_min", 10) * factor)

    scenario["apu_always_on"] = False
    scenario["parallel_operations_allowed"] = True
    scenario["max_apu_minutes"] = 30

    return scenario
