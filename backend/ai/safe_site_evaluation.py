def evaluate_safe_site(
    available_capacity: int,
    required_people: int,
    safety_level: str,
    distance_km: float
):
    capacity_ok = available_capacity >= required_people
    safety_ok = safety_level.lower() == "high"
    distance_ok = distance_km <= 10

    if capacity_ok and safety_ok and distance_ok:
        suitability = "Suitable"
    elif capacity_ok and safety_ok:
        suitability = "Moderately Suitable"
    else:
        suitability = "Not Suitable"

    return {
        "capacity_available": available_capacity,
        "people_required": required_people,
        "capacity_ok": capacity_ok,
        "safety_ok": safety_ok,
        "distance_ok": distance_ok,
        "suitability": suitability
    }
