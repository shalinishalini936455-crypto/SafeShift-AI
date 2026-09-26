from sqlalchemy import Column, Integer, String, Float
from database.database import Base


class Habitation(Base):
    __tablename__ = "habitations"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, default=0)
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String, default="Low")