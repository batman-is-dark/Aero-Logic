from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uuid
from datetime import datetime

from data_generator import (
    generate_base_scenario,
    generate_disruption_scenario,
    generate_random_scenario,
    AIRCRAFT_TYPES,
    WEATHER_CONDITIONS,
    DISRUPTION_TEMPLATES,
)
from counterfactual import generate_counterfactual_scenarios
from k2_client import K2Client
from reasoning import build_reasoning_prompt, validate_response
from scoring import compare_with_ai_selection

app = FastAPI(title="Aero-Logic API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

k2_client = K2Client()


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
    selected_tasks: Optional[List[TaskSequenceRequest]] = None


class DisruptionRequest(BaseModel):
    disruption_name: Optional[str] = None


class OptimizationRequest(BaseModel):
    scenario: ScenarioInput
    use_disruption: bool = False
    disruption_name: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "Aero-Logic API - Aviation Ground Operations Optimizer"}


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/config/aircraft-types")
async def get_aircraft_types():
    return {"aircraft_types": list(AIRCRAFT_TYPES.keys())}


@app.get("/config/weather-conditions")
async def get_weather_conditions():
    return {"weather_conditions": [{"name": w["condition"], "description": w["description"]} for w in WEATHER_CONDITIONS]}


@app.get("/config/disruptions")
async def get_disruptions():
    return {"disruptions": [{"name": d["name"], "description": d["description"]} for d in DISRUPTION_TEMPLATES]}


@app.post("/scenario/generate")
async def generate_scenario(request: ScenarioInput):
    scenario = generate_base_scenario(
        aircraft_type=request.aircraft_type,
        gate=request.gate,
        scheduled_departure=request.scheduled_departure,
        delays=request.delays,
        weather=request.weather,
        ground_power_available=request.ground_power_available,
    )
    return {"scenario": scenario}


@app.post("/scenario/disruption")
async def generate_disruption(request: DisruptionRequest):
    scenario = generate_disruption_scenario(request.disruption_name)
    return {"scenario": scenario}


@app.post("/scenario/random")
async def generate_random():
    scenario = generate_random_scenario()
    return {"scenario": scenario}


@app.post("/optimize")
async def optimize(request: OptimizationRequest):
    scenario_id = str(uuid.uuid4())

    if request.use_disruption:
        base_scenario = generate_disruption_scenario(request.disruption_name)
    else:
        base_scenario = generate_base_scenario(
            aircraft_type=request.scenario.aircraft_type,
            gate=request.scenario.gate,
            scheduled_departure=request.scenario.scheduled_departure,
            delays=request.scenario.delays,
            weather=request.scenario.weather,
            ground_power_available=request.scenario.ground_power_available,
        )

    # Extract task IDs from request if provided
    task_ids = None
    if request.scenario.selected_tasks:
        task_ids = [t.task_id for t in request.scenario.selected_tasks if t.required]

    # Generate counterfactual scenarios WITH task sequencing
    counterfactual_scenarios = generate_counterfactual_scenarios(base_scenario, task_ids)

    prompt = build_reasoning_prompt(base_scenario, counterfactual_scenarios)

    k2_response = await k2_client.reason_with_fallback(prompt, base_scenario)

    validated_response = validate_response(k2_response)

    comparison = compare_with_ai_selection(
        validated_response["plans"],
        validated_response["selected_plan"]["plan_id"],
    )

    # Build plans with task sequence data
    plans_with_sequences = []
    for i, cf_scenario in enumerate(counterfactual_scenarios):
        plan = validated_response["plans"][i] if i < len(validated_response["plans"]) else {}
        plan["task_sequence"] = cf_scenario["scenario"].get("task_sequence", [])
        plan["task_timeline"] = cf_scenario["scenario"].get("task_timeline", [])
        plans_with_sequences.append(plan)

    return {
        "scenario_id": scenario_id,
        "base_scenario": base_scenario,
        "counterfactual_scenarios": counterfactual_scenarios,
        "plans": plans_with_sequences,
        "comparison": validated_response["comparison"],
        "selected_plan": validated_response["selected_plan"],
        "optimizer_comparison": comparison,
        "timestamp": datetime.now().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
