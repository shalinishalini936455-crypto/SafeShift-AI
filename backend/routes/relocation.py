from fastapi import APIRouter
from database.database import SessionLocal
from models.relocation import RelocationPlan
from models.habitation import Habitation
from models.safesite import SafeSite

router = APIRouter(
    prefix="/api/relocation",
    tags=["Relocation"]
)


@router.get("/plans")
def get_relocation_plans():
    db = SessionLocal()

    try:
        plans = db.query(RelocationPlan).all()
        return plans

    finally:
        db.close()


@router.post("/recommend")
def recommend_relocation(
    habitation_id: int,
    people: int
):
    db = SessionLocal()

    try:
        # Find habitation
        habitation = db.query(Habitation).filter(
            Habitation.id == habitation_id
        ).first()

        if not habitation:
            return {
                "error": "Habitation not found"
            }

        # Find safe sites with enough capacity
        safe_sites = db.query(SafeSite).filter(
            SafeSite.available_capacity >= people
        ).all()

        if not safe_sites:
            return {
                "message": "No suitable safe site available",
                "habitation": habitation.name,
                "people": people
            }

        recommendations = []

        for site in safe_sites:

            # Simple coordinate-based distance
            distance = (
                (site.latitude - habitation.latitude) ** 2 +
                (site.longitude - habitation.longitude) ** 2
            ) ** 0.5

            # Safety score
            if site.safety_level.lower() == "high":
                safety_score = 100
            elif site.safety_level.lower() == "medium":
                safety_score = 60
            else:
                safety_score = 30

            # Risk score
            if habitation.risk_level.lower() == "high":
                risk_score = 90
                priority = "High"
            elif habitation.risk_level.lower() == "medium":
                risk_score = 60
                priority = "Medium"
            else:
                risk_score = 30
                priority = "Low"

            # Capacity score
            capacity_score = min(
                (site.available_capacity / people) * 100,
                100
            )

            # Overall recommendation score
            recommendation_score = round(
                (safety_score * 0.4) +
                (capacity_score * 0.3) +
                (risk_score * 0.2) +
                ((1 / (1 + distance)) * 100 * 0.1),
                2
            )

            recommendations.append({
                "safe_site_id": site.id,
                "safe_site": site.site_name,
                "district": site.district,
                "safety_level": site.safety_level,
                "available_capacity": site.available_capacity,
                "people_to_relocate": people,
                "priority": priority,
                "distance_score": round(distance, 4),
                "recommendation_score": recommendation_score
            })

        # Select highest scoring site
        best_site = max(
            recommendations,
            key=lambda x: x["recommendation_score"]
        )

        return {
            "habitation": habitation.name,
            "risk_level": habitation.risk_level,
            "priority": priority,
            "people_to_relocate": people,
            "recommended_site": best_site,
            "message": "Best relocation site recommended successfully"
        }

    finally:
        db.close()
@router.post("/simulate")
def simulate_relocation(
    habitation_id: int,
    safe_site_id: int,
    people: int
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

        available_capacity = safe_site.available_capacity

        if available_capacity >= people:
            remaining_capacity = available_capacity - people
            status = "Relocation Possible"
            capacity_ok = True
        else:
            remaining_capacity = available_capacity
            status = "Insufficient Capacity"
            capacity_ok = False

        return {
            "habitation": habitation.name,
            "safe_site": safe_site.site_name,
            "people_to_relocate": people,
            "available_capacity_before": available_capacity,
            "remaining_capacity_after": remaining_capacity,
            "capacity_ok": capacity_ok,
            "status": status,
            "message": "Relocation simulation completed successfully"
        }

    finally:
        db.close()