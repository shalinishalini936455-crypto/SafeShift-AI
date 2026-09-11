from fastapi import APIRouter
from database.database import SessionLocal
from models.habitation import Habitation
from ai.risk_score import calculate_risk

router = APIRouter(
    prefix="/api/risk",
    tags=["Risk"]
)

@router.get("/{habitation_id}")
def get_risk(habitation_id: int):
    db = SessionLocal()

    try:
        habitation = db.query(Habitation).filter(
            Habitation.id == habitation_id
        ).first()

        if not habitation:
            return {"error": "Habitation not found"}

        score = calculate_risk(habitation.risk_level)

        return {
            "habitation_id": habitation.id,
            "habitation": habitation.name,
            "risk_level": habitation.risk_level,
            "risk_score": score
        }

    finally:
        db.close()
