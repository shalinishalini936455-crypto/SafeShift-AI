def calculate_priority(
    risk_level: str,
    population: int,
    people_to_relocate: int
):
    # Risk score
    if risk_level.lower() == "high":
        risk_score = 100
    elif risk_level.lower() == "medium":
        risk_score = 60
    else:
        risk_score = 30

    # Population score
    population_score = min((population / 5000) * 100, 100)

    # Relocation requirement score
    relocation_score = min((people_to_relocate / 1000) * 100, 100)

    # Final priority score
    priority_score = round(
        (risk_score * 0.50) +
        (population_score * 0.25) +
        (relocation_score * 0.25),
        2
    )

    if priority_score >= 70:
        priority = "High"
    elif priority_score >= 40:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        "risk_score": risk_score,
        "population_score": round(population_score, 2),
        "relocation_score": round(relocation_score, 2),
        "priority_score": priority_score,
        "priority": priority
    }