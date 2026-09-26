from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime, timezone
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

    # --- Real-time tracking fields ---
    source = Column(String, default="Seed")
    external_id = Column(String, nullable=True, index=True)
    risk_score = Column(Float, default=0.0)
    last_updated = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    # --- Recurrence / escalation fields (rule-based AI) ---
    occurrence_count = Column(Integer, default=1)
    first_detected = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
    is_permanent_zone = Column(Boolean, default=False)

    # --- Trained ML model fields ---
    # Predicted label from the RandomForestClassifier
    # (ai/train_model.py + ai/risk_predictor.py), independent of
    # the rule-based `severity` field above - kept separate so you
    # can show both side by side: "rule-based says X, model says Y".
    ml_predicted_severity = Column(String, nullable=True)
    ml_confidence = Column(Float, nullable=True)
