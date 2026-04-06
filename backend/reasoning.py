import json
from typing import Dict, Any, List


SYSTEM_PROMPT = """You are Aero-Logic, an advanced aviation decision intelligence system powered by K2 Think V2.

You specialize in:
- counterfactual reasoning (evaluating multiple possible operational strategies)
- constraint-aware scheduling under ICAO safety rules
- multi-step logical reasoning
- real-world aviation ground operations

CRITICAL: Output ONLY valid JSON. No explanations, no conversational text. Start with { and end with }.

You must:
- ALWAYS think step-by-step before answering
- NEVER violate safety constraints
- ALWAYS compare multiple plans before selecting one
- PRIORITIZE explainability and structured reasoning

You are NOT a chatbot.
You are a high-stakes aviation optimization engine.
Output ONLY JSON."""


BOOSTER_PROMPT = """
IMPORTANT: Output ONLY valid JSON. No explanations, no text before or after the JSON. Start your response with { and end with }.

Additionally:
- Quantify fuel savings wherever possible
- Prefer realistic aviation terminology
- Avoid generic answers
- Ensure timelines are operationally feasible"""


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

### Strategy B: Fuel-Minimizing
Minimize APU usage and fuel burn, even if departure is delayed.

### Strategy C: Balanced Strategy
Balance delay and fuel efficiency.

---

## CONSTRAINTS

- ICAO safety rules must NEVER be violated
- Certain operations cannot overlap (e.g., fueling and unsafe concurrent tasks)
- APU usage increases fuel consumption and emissions
- Ground resource limitations must be respected

---

## TASK

### Step 1: Analyze the scenario
Identify key conflicts, bottlenecks, and risks.

### Step 2: Generate Plans
Create EXACTLY 3 plans (A, B, C), each aligned with its strategy.

Each plan MUST include:
- Task timeline (sequence of operations)
- Total delay (in minutes)
- APU usage (in minutes)
- Estimated fuel impact (qualitative or quantitative)

### Step 3: Counterfactual Reasoning
Explain:
- Why each plan works
- What tradeoffs it makes (delay vs fuel vs safety)

### Step 4: Decision
Select the BEST plan based on:
- overall efficiency (delay + fuel)
- strict safety compliance

---

## OUTPUT FORMAT (STRICT JSON)

Return ONLY this:

{{
  "plans": [
    {{
      "plan_id": "A",
      "strategy": "Delay-Minimizing",
      "total_delay_minutes": <number>,
      "apu_usage_minutes": <number>,
      "ground_power_used": <boolean>,
      "on_time_probability": <number 0-1>,
      "fuel_cost_estimate_usd": <number>,
      "timeline": [
        {{"task": "<name>", "start_min": <number>, "duration_min": <number>, "parallel": <boolean>}}
      ],
      "reasoning": "<detailed explanation of this plan's approach>",
      "tradeoffs": {{
        "pros": ["<pro 1>", "<pro 2>"],
        "cons": ["<con 1>", "<con 2>"]
      }}
    }},
    {{
      "plan_id": "B",
      "strategy": "Fuel-Minimizing",
      "total_delay_minutes": <number>,
      "apu_usage_minutes": <number>,
      "ground_power_used": <boolean>,
      "on_time_probability": <number 0-1>,
      "fuel_cost_estimate_usd": <number>,
      "timeline": [
        {{"task": "<name>", "start_min": <number>, "duration_min": <number>, "parallel": <boolean>}}
      ],
      "reasoning": "<detailed explanation of this plan's approach>",
      "tradeoffs": {{
        "pros": ["<pro 1>", "<pro 2>"],
        "cons": ["<con 1>", "<con 2>"]
      }}
    }},
    {{
      "plan_id": "C",
      "strategy": "Balanced",
      "total_delay_minutes": <number>,
      "apu_usage_minutes": <number>,
      "ground_power_used": <boolean>,
      "on_time_probability": <number 0-1>,
      "fuel_cost_estimate_usd": <number>,
      "timeline": [
        {{"task": "<name>", "start_min": <number>, "duration_min": <number>, "parallel": <boolean>}}
      ],
      "reasoning": "<detailed explanation of this plan's approach>",
      "tradeoffs": {{
        "pros": ["<pro 1>", "<pro 2>"],
        "cons": ["<con 1>", "<con 2>"]
      }}
    }}
  ],
  "comparison": {{
    "summary": "<one sentence comparing all plans>",
    "metrics": {{
      "lowest_delay": "<plan and value>",
      "lowest_fuel_cost": "<plan and value>",
      "best_on_time_probability": "<plan and value>",
      "lowest_apu_usage": "<plan and value>"
    }}
  }},
  "selected_plan": {{
    "plan_id": "<A, B, or C>",
    "justification": "<detailed explanation of why this plan is optimal>",
    "ai_optimizer_agreement": <boolean>,
    "ai_optimizer_explanation": "<explanation of agreement/disagreement with mathematical scoring>"
  }}
}}

---

DO NOT output anything outside JSON.
DO NOT skip reasoning.
Ensure plans are meaningfully different.
Think like a real-world operations strategist.

{BOOSTER_PROMPT}"""

    return prompt


def validate_response(response: Dict[str, Any]) -> Dict[str, Any]:
    required_plan_fields = [
        "plan_id", "strategy", "total_delay_minutes", "apu_usage_minutes",
        "ground_power_used", "on_time_probability", "fuel_cost_estimate_usd",
        "timeline", "reasoning", "tradeoffs",
    ]

    if "plans" not in response or not isinstance(response["plans"], list):
        raise ValueError("Response must contain 'plans' array")

    if len(response["plans"]) != 3:
        raise ValueError(f"Expected exactly 3 plans, got {len(response['plans'])}")

    for plan in response["plans"]:
        for field in required_plan_fields:
            if field not in plan:
                raise ValueError(f"Plan {plan.get('plan_id', '?')} missing field: {field}")

        if not isinstance(plan["timeline"], list) or len(plan["timeline"]) == 0:
            raise ValueError(f"Plan {plan['plan_id']} must have non-empty timeline")

        for event in plan["timeline"]:
            for tf in ("task", "start_min", "duration_min", "parallel"):
                if tf not in event:
                    raise ValueError(f"Timeline event in Plan {plan['plan_id']} missing: {tf}")

    if "comparison" not in response:
        raise ValueError("Response must contain 'comparison' object")

    if "selected_plan" not in response:
        raise ValueError("Response must contain 'selected_plan' object")

    selected_id = response["selected_plan"]["plan_id"]
    plan_ids = [p["plan_id"] for p in response["plans"]]
    if selected_id not in plan_ids:
        raise ValueError(f"Selected plan '{selected_id}' not in plans: {plan_ids}")

    return response
