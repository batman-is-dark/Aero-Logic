from typing import Dict, Any, List


def calculate_plan_cost(plan: Dict[str, Any], delay_weight: float = 0.5, apu_weight: float = 0.3) -> float:
    delay_cost = plan["total_delay_minutes"] * delay_weight
    apu_cost = plan["apu_usage_minutes"] * apu_weight
    return delay_cost + apu_cost


def score_all_plans(plans: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    scored = []
    for plan in plans:
        cost = calculate_plan_cost(plan)
        scored.append({
            **plan,
            "calculated_cost": cost,
        })
    return sorted(scored, key=lambda x: x["calculated_cost"])


def compare_with_ai_selection(
    plans: List[Dict[str, Any]],
    ai_selected_plan_id: str,
) -> Dict[str, Any]:
    scored_plans = score_all_plans(plans)
    optimizer_choice = scored_plans[0]["plan_id"]

    ai_plan = next((p for p in plans if p["plan_id"] == ai_selected_plan_id), None)
    optimizer_plan = scored_plans[0]

    agreement = optimizer_choice == ai_selected_plan_id

    return {
        "agreement": agreement,
        "optimizer_selected_plan_id": optimizer_choice,
        "ai_selected_plan_id": ai_selected_plan_id,
        "optimizer_reasoning": (
            f"The mathematical optimizer selects Plan {optimizer_choice} "
            f"with the lowest cost score ({optimizer_plan['calculated_cost']:.1f}). "
            f"Calculation: delay({optimizer_plan['total_delay_minutes']}) × 0.5 + "
            f"apu({optimizer_plan['apu_usage_minutes']}) × 0.3 = {optimizer_plan['calculated_cost']:.1f}"
        ),
        "ai_reasoning": ai_plan["reasoning"] if ai_plan else "Plan not found",
        "comparison": {
            "optimizer_cost": optimizer_plan["calculated_cost"],
            "ai_plan_cost": calculate_plan_cost(ai_plan) if ai_plan else None,
            "cost_difference": (
                abs(calculate_plan_cost(ai_plan) - optimizer_plan["calculated_cost"])
                if ai_plan else None
            ),
        },
    }
