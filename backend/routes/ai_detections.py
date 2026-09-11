from fastapi import APIRouter
from database.database import SessionLocal
from models.ai_detection import AIDetection

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Detection Records"]
)

@router.post("/detections")
def create_detection(
    location: str,
    before_value: str,
    after_value: str,
    change_detected: str,
    confidence: float = 0.0
):
    db = SessionLocal()

    try:
        detection = AIDetection(
            location=location,
            before_value=before_value,
            after_value=after_value,
            change_detected=change_detected,
            confidence=confidence
        )

        db.add(detection)
        db.commit()
        db.refresh(detection)

        return {
            "message": "AI detection record saved successfully",
            "id": detection.id,
            "location": detection.location,
            "change_detected": detection.change_detected,
            "confidence": detection.confidence
        }

    finally:
        db.close()


@router.get("/detections")
def get_detections():
    db = SessionLocal()

    try:
        detections = db.query(AIDetection).all()
        return detections

    finally:
        db.close()
