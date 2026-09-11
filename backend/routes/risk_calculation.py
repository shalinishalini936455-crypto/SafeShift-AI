from fastapi import APIRouter
from ai.risk_calculation import calculate_risk_score

router = APIRouter(
    prefix="/api/risk",
    tags=["Risk Calculation"]
)

@router.post("/calculate")
def calculate_risk(
    hazard_severity: int,
    population: int,
    exposure_level: int
):
    return calculate_risk_score(
        hazard_severity,
        population,
        exposure_level
    )
