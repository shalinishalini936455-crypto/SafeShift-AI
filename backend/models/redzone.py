from sqlalchemy import Column, Integer, String, Float
from database.database import Base


class RedZone(Base):
    __tablename__ = "red_zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    hazard_type = Column(String, nullable=False)
    severity = Column(String, default="Medium")
