# Integrated Task Sequencing in Counterfactual Scenarios

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate dynamic task sequencing into the counterfactual reasoning engine so K2 Think V2 generates not just operational plans but also derives optimal task orderings for each strategy (Delay-Minimizing, Fuel-Minimizing, Balanced).

**Architecture:** 
- Extend `ScenarioInput` to accept optional task list with dependencies
- Create task sequencing logic that generates permutations respecting constraints
- Enhance `counterfactual.py` to apply strategy-specific sequencing rules (aggressive parallel, sequential, selective parallel)
- Update K2 reasoning prompt to evaluate task orderings as part of strategy optimization
- Display task sequence timelines in Plan Cards via Gantt timeline (already exists)
- Add task input UI to ScenarioPanel component

**Tech Stack:** FastAPI (backend), Pydantic (validation), React (frontend), K2 Think V2 API (reasoning)

---

## **BACKEND IMPLEMENTATION**

### Task 1: Create Task Library & Data Model

**Files:**
- Create: `backend/task_library.py`
- Modify: `backend/main.py:34-50` (ScenarioInput model)

**Step 1: Write task library file with task definitions**

```python
# backend/task_library.py
from typing import List, Dict, Any, Set
from dataclasses import dataclass

@dataclass
class Task:
    """Represents a single turnaround task"""
    task_id: str
    name: str
    estimated_duration_min: int  # minimum duration in minutes
    estimated_duration_max: int
    category: str  # "service", "cargo", "refuel", "safety", "inspection"
    can_parallelize: bool  # Can run simultaneously with other tasks
    blocked_by: Set[str]  # Task IDs that must complete before this
    blocks: Set[str]  # Task IDs that cannot start until this completes
    apu_dependent: bool  # Does this require APU power
    safety_critical: bool  # ICAO-regulated task

# Standard Aviation Turnaround Task Library
TASK_LIBRARY: Dict[str, Task] = {
    "refueling": Task(
        task_id="refueling",
        name="Refueling",
        estimated_duration_min=15,
        estimated_duration_max=30,
        category="refuel",
        can_parallelize=True,
        blocked_by=set(),
        blocks={"boarding"},  # Cannot board while refueling (safety)
        apu_dependent=False,
        safety_critical=True
    ),
    "cargo_unload": Task(
        task_id="cargo_unload",
        name="Cargo Unloading",
        estimated_duration_min=20,
        estimated_duration_max=40,
        category="cargo",
        can_parallelize=False,  # Exclusive access to cargo door
        blocked_by=set(),
        blocks={"boarding", "catering"},  # Must unload before serving passengers
        apu_dependent=False,
        safety_critical=False
    ),
    "cargo_load": Task(
        task_id="cargo_load",
        name="Cargo Loading",
        estimated_duration_min=15,
        estimated_duration_max=30,
        category="cargo",
        can_parallelize=False,
        blocked_by={"cargo_unload"},
        blocks={"boarding", "door_close"},
        apu_dependent=False,
        safety_critical=False
    ),
    "boarding": Task(
        task_id="boarding",
        name="Passenger Boarding",
        estimated_duration_min=15,
        estimated_duration_max=45,
        category="service",
        can_parallelize=False,
        blocked_by={"refueling", "cargo_unload", "cleaning"},
        blocks={"door_close", "pushback"},
        apu_dependent=False,
        safety_critical=False
    ),
    "catering": Task(
        task_id="catering",
        name="Catering/Provisioning",
        estimated_duration_min=10,
        estimated_duration_max=25,
        category="service",
        can_parallelize=True,
        blocked_by={"cargo_unload"},
        blocks=set(),
        apu_dependent=False,
        safety_critical=False
    ),
    "cleaning": Task(
        task_id="cleaning",
        name="Aircraft Cleaning",
        estimated_duration_min=10,
        estimated_duration_max=20,
        category="service",
        can_parallelize=True,
        blocked_by=set(),
        blocks={"boarding"},
        apu_dependent=True,
        safety_critical=False
    ),
    "safety_inspection": Task(
        task_id="safety_inspection",
        name="Safety Inspection",
        estimated_duration_min=5,
        estimated_duration_max=15,
        category="inspection",
        can_parallelize=False,
        blocked_by={"boarding", "cargo_load", "catering"},
        blocks={"pushback"},
        apu_dependent=False,
        safety_critical=True
    ),
    "deice_antiice": Task(
        task_id="deice_antiice",
        name="De-ice/Anti-ice Treatment",
        estimated_duration_min=10,
        estimated_duration_max=20,
        category="service",
        can_parallelize=False,
        blocked_by=set(),
        blocks={"pushback"},
        apu_dependent=False,
        safety_critical=True  # Weather-dependent
    ),
    "power_cooling": Task(
        task_id="power_cooling",
        name="Ground Power/Cooling Setup",
        estimated_duration_min=5,
        estimated_duration_max=10,
        category="service",
        can_parallelize=True,
        blocked_by=set(),
        blocks=set(),
        apu_dependent=False,
        safety_critical=False
    ),
    "door_close": Task(
        task_id="door_close",
        name="Door Closure & Safety Check",
        estimated_duration_min=3,
        estimated_duration_max=5,
        category="safety",
        can_parallelize=False,
        blocked_by={"boarding", "cargo_load"},
        blocks={"pushback"},
        apu_dependent=False,
        safety_critical=True
    ),
}

def get_task(task_id: str) -> Task:
    """Get task definition by ID"""
    if task_id not in TASK_LIBRARY:
        raise ValueError(f"Unknown task: {task_id}")
    return TASK_LIBRARY[task_id]

def get_common_presets() -> Dict[str, List[str]]:
    """Return common task combinations by aircraft type"""
    return {
        "A320_standard": ["refueling", "cargo_unload", "cargo_load", "catering", "cleaning", "boarding", "safety_inspection", "door_close"],
        "B787_standard": ["refueling", "cargo_unload", "cargo_load", "catering", "cleaning", "power_cooling", "boarding", "safety_inspection", "door_close"],
        "regional_basic": ["refueling", "boarding", "cleaning", "safety_inspection", "door_close"],
    }
```

**Step 2: Verify imports work correctly**

Run: `cd backend && python -c "from task_library import TASK_LIBRARY; print(f'Loaded {len(TASK_LIBRARY)} tasks')"`
Expected: `Loaded 10 tasks`

**Step 3: Update ScenarioInput model in main.py**

```python
# In backend/main.py, update the ScenarioInput class:

from typing import Optional, List

class TaskSequenceRequest(BaseModel):
    task_id: str
    required: bool = True

class ScenarioInput(BaseModel):
    aircraft_type: str = "A320"
    gate: str = "B12"
    scheduled_departure: Optional[str] = None
    delays: Optional[Dict[str, int]] = None
    weather: Optional[str] = None
    ground_power_available: bool = True
    selected_tasks: Optional[List[TaskSequenceRequest]] = None  # NEW: task sequencing input
```

**Step 4: Commit**

```bash
cd backend
git add task_library.py main.py
git commit -m "feat: add task library and task sequencing data model"
```

---

### Task 2: Create Task Sequencing Engine

**Files:**
- Create: `backend/task_sequencer.py`

**Step 1: Write task sequencing logic**

```python
# backend/task_sequencer.py
from typing import List, Dict, Any, Set, Tuple
from task_library import Task, get_task, TASK_LIBRARY
import itertools

class TaskSequenceValidator:
    """Validates task sequences respect dependencies and constraints"""
    
    @staticmethod
    def is_valid_sequence(task_ids: List[str]) -> Tuple[bool, str]:
        """
        Check if a sequence respects all dependencies.
        Returns (is_valid, error_message)
        """
        completed: Set[str] = set()
        
        for task_id in task_ids:
            task = get_task(task_id)
            
            # Check if all blocked_by tasks are completed
            unmet_deps = task.blocked_by - completed
            if unmet_deps:
                return False, f"Task {task_id} requires {unmet_deps} to complete first"
            
            completed.add(task_id)
        
        return True, ""
    
    @staticmethod
    def get_critical_path(task_ids: List[str]) -> List[str]:
        """
        Find the longest dependency chain (critical path).
        This determines minimum possible turnaround time.
        """
        # Simple implementation: topological sort with longest path
        memo = {}
        
        def longest_path_from(task_id: str) -> int:
            if task_id in memo:
                return memo[task_id]
            
            task = get_task(task_id)
            # Find tasks that depend on this one
            dependent_tasks = [t for t in task_ids if task_id in get_task(t).blocked_by]
            
            if not dependent_tasks:
                length = task.estimated_duration_max
            else:
                length = task.estimated_duration_max + max(longest_path_from(dt) for dt in dependent_tasks)
            
            memo[task_id] = length
            return length
        
        # Find the task that starts the critical path
        critical_length = max(longest_path_from(t) for t in task_ids)
        return critical_length


class TaskSequencer:
    """Generates task sequences based on strategy"""
    
    def __init__(self, task_ids: List[str]):
        self.task_ids = task_ids
        self.tasks = {tid: get_task(tid) for tid in task_ids}
        self.validator = TaskSequenceValidator()
    
    def generate_delay_minimizing_sequence(self) -> List[str]:
        """
        Aggressive parallel execution.
        Strategy: Start as many tasks as possible simultaneously.
        """
        sequence = []
        completed: Set[str] = set()
        remaining: Set[str] = set(self.task_ids)
        
        while remaining:
            # Find all tasks ready to run (dependencies met)
            ready = []
            for task_id in remaining:
                task = self.tasks[task_id]
                if task.blocked_by.issubset(completed):
                    ready.append(task_id)
            
            if not ready:
                raise ValueError(f"Circular dependency detected in {remaining}")
            
            # For delay-minimizing: prioritize tasks that are NOT parallelizable
            # (finish them first to free up resources)
            ready.sort(key=lambda t: (self.tasks[t].can_parallelize, self.tasks[t].estimated_duration_max))
            
            sequence.extend(ready)
            completed.update(ready)
            remaining -= set(ready)
        
        return sequence
    
    def generate_fuel_minimizing_sequence(self) -> List[str]:
        """
        Strictly sequential execution.
        Strategy: Minimize APU usage by doing tasks one at a time.
        """
        sequence = []
        completed: Set[str] = set()
        remaining: Set[str] = set(self.task_ids)
        
        # Prioritize APU-dependent tasks late in sequence
        task_priority = {}
        for task_id in self.task_ids:
            task = self.tasks[task_id]
            # Lower score = higher priority (done first)
            task_priority[task_id] = (task.apu_dependent, task.estimated_duration_max)
        
        while remaining:
            ready = []
            for task_id in remaining:
                task = self.tasks[task_id]
                if task.blocked_by.issubset(completed):
                    ready.append(task_id)
            
            if not ready:
                raise ValueError(f"Circular dependency in {remaining}")
            
            # Sequential: pick ONE task at a time
            # Prefer non-APU tasks first
            ready.sort(key=lambda t: task_priority[t])
            chosen = ready[0]
            
            sequence.append(chosen)
            completed.add(chosen)
            remaining.remove(chosen)
        
        return sequence
    
    def generate_balanced_sequence(self) -> List[str]:
        """
        Selective parallel execution.
        Strategy: Balance APU usage with completion time.
        """
        sequence = []
        completed: Set[str] = set()
        remaining: Set[str] = set(self.task_ids)
        
        while remaining:
            ready = []
            for task_id in remaining:
                task = self.tasks[task_id]
                if task.blocked_by.issubset(completed):
                    ready.append(task_id)
            
            if not ready:
                raise ValueError(f"Circular dependency in {remaining}")
            
            # Balanced: pick non-APU-dependent tasks, then one more
            non_apu = [t for t in ready if not self.tasks[t].apu_dependent]
            apu_tasks = [t for t in ready if self.tasks[t].apu_dependent]
            
            if non_apu:
                # Add all non-APU-dependent tasks
                sequence.extend(sorted(non_apu, key=lambda t: self.tasks[t].estimated_duration_max))
                completed.update(non_apu)
                remaining -= set(non_apu)
            elif apu_tasks:
                # Add ONE APU task
                apu_tasks.sort(key=lambda t: self.tasks[t].estimated_duration_max, reverse=True)
                chosen = apu_tasks[0]
                sequence.append(chosen)
                completed.add(chosen)
                remaining.remove(chosen)
        
        return sequence
    
    def calculate_sequence_timeline(self, sequence: List[str]) -> List[Dict[str, Any]]:
        """
        Generate timeline with start/end times for a sequence.
        Respects parallelization rules.
        """
        timeline = []
        task_end_times = {}  # track when each task completes
        
        for task_id in sequence:
            task = self.tasks[task_id]
            
            # Calculate earliest start time based on dependencies
            earliest_start = 0
            for blocked_by_id in task.blocked_by:
                if blocked_by_id in task_end_times:
                    earliest_start = max(earliest_start, task_end_times[blocked_by_id])
            
            # Duration varies; use middle estimate
            duration = (task.estimated_duration_min + task.estimated_duration_max) // 2
            end_time = earliest_start + duration
            
            timeline.append({
                "task_id": task_id,
                "task_name": task.name,
                "start_minute": earliest_start,
                "end_minute": end_time,
                "duration_minutes": duration,
                "apu_required": task.apu_dependent,
            })
            
            task_end_times[task_id] = end_time
        
        return timeline
```

**Step 2: Test task sequencer with sample data**

```python
# Create a quick test
from task_sequencer import TaskSequencer

sample_tasks = ["refueling", "boarding", "cleaning", "catering"]
seq = TaskSequencer(sample_tasks)

delay_seq = seq.generate_delay_minimizing_sequence()
fuel_seq = seq.generate_fuel_minimizing_sequence()
balanced_seq = seq.generate_balanced_sequence()

print(f"Delay-minimizing: {delay_seq}")
print(f"Fuel-minimizing: {fuel_seq}")
print(f"Balanced: {balanced_seq}")

timeline = seq.calculate_sequence_timeline(balanced_seq)
for item in timeline:
    print(f"  {item['task_name']}: {item['start_minute']}-{item['end_minute']} min")
```

**Step 3: Run test to verify logic works**

Run: `cd backend && python -c "from task_sequencer import TaskSequencer; seq = TaskSequencer(['refueling', 'boarding', 'cleaning']); print(seq.generate_delay_minimizing_sequence())"`
Expected: A valid sequence like `['refueling', 'cleaning', 'boarding']`

**Step 4: Commit**

```bash
cd backend
git add task_sequencer.py
git commit -m "feat: implement task sequencing engine with 3 strategies"
```

---

### Task 3: Integrate Task Sequencing into Counterfactual Generation

**Files:**
- Modify: `backend/counterfactual.py` (entire file)

**Step 1: Update counterfactual.py to use task sequences**

```python
# backend/counterfactual.py
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

    for task in scenario["tasks"]:
        if task["category"] in ("service", "cargo"):
            task["duration_min"] = max(5, int(task["duration_min"] * 0.85))

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

    for task in scenario["tasks"]:
        if task["category"] in ("service", "cargo"):
            task["duration_min"] = int(task["duration_min"] * 1.15)

    scenario["apu_always_on"] = False
    scenario["parallel_operations_allowed"] = False
    scenario["max_apu_minutes"] = 15

    return scenario


def _create_balanced_scenario(scenario: Dict[str, Any]) -> Dict[str, Any]:
    scenario["strategy_modifications"] = {
        "task_sequencing": "selective_parallel",
        "apu_policy": "moderate_usage",
        "delay_tolerance": "moderate",
        "ground_power_preference": "balance",
        "buffer_time_increase": 0.15,
    }

    for task in scenario.get("tasks", []):
        if task.get("category") in ("service", "cargo"):
            factor = 0.95 + (0.1 * (task.get("duration_min", 10) % 10 / 10))
            task["duration_min"] = int(task["duration_min"] * factor)

    scenario["apu_always_on"] = False
    scenario["parallel_operations_allowed"] = True

    return scenario
```

**Step 2: Verify counterfactual.py still works**

Run: `cd backend && python -c "from counterfactual import generate_counterfactual_scenarios; from data_generator import generate_base_scenario; scenario = generate_base_scenario({}); result = generate_counterfactual_scenarios(scenario); print(f'Generated {len(result)} scenarios')"`
Expected: `Generated 3 scenarios`

**Step 3: Commit**

```bash
cd backend
git add counterfactual.py
git commit -m "feat: integrate task sequencing into counterfactual scenario generation"
```

---

### Task 4: Update K2 Reasoning Prompt for Task Sequences

**Files:**
- Modify: `backend/reasoning.py:35-100` (build_reasoning_prompt function)

**Step 1: Enhance the K2 prompt to include task sequencing**

```python
# In backend/reasoning.py, update build_reasoning_prompt():

def build_reasoning_prompt(
    base_scenario: Dict[str, Any],
    counterfactual_scenarios: List[Dict[str, Any]],
) -> str:
    tasks_data = base_scenario.get("tasks", [])
    
    fuel_delay = next((t.get("delay_minutes", 0) for t in tasks_data if t.get("name") == "Fueling"), 0)
    catering_delay = next((t.get("delay_minutes", 0) for t in tasks_data if "Catering" in t.get("name", "")), 0)
    baggage_delay = next((t.get("delay_minutes", 0) for t in tasks_data if "Baggage" in t.get("name", "")), 0)
    
    weather = base_scenario.get("weather", {})
    weather_str = weather.get("condition", "Clear")
    temp_effect = "Standard operations" if weather_str == "Clear" else f"{weather.get('delay_factor', 1.0)}x delay factor"
    ground_power_status = "Available" if base_scenario.get("ground_power_available") else "UNAVAILABLE - APU required"
    
    aircraft = base_scenario.get("aircraft_specs", {})
    disruption = base_scenario.get("disruption", {})
    
    # NEW: Build task sequence information
    task_sequences_text = ""
    if counterfactual_scenarios and any(s.get("scenario", {}).get("task_timeline") for s in counterfactual_scenarios):
        task_sequences_text = "\n## TASK SEQUENCING ANALYSIS\n\n"
        for i, cf_scenario in enumerate(counterfactual_scenarios):
            scenario_data = cf_scenario.get("scenario", {})
            timeline = scenario_data.get("task_timeline", [])
            if timeline:
                task_sequences_text += f"### Strategy {cf_scenario['id']}: {cf_scenario['strategy']}\n"
                task_sequences_text += f"Total Turnaround Time: {timeline[-1]['end_minute'] if timeline else 0} minutes\n"
                task_sequences_text += "Task Sequence:\n"
                for item in timeline:
                    apu_note = " (APU)" if item['apu_required'] else ""
                    task_sequences_text += f"  - {item['task_name']}: {item['start_minute']}-{item['end_minute']} min{apu_note}\n"
                task_sequences_text += "\n"
    
    prompt = f"""You are given a real-world aircraft turnaround scenario.

## BASE SCENARIO
Aircraft: {base_scenario['aircraft_type']}
Gate: {base_scenario['gate']}
Scheduled Departure: {base_scenario['scheduled_departure']}

Delays:
- Fueling: {fuel_delay} minutes
- Catering: {catering_delay} minutes
- Baggage: {baggage_delay} minutes

Environment:
- Weather: {weather_str}
- Temperature impact: {temp_effect}
- Ground power availability: {ground_power_status}

{'- Disruption: ' + disruption.get('name', '') + ' - ' + disruption.get('description', '') if disruption else ''}

---

## COUNTERFACTUAL STRATEGIES

You must evaluate THREE distinct strategies:

### Strategy A: Delay-Minimizing
Prioritize on-time departure, even if APU usage increases.
Task sequencing: Aggressive parallel operations to minimize idle time.

### Strategy B: Fuel-Minimizing
Minimize APU usage and fuel burn, even if departure is delayed.
Task sequencing: Sequential operations to reduce standby and idle consumption.

### Strategy C: Balanced Strategy
Balance delay and fuel efficiency.
Task sequencing: Selective parallel operations with moderate resource allocation.

{task_sequences_text}

---

## CONSTRAINTS

- ICAO safety rules must NEVER be violated
- Certain operations cannot overlap (e.g., fueling and unsafe concurrent tasks)
- APU usage increases fuel consumption and emissions
- Ground resource limitations must be respected
- Task dependencies must be satisfied (e.g., cargo unload before boarding)

---

## TASK

Analyze each strategy's approach to task sequencing and operational efficiency.
For each plan, evaluate:

1. **Task Sequencing Optimality**: Does the sequence minimize idle time while respecting constraints?
2. **APU Usage**: How much time does the aircraft need APU power?
3. **Total Turnaround Time**: How long from arrival to pushback?
4. **Safety Compliance**: Do all operations respect ICAO rules?
5. **Operational Practicality**: Is this sequence realistic for ground crews?

Then recommend which strategy best serves the overall operational objective.
"""
    
    return prompt
```

**Step 2: Test the updated prompt**

Run: `cd backend && python -c "from reasoning import build_reasoning_prompt; from data_generator import generate_base_scenario; from counterfactual import generate_counterfactual_scenarios; scenario = generate_base_scenario({}); cf = generate_counterfactual_scenarios(scenario, ['refueling', 'boarding']); prompt = build_reasoning_prompt(scenario, cf); print('Prompt length:', len(prompt))"`
Expected: `Prompt length: [some reasonable number > 1000]`

**Step 3: Commit**

```bash
cd backend
git add reasoning.py
git commit -m "feat: enhance K2 reasoning prompt to analyze task sequencing"
```

---

### Task 5: Update /api/optimize Endpoint

**Files:**
- Modify: `backend/main.py:100-150` (optimize endpoint)

**Step 1: Update the optimize endpoint to pass task IDs**

```python
# In backend/main.py, update the /api/optimize endpoint:

@app.post("/api/optimize")
async def optimize(request: OptimizationRequest):
    try:
        # Generate base scenario
        if request.use_disruption:
            base_scenario = generate_disruption_scenario(request.disruption_name)
        else:
            base_scenario = generate_base_scenario(request.scenario)
        
        # Extract task IDs from request if provided
        task_ids = None
        if request.scenario.selected_tasks:
            task_ids = [t.task_id for t in request.scenario.selected_tasks if t.required]
        
        # Generate counterfactual scenarios WITH task sequencing
        counterfactual_scenarios = generate_counterfactual_scenarios(base_scenario, task_ids)
        
        # Build reasoning prompt (now includes task sequences)
        reasoning_prompt = build_reasoning_prompt(base_scenario, counterfactual_scenarios)
        
        # Call K2 API
        k2_response = k2_client.reason(reasoning_prompt)
        
        # Validate and parse response
        optimizer_comparison = validate_response(k2_response)
        
        # Score and compare plans
        plans_with_scores = []
        for cf_scenario in counterfactual_scenarios:
            plan = {
                "plan_id": cf_scenario["id"],
                "strategy": cf_scenario["strategy"],
                "description": cf_scenario["description"],
                "scenario_data": cf_scenario["scenario"],
                "task_sequence": cf_scenario["scenario"].get("task_sequence", []),
                "task_timeline": cf_scenario["scenario"].get("task_timeline", []),
            }
            plans_with_scores.append(plan)
        
        selected_plan = compare_with_ai_selection(plans_with_scores, optimizer_comparison)
        
        return {
            "base_scenario": base_scenario,
            "counterfactual_scenarios": counterfactual_scenarios,
            "plans": plans_with_scores,
            "selected_plan": selected_plan,
            "optimizer_comparison": optimizer_comparison,
            "comparison": {
                "metrics": ["Delay (min)", "APU Usage (min)", "On-Time %", "Fuel Cost ($)"],
                "plans": {plan["plan_id"]: plan["scenario_data"] for plan in plans_with_scores}
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

**Step 2: Test the endpoint with curl**

Run: 
```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": {
      "aircraft_type": "A320",
      "gate": "B12",
      "selected_tasks": [
        {"task_id": "refueling", "required": true},
        {"task_id": "boarding", "required": true},
        {"task_id": "cleaning", "required": true}
      ]
    },
    "use_disruption": false
  }'
```

Expected: Returns JSON with plans including `task_sequence` and `task_timeline` fields.

**Step 3: Commit**

```bash
cd backend
git add main.py
git commit -m "feat: update optimize endpoint to include task sequencing"
```

---

## **FRONTEND IMPLEMENTATION**

### Task 6: Add Task Selection to ScenarioPanel

**Files:**
- Modify: `frontend/src/components/ScenarioPanel.jsx`

**Step 1: Update ScenarioPanel to show task checkboxes**

```jsx
// frontend/src/components/ScenarioPanel.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const TASK_LIBRARY = {
  refueling: { name: 'Refueling', duration: '15-30 min' },
  cargo_unload: { name: 'Cargo Unload', duration: '20-40 min' },
  cargo_load: { name: 'Cargo Load', duration: '15-30 min' },
  boarding: { name: 'Passenger Boarding', duration: '15-45 min' },
  catering: { name: 'Catering', duration: '10-25 min' },
  cleaning: { name: 'Aircraft Cleaning', duration: '10-20 min' },
  safety_inspection: { name: 'Safety Inspection', duration: '5-15 min' },
  deice_antiice: { name: 'De-ice/Anti-ice', duration: '10-20 min' },
  power_cooling: { name: 'Ground Power/Cooling', duration: '5-10 min' },
  door_close: { name: 'Door Closure', duration: '3-5 min' },
};

const PRESET_COMBINATIONS = {
  A320_standard: ['refueling', 'cargo_unload', 'cargo_load', 'catering', 'cleaning', 'boarding', 'safety_inspection', 'door_close'],
  B787_standard: ['refueling', 'cargo_unload', 'cargo_load', 'catering', 'cleaning', 'power_cooling', 'boarding', 'safety_inspection', 'door_close'],
  regional_basic: ['refueling', 'boarding', 'cleaning', 'safety_inspection', 'door_close'],
};

export function ScenarioPanel({ config, onGenerate, onOptimize, isLoading }) {
  const [aircraftType, setAircraftType] = useState('A320');
  const [gate, setGate] = useState('B12');
  const [departure, setDeparture] = useState('14:30');
  const [weather, setWeather] = useState('Clear');
  const [groundPower, setGroundPower] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState(new Set(PRESET_COMBINATIONS.A320_standard));
  const [showTaskPanel, setShowTaskPanel] = useState(false);

  // Update tasks when aircraft type changes
  useEffect(() => {
    const presetKey = `${aircraftType}_standard`;
    if (PRESET_COMBINATIONS[presetKey]) {
      setSelectedTasks(new Set(PRESET_COMBINATIONS[presetKey]));
    }
  }, [aircraftType]);

  const toggleTask = (taskId) => {
    const newTasks = new Set(selectedTasks);
    if (newTasks.has(taskId)) {
      newTasks.delete(taskId);
    } else {
      newTasks.add(taskId);
    }
    setSelectedTasks(newTasks);
  };

  const handleOptimize = async () => {
    const formData = {
      aircraft_type: aircraftType,
      gate,
      scheduled_departure: departure,
      weather,
      ground_power_available: groundPower,
      selected_tasks: Array.from(selectedTasks).map(tid => ({ task_id: tid, required: true })),
    };
    
    await onOptimize(formData, false, null);
  };

  return (
    <div className="bg-aero-card rounded-lg p-6 border border-gray-700 space-y-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <span>⚙️</span>
        Scenario Configuration
      </h2>

      {/* Aircraft Type */}
      <div>
        <label className="text-xs font-semibold text-gray-300 mb-2 block">Aircraft Type</label>
        <select
          value={aircraftType}
          onChange={(e) => setAircraftType(e.target.value)}
          className="w-full bg-aero-dark border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-aero-accent focus:outline-none"
        >
          {config?.aircraft?.map(ac => <option key={ac} value={ac}>{ac}</option>)}
        </select>
      </div>

      {/* Gate */}
      <div>
        <label className="text-xs font-semibold text-gray-300 mb-2 block">Gate</label>
        <input
          type="text"
          value={gate}
          onChange={(e) => setGate(e.target.value)}
          className="w-full bg-aero-dark border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-aero-accent focus:outline-none"
          placeholder="B12"
        />
      </div>

      {/* Departure */}
      <div>
        <label className="text-xs font-semibold text-gray-300 mb-2 block">Scheduled Departure</label>
        <input
          type="text"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          className="w-full bg-aero-dark border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-aero-accent focus:outline-none"
          placeholder="14:30"
        />
      </div>

      {/* Weather */}
      <div>
        <label className="text-xs font-semibold text-gray-300 mb-2 block">Weather</label>
        <select
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          className="w-full bg-aero-dark border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-aero-accent focus:outline-none"
        >
          {config?.weather?.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
        </select>
      </div>

      {/* Ground Power */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="groundPower"
          checked={groundPower}
          onChange={(e) => setGroundPower(e.target.checked)}
          className="w-4 h-4 rounded border-gray-600"
        />
        <label htmlFor="groundPower" className="text-xs text-gray-300">Ground Power Available</label>
      </div>

      {/* Task Selection Toggle */}
      <div>
        <button
          onClick={() => setShowTaskPanel(!showTaskPanel)}
          className="w-full text-left text-xs font-semibold text-aero-accent hover:text-cyan-300 py-2 px-2 rounded border border-aero-accent/30 hover:border-aero-accent/60 transition-colors"
        >
          {showTaskPanel ? '▼' : '▶'} Turnaround Tasks ({selectedTasks.size} selected)
        </button>
        
        {showTaskPanel && (
          <div className="mt-3 space-y-2 bg-aero-dark/50 p-3 rounded border border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TASK_LIBRARY).map(([taskId, taskInfo]) => (
                <label key={taskId} className="flex items-start gap-2 cursor-pointer hover:bg-aero-dark/80 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(taskId)}
                    onChange={() => toggleTask(taskId)}
                    className="w-3 h-3 mt-0.5 rounded border-gray-600"
                  />
                  <div className="text-xs">
                    <div className="text-gray-200">{taskInfo.name}</div>
                    <div className="text-gray-500 text-[10px]">{taskInfo.duration}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => onGenerate(
            {
              aircraft_type: aircraftType,
              gate,
              scheduled_departure: departure,
              weather,
              ground_power_available: groundPower,
              selected_tasks: Array.from(selectedTasks).map(tid => ({ task_id: tid, required: true })),
            },
            false,
            null
          )}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
        >
          Generate
        </button>
        <button
          onClick={handleOptimize}
          disabled={isLoading}
          className="px-4 py-2 bg-aero-accent hover:bg-cyan-400 text-aero-dark font-bold rounded transition-colors disabled:opacity-50"
        >
          Run Optimization
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Test the component renders**

Run: `npm run dev` in frontend directory and check the ScenarioPanel loads without errors.

**Step 3: Commit**

```bash
cd frontend
git add src/components/ScenarioPanel.jsx
git commit -m "feat: add task selection panel to scenario configuration"
```

---

### Task 7: Update PlanCard to Display Task Sequences

**Files:**
- Modify: `frontend/src/components/PlanCard.jsx`

**Step 1: Update PlanCard to show task sequence summary**

```jsx
// frontend/src/components/PlanCard.jsx
import React from 'react';

export function PlanCard({ plan, isSelected }) {
  const scenario = plan.scenario_data || plan.scenario || {};
  const timeline = plan.task_timeline || [];
  
  // Calculate total turnaround time
  const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].end_minute : 0;
  
  // Count APU tasks
  const apuTaskCount = timeline.filter(t => t.apu_required).length;

  return (
    <div
      className={`rounded-lg p-4 border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-aero-accent bg-aero-accent/10'
          : 'border-gray-700 bg-aero-card hover:border-aero-accent/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`text-xs font-bold px-2 py-1 rounded w-fit ${
            plan.plan_id === 'A' ? 'bg-blue-900/50 text-blue-300' :
            plan.plan_id === 'B' ? 'bg-green-900/50 text-green-300' :
            'bg-purple-900/50 text-purple-300'
          }`}>
            Plan {plan.plan_id}
          </div>
          <h3 className="text-lg font-bold text-white mt-2">{plan.strategy}</h3>
        </div>
        {isSelected && (
          <div className="text-aero-accent text-2xl">✓</div>
        )}
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-4">
        {totalTime > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Turnaround Time</span>
            <span className="text-aero-accent font-bold">{totalTime} min</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">APU Tasks</span>
          <span className="text-orange-400 font-bold">{apuTaskCount}/{timeline.length}</span>
        </div>

        {scenario.apu_usage_minutes && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">APU Usage</span>
            <span className="text-orange-400 font-bold">{scenario.apu_usage_minutes} min</span>
          </div>
        )}

        {scenario.delay_minutes !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Est. Delay</span>
            <span className={scenario.delay_minutes > 0 ? 'text-aero-warning font-bold' : 'text-aero-success font-bold'}>
              {scenario.delay_minutes > 0 ? `+${scenario.delay_minutes} min` : 'On-time'}
            </span>
          </div>
        )}

        {scenario.estimated_cost && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Fuel Cost</span>
            <span className="text-green-400 font-bold">${scenario.estimated_cost}</span>
          </div>
        )}
      </div>

      {/* Task Sequence Preview */}
      {timeline.length > 0 && (
        <div className="bg-aero-dark/50 rounded p-2 mb-3 border border-gray-700/50">
          <div className="text-xs text-gray-400 font-semibold mb-2">Task Sequence:</div>
          <div className="space-y-1">
            {timeline.slice(0, 3).map((task, idx) => (
              <div key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                <span className="text-gray-500">{idx + 1}.</span>
                <span>{task.task_name}</span>
                <span className="text-gray-600">({task.duration_minutes}m)</span>
              </div>
            ))}
            {timeline.length > 3 && (
              <div className="text-xs text-gray-500 italic">+{timeline.length - 3} more tasks</div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed mb-3">
        {plan.description}
      </p>

      {/* K2 Status */}
      {scenario.strategy_modifications && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
          <span className="text-aero-accent text-xs font-semibold">K2 Reasoning</span>
          <span className="text-gray-500 text-xs">{scenario.strategy_modifications.task_sequencing}</span>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Test the component**

Visual inspection when running `npm run dev`.

**Step 3: Commit**

```bash
cd frontend
git add src/components/PlanCard.jsx
git commit -m "feat: display task sequence summary in plan cards"
```

---

### Task 8: Update GanttTimeline to Show Task Details

**Files:**
- Modify: `frontend/src/components/GanttTimeline.jsx` (add task timeline rendering)

**Step 1: Check existing GanttTimeline structure**

```bash
cd frontend
grep -n "export function GanttTimeline" src/components/GanttTimeline.jsx | head -5
```

**Step 2: Update to include task sequence visualization**

```jsx
// In frontend/src/components/GanttTimeline.jsx, add this to the component:

{/* Task Sequence Timeline (if available) */}
{selectedPlan?.task_timeline && selectedPlan.task_timeline.length > 0 && (
  <div className="mt-6 space-y-2">
    <h4 className="text-sm font-semibold text-white mb-3">Task Sequence Timeline</h4>
    {selectedPlan.task_timeline.map((task, idx) => (
      <div key={idx} className="flex items-center gap-3">
        <div className="w-32 text-xs text-gray-400 truncate">{task.task_name}</div>
        <div className="flex-1 bg-gray-800 rounded h-6 relative overflow-hidden">
          <div
            className={`h-full rounded flex items-center justify-center text-xs font-semibold transition-all ${
              task.apu_required
                ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-orange-100'
                : 'bg-gradient-to-r from-aero-accent/70 to-cyan-400 text-aero-dark'
            }`}
            style={{
              width: `${(task.duration_minutes / (selectedPlan.task_timeline[selectedPlan.task_timeline.length - 1]?.end_minute || 100)) * 100}%`,
              marginLeft: `${(task.start_minute / (selectedPlan.task_timeline[selectedPlan.task_timeline.length - 1]?.end_minute || 100)) * 100}%`,
            }}
          >
            {task.duration_minutes}m
          </div>
        </div>
        <div className="w-16 text-xs text-gray-500 text-right">{task.start_minute}-{task.end_minute}m</div>
      </div>
    ))}
  </div>
)}
```

**Step 3: Commit**

```bash
cd frontend
git add src/components/GanttTimeline.jsx
git commit -m "feat: visualize task sequence timeline in Gantt view"
```

---

### Task 9: Update API Service to Handle Task Sequences

**Files:**
- Modify: `frontend/src/services/api.js`

**Step 1: Ensure api.js handles task sequences in requests**

The existing `api.js` should already pass through `selected_tasks` in the scenario object. Verify by checking the `optimize` function handles the full request object.

Run: `grep -A10 "async optimize" frontend/src/services/api.js`

This should already work. If not, update the optimize call to ensure it includes selected_tasks.

**Step 2: Commit**

```bash
cd frontend
git add src/services/api.js
git commit -m "feat: api service passes task sequences in requests"
```

---

## **Documentation & Testing**

### Task 10: Create Design Document

**Files:**
- Create: `docs/plans/2025-04-06-integrated-task-sequencing-DESIGN.md`

**Step 1: Write design documentation**

```markdown
# Integrated Task Sequencing in Counterfactual Scenarios - Design Document

## Executive Summary

This design document describes the integration of dynamic task sequencing into Aero-Logic's counterfactual reasoning engine. Instead of treating task sequencing as a separate feature, it becomes an integral part of how each counterfactual strategy is constructed and evaluated.

**Key Innovation:** K2 Think V2 now reasons over task ordering permutations within each strategy, demonstrating higher-level intelligence: deriving optimal operational workflows from stated goals (e.g., "minimize delay" → generates best task order for that goal).

## Architecture Overview

### Data Flow

```
User Input
  ├─ Aircraft, Gate, Weather, etc.
  └─ Selected Tasks (refuel, catering, boarding, etc.)
       ↓
Scenario Generation
       ↓
Task Sequencing Engine
  ├─ Plan A: Delay-Minimizing Sequence
  ├─ Plan B: Fuel-Minimizing Sequence
  └─ Plan C: Balanced Sequence
       ↓
K2 Think V2 Reasoning
  (Analyzes task orderings + operational constraints)
       ↓
Output: 3 Plans with Timelines
```

### Key Components

1. **Task Library** (`backend/task_library.py`)
   - Defines 10 standard aviation turnaround tasks
   - Specifies dependencies (e.g., refuel blocks boarding)
   - Tracks APU requirements, durations, parallelization rules

2. **Task Sequencer** (`backend/task_sequencer.py`)
   - Generates valid sequences respecting dependencies
   - 3 strategies: aggressive parallel, strictly sequential, selective parallel
   - Produces timeline with start/end times for each task

3. **Counterfactual Integration** (`backend/counterfactual.py`)
   - Passes task sequencing output into counterfactual scenarios
   - Each plan now includes `task_sequence` and `task_timeline`

4. **K2 Reasoning** (`backend/reasoning.py`)
   - Enhanced prompt includes task sequence details
   - K2 evaluates task ordering optimality for each strategy

5. **Frontend UI** (`frontend/src/components/`)
   - ScenarioPanel: task selection with presets
   - PlanCard: displays task sequence summary
   - GanttTimeline: visualizes full task sequence with APU dependencies

## Task Dependencies Model

### Dependency Rules

```
Refueling → (blocks) Boarding
Cargo Unload → (blocks) Boarding, Catering
Cargo Load → (blocks) Boarding, Door Close
Cleaning → (blocks) Boarding
Safety Inspection ← (blocked by) Boarding, Cargo Load, Catering
Door Close ← (blocked by) Boarding, Cargo Load
```

### Task Categories

- **Cargo Operations**: Unload, Load (exclusive, sequential)
- **Service**: Catering, Cleaning (parallelizable)
- **Safety**: Refueling, Safety Inspection, Door Close (critical path)
- **Support**: Power/Cooling, De-ice (conditional)

## Strategic Sequencing Approaches

### Strategy A: Delay-Minimizing
- **Goal:** Minimize total turnaround time
- **Approach:** Maximize parallelization of non-blocking tasks
- **APU Policy:** Always on
- **Timeline:** ~40-50 minutes typical A320
- **K2 Evaluation Focus:** Critical path analysis, resource utilization

### Strategy B: Fuel-Minimizing
- **Goal:** Minimize APU usage and fuel burn
- **Approach:** Strictly sequential execution
- **APU Policy:** Minimal usage, maximize ground power
- **Timeline:** ~60-75 minutes typical A320
- **K2 Evaluation Focus:** Idle time reduction, cost optimization

### Strategy C: Balanced
- **Goal:** Optimize across delay + fuel + safety
- **Approach:** Selective parallelization of non-APU tasks
- **APU Policy:** Moderate usage with contingency buffer
- **Timeline:** ~50-60 minutes typical A320
- **K2 Evaluation Focus:** Tradeoff analysis, practical feasibility

## K2 Reasoning Enhancement

### What K2 Evaluates

1. **Sequence Validity** - Do all dependencies hold?
2. **APU Efficiency** - What's the total APU-on duration?
3. **Critical Path** - What's the longest dependency chain?
4. **Parallelization Quality** - Are non-blocking tasks grouped?
5. **Safety Compliance** - Do all operations respect ICAO constraints?
6. **Operational Realism** - Is this practical for ground crews?

### K2 Output Integration

K2's recommendations influence which plan is marked "OPTIMAL", with reasoning like:
- "Plan C selected: Delays crew by 8 min vs Plan A, but reduces fuel cost by 12%, practical for standard operations"

## Frontend Presentation

### Scenario Panel Changes

- **Task Selection:** Expandable list with pre-built presets by aircraft type
- **Presets:** A320 Standard, B787 Standard, Regional Basic
- **Dependencies:** Visual indicators (e.g., red link from "Cargo" to "Boarding")

### Plan Card Enhancements

- **Task Sequence Preview:** First 3 tasks + count
- **Turnaround Time:** Total duration from first to last task
- **APU Count:** How many tasks require APU power

### Gantt Timeline

- **Task Bars:** Color-coded (cyan for normal, orange for APU-dependent)
- **Timeline Labels:** Start-end minutes, duration in minutes
- **Critical Path Highlight:** (future enhancement) Bold the longest chain

## Success Criteria

✅ Task sequences generated respecting all dependency constraints
✅ 3 distinct strategic approaches produce different orderings
✅ K2 can evaluate and reason about task sequencing quality
✅ UI allows users to select tasks and see resulting plans
✅ Timelines are visualized with clear duration and dependency info
✅ System demonstrates "strategic planner" level intelligence to evaluators

## Future Enhancements

1. **Custom Tasks:** Allow users to add tasks not in library
2. **Resource Constraints:** Model concurrent resource limitations (gates, equipment)
3. **Weather Impact:** Adjust task durations based on conditions
4. **Crew Preferences:** Learn preferred sequencing patterns
5. **Historical Data:** Optimize based on actual turnaround times
```

**Step 2: Commit**

```bash
cd docs/plans
git add 2025-04-06-integrated-task-sequencing-DESIGN.md
git commit -m "docs: add design document for integrated task sequencing"
```

---

### Task 11: Integration Testing

**Files:**
- Create: `tests/test_task_sequencing.py`

**Step 1: Write integration tests**

```python
# tests/test_task_sequencing.py
import pytest
from backend.task_sequencer import TaskSequencer, TaskSequenceValidator
from backend.task_library import TASK_LIBRARY, get_task
from backend.counterfactual import generate_counterfactual_scenarios

def test_task_sequencer_valid_sequences():
    """Test that sequencer generates valid sequences"""
    task_ids = ["refueling", "boarding", "cleaning", "catering"]
    sequencer = TaskSequencer(task_ids)
    
    delay_seq = sequencer.generate_delay_minimizing_sequence()
    fuel_seq = sequencer.generate_fuel_minimizing_sequence()
    balanced_seq = sequencer.generate_balanced_sequence()
    
    # All should be valid
    assert TaskSequenceValidator.is_valid_sequence(delay_seq)[0]
    assert TaskSequenceValidator.is_valid_sequence(fuel_seq)[0]
    assert TaskSequenceValidator.is_valid_sequence(balanced_seq)[0]
    
    # All should contain same tasks
    assert set(delay_seq) == set(task_ids)
    assert set(fuel_seq) == set(task_ids)
    assert set(balanced_seq) == set(task_ids)

def test_task_dependencies_respected():
    """Test that cargo_unload blocks boarding"""
    task_ids = ["cargo_unload", "boarding"]
    sequencer = TaskSequencer(task_ids)
    
    # Boarding cannot come before cargo_unload
    seq = sequencer.generate_delay_minimizing_sequence()
    assert seq.index("cargo_unload") < seq.index("boarding")

def test_counterfactual_with_task_sequencing():
    """Test counterfactual scenarios with task IDs"""
    base_scenario = {
        "aircraft_type": "A320",
        "gate": "B12",
        "scheduled_departure": "14:30",
        "tasks": [],
        "weather": {"condition": "Clear"},
        "ground_power_available": True,
    }
    
    task_ids = ["refueling", "boarding", "cleaning"]
    scenarios = generate_counterfactual_scenarios(base_scenario, task_ids)
    
    assert len(scenarios) == 3
    for scenario in scenarios:
        assert "task_sequence" in scenario["scenario"]
        assert "task_timeline" in scenario["scenario"]
        assert len(scenario["scenario"]["task_timeline"]) == 3

def test_timeline_generation():
    """Test that timelines have valid start/end times"""
    task_ids = ["refueling", "boarding", "cleaning"]
    sequencer = TaskSequencer(task_ids)
    sequence = sequencer.generate_delay_minimizing_sequence()
    timeline = sequencer.calculate_sequence_timeline(sequence)
    
    # All tasks should have start < end
    for task in timeline:
        assert task["start_minute"] < task["end_minute"]
        assert task["duration_minutes"] == task["end_minute"] - task["start_minute"]
    
    # Timeline should be sequential in execution (no gaps or overlaps)
    for i in range(1, len(timeline)):
        prev_end = timeline[i-1]["end_minute"]
        curr_start = timeline[i]["start_minute"]
        # Current task starts >= previous task ends
        assert curr_start >= prev_end or timeline[i]["start_minute"] == 0  # allow parallel at start

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

**Step 2: Run tests**

```bash
cd backend
pytest tests/test_task_sequencing.py -v
```

Expected: All tests pass

**Step 3: Commit**

```bash
cd backend
git add tests/test_task_sequencing.py
git commit -m "test: add integration tests for task sequencing"
```

---

## Summary

This plan integrates task sequencing **into** the counterfactual reasoning engine, making it a core part of how K2 Think V2 constructs operational strategies. This demonstrates:

✅ **Combinatorial reasoning** - evaluating ordering permutations
✅ **Constraint satisfaction** - respecting task dependencies
✅ **Strategic planning** - deriving workflows from goals
✅ **Real operational intelligence** - not just output, but decision construction

### Implementation Order

**Backend (6 tasks):** Task library → Sequencer → Counterfactual integration → K2 prompt → API endpoint → Tests
**Frontend (3 tasks):** ScenarioPanel UI → Plan card display → Gantt timeline enhancement

**Total: ~4-6 hours** for experienced developer familiar with codebase

### Key Files Modified

- `backend/task_library.py` (new)
- `backend/task_sequencer.py` (new)
- `backend/counterfactual.py` (enhanced)
- `backend/reasoning.py` (enhanced)
- `backend/main.py` (endpoint update)
- `frontend/src/components/ScenarioPanel.jsx` (task UI)
- `frontend/src/components/PlanCard.jsx` (sequence display)
- `frontend/src/components/GanttTimeline.jsx` (timeline viz)

---

**Plan saved to:** `docs/plans/2025-04-06-integrated-task-sequencing.md`

Now, would you like to:

1. **Subagent-Driven (this session)** - I'll dispatch a fresh subagent per task, review code between tasks
2. **Parallel Session (separate)** - Open new session with executing-plans skill for batch execution

Which approach?