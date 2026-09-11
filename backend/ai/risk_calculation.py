def calculate_risk_score(
    hazard_severity: int,
    population: int,
    exposure_level: int
):
    score = (
        hazard_severity * 0.5 +
        exposure_level * 0.3 +
        min(population / 100, 100) * 0.2
    )

    score = round(min(score, 100), 2)

    if score >= 70:
        risk_level = "High"
    elif score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "risk_score": score,
        "risk_level": risk_level
    }
