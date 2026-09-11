from sqlalchemy import Column, Integer, String, Float
from database.database import Base

class AIDetection(Base):
    __tablename__ = "ai_detections"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False)
    before_value = Column(String, nullable=False)
    after_value = Column(String, nullable=False)
    change_detected = Column(String, default="No")
    confidence = Column(Float, default=0.0)
