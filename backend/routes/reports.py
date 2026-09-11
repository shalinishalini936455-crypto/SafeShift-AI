from fastapi import APIRouter
from database.database import SessionLocal

from models.habitation import Habitation
from models.redzone import RedZone
from models.safesite import SafeSite
from models.relocation import RelocationPlan

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.get("/dashboard")
def get_report_dashboard():
    db = SessionLocal()

    try:
        total_habitations = db.query(Habitation).count()

        high_risk = db.query(Habitation).filter(
            Habitation.risk_level == "High"
        ).count()

        medium_risk = db.query(Habitation).filter(
            Habitation.risk_level == "Medium"
        ).count()

        low_risk = db.query(Habitation).filter(
            Habitation.risk_level == "Low"
        ).count()

        total_red_zones = db.query(RedZone).count()

        total_safe_sites = db.query(SafeSite).count()

        available_capacity = sum(
            site.available_capacity
            for site in db.query(SafeSite).all()
        )

        total_relocation_plans = db.query(
            RelocationPlan
        ).count()

        return {
            "total_habitations": total_habitations,
            "risk_distribution": {
                "high": high_risk,
                "medium": medium_risk,
                "low": low_risk
            },
            "total_red_zones": total_red_zones,
            "total_safe_sites": total_safe_sites,
            "available_safe_capacity": available_capacity,
            "total_relocation_plans": total_relocation_plans,
            "message": "Report dashboard generated successfully"
        }

    finally:
        db.close()


@router.get("/risk")
def get_risk_report():
    db = SessionLocal()

    try:
        habitations = db.query(Habitation).all()

        return [
            {
                "habitation_id": h.id,
                "habitation": h.name,
                "district": h.district,
                "population": h.population,
                "risk_level": h.risk_level
            }
            for h in habitations
        ]

    finally:
        db.close()


@router.get("/relocation")
def get_relocation_report():
    db = SessionLocal()

    try:
        plans = db.query(RelocationPlan).all()

        return [
            {
                "plan_id": plan.id,
                "habitation_id": plan.habitation_id,
                "safe_site_id": plan.safe_site_id,
                "priority": plan.priority,
                "people_to_relocate": plan.people_to_relocate,
                "distance_km": plan.distance_km,
                "status": plan.status
            }
            for plan in plans
        ]

    finally:
        db.close()