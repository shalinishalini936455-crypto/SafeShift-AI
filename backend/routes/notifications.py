from fastapi import APIRouter
from database.database import SessionLocal
from models.notification import Notification

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


@router.post("/alert")
def create_alert(
    title: str,
    message: str,
    severity: str = "Medium"
):
    db = SessionLocal()

    try:
        notification = Notification(
            title=title,
            message=message,
            severity=severity,
            status="Unread"
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return {
            "message": "Alert created successfully",
            "id": notification.id,
            "title": notification.title,
            "alert_message": notification.message,
            "severity": notification.severity,
            "status": notification.status
        }

    finally:
        db.close()


@router.get("/")
def get_notifications():
    db = SessionLocal()

    try:
        notifications = db.query(Notification).all()
        return notifications

    finally:
        db.close()