from fastapi import APIRouter
from pydantic import BaseModel
from database.database import SessionLocal
from models.habitation import Habitation

router = APIRouter(
    prefix="/api/habitations",
    tags=["Habitations"]
)


class HabitationCreate(BaseModel):
    name: str
    district: str
    latitude: float
    longitude: float
    population: int
    risk_score: float | None = None
    risk_level: str = "Low"


@router.get("/")
def get_habitations():
    db = SessionLocal()
    try:
        habitations = db.query(Habitation).all()
        return habitations
    finally:
        db.close()


@router.post("/")
def create_habitation(data: HabitationCreate):
    db = SessionLocal()
    try:
        habitation = Habitation(**data.dict())
        db.add(habitation)
        db.commit()
        db.refresh(habitation)
        return habitation
    finally:
        db.close()