from ai.safe_site_evaluation import evaluate_safe_site

from fastapi import APIRouter
from database.database import SessionLocal
from models.safesite import SafeSite

router = APIRouter(
    prefix="/api/safe-sites",
    tags=["Safe Sites"]
)

@router.get("/")
def get_safe_sites():
    db = SessionLocal()
    try:
        safe_sites = db.query(SafeSite).all()
        return safe_sites
    finally:
        db.close()

@router.post("/evaluate")
def evaluate_site(
    site_id: int,
    required_people: int,
    distance_km: float
):
    db = SessionLocal()

    try:
        site = db.query(SafeSite).filter(
            SafeSite.id == site_id
        ).first()

        if not site:
            return {"error": "Safe site not found"}

        result = evaluate_safe_site(
            site.available_capacity,
            required_people,
            site.safety_level,
            distance_km
        )

        return {
            "site_id": site.id,
            "site_name": site.site_name,
            "district": site.district,
            **result
        }

    finally:
        db.close()
