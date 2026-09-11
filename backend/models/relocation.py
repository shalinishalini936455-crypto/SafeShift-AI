from sqlalchemy import Column, Integer, String, Float
from database.database import Base


class RelocationPlan(Base):
    __tablename__ = "relocation_plans"

    id = Column(Integer, primary_key=True, index=True)
    habitation_id = Column(Integer, nullable=False)
    safe_site_id = Column(Integer, nullable=False)
    priority = Column(String, default="Medium")
    people_to_relocate = Column(Integer, default=0)
    distance_km = Column(Float, default=0.0)
    status = Column(String, default="Planned")
