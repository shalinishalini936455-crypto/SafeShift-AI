from fastapi import APIRouter
from database.database import SessionLocal
from models.habitation import Habitation
from models.safesite import SafeSite
from ai.relocation_matching import calculate_matching_score

router = APIRouter(
    prefix="/api/relocation",
    tags=["Relocation Matching"]
)


@router.post("/match")
def match_relocation(
    habitation_id: int,
    safe_site_id: int,
    people: int,
    distance_km: float
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

        safe_site = db.query(SafeSite).filter(
            SafeSite.id == safe_site_id
        ).first()

        if not safe_site:
            return {
                "error": "Safe site not found"
            }

        result = calculate_matching_score(
            habitation.risk_level,
            safe_site.available_capacity,
            people,
            safe_site.safety_level,
            distance_km
        )

        return {
            "habitation": habitation.name,
            "safe_site": safe_site.site_name,
            "people_to_relocate": people,
            "available_capacity": safe_site.available_capacity,
            "risk_level": habitation.risk_level,
            **result,
            "message": "Relocation matching completed successfully"
        }

    finally:
        db.close()