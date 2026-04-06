from typing import List, Dict, Set
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
