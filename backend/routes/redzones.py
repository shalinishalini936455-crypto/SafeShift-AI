from fastapi import APIRouter
from database.database import SessionLocal
from models.redzone import RedZone

router = APIRouter(
    prefix="/api/red-zones",
    tags=["Red Zones"]
)


@router.get("/")
def get_red_zones():
    db = SessionLocal()

    try:
        red_zones = db.query(RedZone).all()
        return red_zones
    finally:
        db.close()
