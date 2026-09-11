from fastapi import APIRouter
from database.database import SessionLocal
from models.habitation import Habitation
from ai.relocation_priority import calculate_priority

router = APIRouter(
    prefix="/api/relocation",
    tags=["Relocation Priority"]
)


@router.post("/priority")
def relocation_priority(
    habitation_id: int,
    people_to_relocate: int
):
    db = SessionLocal()

    try:
        habitation = db.query(Habitation).filter(
            Habitation.id == habitation_id
        ).first()

        if not habitation:
            return {
                "error": "Habitation not found"
            }

        result = calculate_priority(
            habitation.risk_level,
            habitation.population,
            people_to_relocate
        )

        return {
            "habitation_id": habitation.id,
            "habitation": habitation.name,
            "district": habitation.district,
            "population": habitation.population,
            "risk_level": habitation.risk_level,
            "people_to_relocate": people_to_relocate,
            **result,
            "message": "Relocation priority calculated successfully"
        }

    finally:
        db.close()