import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any


AIRCRAFT_TYPES = {
    "A320": {"turnaround_time": 45, "fuel_capacity": 27200, "passengers": 180, "apu_consumption": 120},
    "A321": {"turnaround_time": 50, "fuel_capacity": 32800, "passengers": 220, "apu_consumption": 130},
    "A330": {"turnaround_time": 60, "fuel_capacity": 139090, "passengers": 335, "apu_consumption": 180},
    "A350": {"turnaround_time": 65, "fuel_capacity": 138000, "passengers": 366, "apu_consumption": 190},
    "A380": {"turnaround_time": 90, "fuel_capacity": 320000, "passengers": 525, "apu_consumption": 280},
    "B737": {"turnaround_time": 45, "fuel_capacity": 26020, "passengers": 189, "apu_consumption": 115},
    "B777": {"turnaround_time": 75, "fuel_capacity": 181280, "passengers": 396, "apu_consumption": 220},
    "B787": {"turnaround_time": 65, "fuel_capacity": 126206, "passengers": 330, "apu_consumption": 185},
}

TURNAROUND_TASKS = [
    {"name": "Deplaning", "duration_min": 15, "dependencies": [], "category": "passenger"},
    {"name": "Safety Inspection", "duration_min": 10, "dependencies": ["Deplaning"], "category": "safety"},
    {"name": "Catering Removal", "duration_min": 20, "dependencies": ["Deplaning"], "category": "service"},
    {"name": "Cleaning", "duration_min": 25, "dependencies": ["Deplaning", "Catering Removal"], "category": "service"},
    {"name": "Catering Loading", "duration_min": 20, "dependencies": ["Cleaning"], "category": "service"},
    {"name": "Fueling", "duration_min": 30, "dependencies": ["Safety Inspection"], "category": "fuel"},
    {"name": "Baggage Unloading", "duration_min": 20, "dependencies": ["Deplaning"], "category": "cargo"},
    {"name": "Baggage Loading", "duration_min": 20, "dependencies": ["Baggage Unloading", "Cleaning"], "category": "cargo"},
    {"name": "Water Service", "duration_min": 10, "dependencies": ["Cleaning"], "category": "service"},
    {"name": "Boarding", "duration_min": 25, "dependencies": ["Cleaning", "Catering Loading", "Safety Inspection"], "category": "passenger"},
    {"name": "Pushback Prep", "duration_min": 5, "dependencies": ["Boarding", "Fueling", "Baggage Loading"], "category": "ops"},
]

WEATHER_CONDITIONS = [
    {"condition": "Clear", "delay_factor": 1.0, "description": "Optimal conditions, no weather impact"},
    {"condition": "Light Rain", "delay_factor": 1.1, "description": "Minor delays for outdoor operations"},
    {"condition": "Thunderstorm", "delay_factor": 1.4, "description": "Significant delays, fueling suspended during lightning"},
    {"condition": "High Wind", "delay_factor": 1.3, "description": "Catering and loading operations slowed"},
    {"condition": "Snow", "delay_factor": 1.5, "description": "De-icing required, all operations delayed"},
    {"condition": "Fog", "delay_factor": 1.15, "description": "Reduced visibility slows ground operations"},
]

DISRUPTION_TEMPLATES = [
    {
        "name": "Fuel Truck Delay",
        "description": "Fuel truck is 25 minutes late to gate",
        "affected_task": "Fueling",
        "delay_minutes": 25,
        "weather_override": None,
    },
    {
        "name": "Weather Ground Stop",
        "description": "Thunderstorm causes 30-minute ground stop",
        "affected_task": None,
        "delay_minutes": 30,
        "weather_override": "Thunderstorm",
    },
    {
        "name": "Catering Shortage",
        "description": "Catering team understaffed, 20-minute delay",
        "affected_task": "Catering Loading",
        "delay_minutes": 20,
        "weather_override": None,
    },
    {
        "name": "Gate Power Unavailable",
        "description": "Ground power unit failure, APU must run entire turnaround",
        "affected_task": None,
        "delay_minutes": 0,
        "weather_override": None,
        "force_apu": True,
    },
    {
        "name": "Baggage System Failure",
        "description": "Baggage handling system malfunction, 15-minute delay",
        "affected_task": "Baggage Unloading",
        "delay_minutes": 15,
        "weather_override": None,
    },
    {
        "name": "De-icing Required",
        "description": "Unexpected snow requires de-icing before departure",
        "affected_task": None,
        "delay_minutes": 20,
        "weather_override": "Snow",
    },
]


def generate_base_scenario(
    aircraft_type: str = "A320",
    gate: str = "B12",
    scheduled_departure: str = None,
    delays: Dict[str, int] = None,
    weather: str = None,
    ground_power_available: bool = True,
) -> Dict[str, Any]:
    aircraft = AIRCRAFT_TYPES.get(aircraft_type, AIRCRAFT_TYPES["A320"])

    if scheduled_departure is None:
        dep = datetime.now() + timedelta(hours=2)
        scheduled_departure = dep.strftime("%H:%M")

    weather_info = next(
        (w for w in WEATHER_CONDITIONS if w["condition"] == weather),
        WEATHER_CONDITIONS[0],
    )

    tasks = []
    base_time = datetime.now()

    for task in TURNAROUND_TASKS:
        duration = int(task["duration_min"] * weather_info["delay_factor"])
        extra_delay = delays.get(task["name"], 0) if delays else 0

        tasks.append({
            "name": task["name"],
            "duration_min": duration + extra_delay,
            "base_duration_min": task["duration_min"],
            "dependencies": task["dependencies"],
            "category": task["category"],
            "delay_injected": extra_delay > 0,
            "delay_minutes": extra_delay,
        })

    return {
        "aircraft_type": aircraft_type,
        "aircraft_specs": {
            "fuel_capacity_liters": aircraft["fuel_capacity"],
            "passenger_capacity": aircraft["passengers"],
            "apu_consumption_lph": aircraft["apu_consumption"],
        },
        "gate": gate,
        "scheduled_departure": scheduled_departure,
        "weather": weather_info,
        "ground_power_available": ground_power_available,
        "tasks": tasks,
        "total_tasks": len(tasks),
        "generated_at": datetime.now().isoformat(),
    }


def generate_disruption_scenario(disruption_name: str = None) -> Dict[str, Any]:
    if disruption_name is None:
        disruption = random.choice(DISRUPTION_TEMPLATES)
    else:
        disruption = next(
            (d for d in DISRUPTION_TEMPLATES if d["name"] == disruption_name),
            DISRUPTION_TEMPLATES[0],
        )

    delays = {}
    if disruption["affected_task"]:
        delays[disruption["affected_task"]] = disruption["delay_minutes"]

    weather = None
    if disruption["weather_override"]:
        weather = disruption["weather_override"]

    ground_power = not disruption.get("force_apu", False)

    scenario = generate_base_scenario(
        delays=delays,
        weather=weather,
        ground_power_available=ground_power,
    )

    scenario["disruption"] = {
        "name": disruption["name"],
        "description": disruption["description"],
        "delay_minutes": disruption["delay_minutes"],
        "severity": "HIGH" if disruption["delay_minutes"] >= 25 else "MEDIUM",
    }

    return scenario


def generate_random_scenario() -> Dict[str, Any]:
    aircraft = random.choice(list(AIRCRAFT_TYPES.keys()))
    gate = f"{random.choice(['A', 'B', 'C', 'D'])}{random.randint(1, 30)}"
    weather = random.choice(WEATHER_CONDITIONS)["condition"]
    ground_power = random.random() > 0.2

    return generate_base_scenario(
        aircraft_type=aircraft,
        gate=gate,
        weather=weather,
        ground_power_available=ground_power,
    )
