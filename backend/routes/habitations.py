from fastapi import APIRouter
from database.database import SessionLocal
from models.habitation import Habitation

router = APIRouter(
    prefix="/api/habitations",
    tags=["Habitations"]
)


@router.get("/")
def get_habitations():
    db = SessionLocal()

    try:
        habitations = db.query(Habitation).all()
        return habitations
    finally:
        db.close()
