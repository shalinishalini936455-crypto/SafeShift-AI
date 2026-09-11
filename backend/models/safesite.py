from sqlalchemy import Column, Integer, String, Float
from database.database import Base


class SafeSite(Base):
    __tablename__ = "safe_sites"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=0)
    available_capacity = Column(Integer, default=0)
    safety_level = Column(String, default="High")
