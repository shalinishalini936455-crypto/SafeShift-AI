from fastapi import APIRouter
from database.database import SessionLocal

from models.habitation import Habitation
from models.redzone import RedZone
from models.safesite import SafeSite
from models.relocation import RelocationPlan
from models.notification import Notification

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard():
    db = SessionLocal()

    try:
        total_habitations = db.query(Habitation).count()

        high_risk_habitations = db.query(Habitation).filter(
            Habitation.risk_level == "High"
        ).count()

        total_red_zones = db.query(RedZone).count()

        total_safe_sites = db.query(SafeSite).count()

        safe_sites = db.query(SafeSite).all()

        available_safe_capacity = sum(
            site.available_capacity for site in safe_sites
        )

        total_relocation_plans = db.query(
            RelocationPlan
        ).count()

        unread_notifications = db.query(
            Notification
        ).filter(
            Notification.status == "Unread"
        ).count()

        return {
            "total_habitations": total_habitations,
            "high_risk_habitations": high_risk_habitations,
            "total_red_zones": total_red_zones,
            "total_safe_sites": total_safe_sites,
            "available_safe_capacity": available_safe_capacity,
            "total_relocation_plans": total_relocation_plans,
            "unread_notifications": unread_notifications,
            "message": "Dashboard data retrieved successfully"
        }

    finally:
        db.close()