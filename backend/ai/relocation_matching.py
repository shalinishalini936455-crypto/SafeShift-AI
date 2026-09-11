def calculate_matching_score(
    risk_level: str,
    available_capacity: int,
    required_people: int,
    safety_level: str,
    distance_km: float
):
    # Risk priority
    if risk_level.lower() == "high":
        risk_score = 100
        priority = "High"
    elif risk_level.lower() == "medium":
        risk_score = 60
        priority = "Medium"
    else:
        risk_score = 30
        priority = "Low"

    # Capacity score
    if required_people > 0:
        capacity_score = min(
            (available_capacity / required_people) * 100,
            100
        )
    else:
        capacity_score = 0

    # Safety score
    if safety_level.lower() == "high":
        safety_score = 100
    elif safety_level.lower() == "medium":
        safety_score = 60
    else:
        safety_score = 30

    # Distance score
    distance_score = max(
        0,
        100 - (distance_km * 10)
    )

    # Overall matching score
    matching_score = round(
        (risk_score * 0.30) +
        (capacity_score * 0.30) +
        (safety_score * 0.25) +
        (distance_score * 0.15),
        2
    )

    return {
        "priority": priority,
        "risk_score": risk_score,
        "capacity_score": round(capacity_score, 2),
        "safety_score": safety_score,
        "distance_score": round(distance_score, 2),
        "matching_score": matching_score
    }