from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from database.database import Base

class AIDetection(Base):
    __tablename__ = "ai_detections"

    id = Column(Integer, primary_key=True, index=True)
    red_zone_id = Column(Integer, ForeignKey("red_zones.id"), nullable=True)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    change_percentage = Column(Float, default=0.0)
    regions_detected = Column(Integer, default=0)
    change_detected = Column(Boolean, default=False)
    confidence = Column(Float, default=0.0)
    risk_level = Column(String, default="Low")
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)