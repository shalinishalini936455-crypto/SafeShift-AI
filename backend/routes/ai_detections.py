from fastapi import APIRouter, UploadFile, File, Form
from database.database import SessionLocal
from models.ai_detection import AIDetection
from ai.change_detection import detect_change_from_images

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Change Detection"]
)


def _risk_level_from_change(change_percentage: float) -> str:
    if change_percentage >= 15:
        return "High"
    elif change_percentage >= 5:
        return "Medium"
    return "Low"


@router.post("/change-detection")
async def analyze_change(
    location: str = Form(...),
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...),
):
    """
    Upload a real before/after image pair for a location (e.g. a
    declared red zone) and run genuine computer-vision change
    detection on them. This is not simulated - it decodes the
    actual images and computes a real pixel-level difference.
    """
    before_bytes = await before_image.read()
    after_bytes = await after_image.read()

    result = detect_change_from_images(before_bytes, after_bytes)

    db = SessionLocal()
    try:
        detection = AIDetection(
            location=location,
            change_percentage=result["change_percentage"],
            regions_detected=result["regions_detected"],
            change_detected=result["change_detected"],
            confidence=result["confidence"],
            risk_level=_risk_level_from_change(result["change_percentage"]),
            verified=False,
        )
        db.add(detection)
        db.commit()
        db.refresh(detection)

        return {
            "message": "Change detection analysis completed",
            "id": detection.id,
            "location": detection.location,
            "change_percentage": detection.change_percentage,
            "regions_detected": detection.regions_detected,
            "change_detected": detection.change_detected,
            "confidence": detection.confidence,
            "risk_level": detection.risk_level,
        }
    finally:
        db.close()


@router.get("/detections")
def get_detections():
    db = SessionLocal()
    try:
        return db.query(AIDetection).all()
    finally:
        db.close()


@router.get("/detections/summary")
def get_detection_summary():
    """
    Real aggregate stats for the AI Change Detection dashboard -
    replaces the hardcoded 50 / 6 / 14 / 30 numbers on the page.
    """
    db = SessionLocal()
    try:
        all_detections = db.query(AIDetection).all()

        total = len(all_detections)
        pending_verification = sum(1 for d in all_detections if not d.verified)
        high_risk = sum(1 for d in all_detections if d.risk_level == "High")
        verified = sum(1 for d in all_detections if d.verified)

        return {
            "total_detections": total,
            "pending_verification": pending_verification,
            "high_risk": high_risk,
            "verified": verified,
        }
    finally:
        db.close()


@router.post("/detections/{detection_id}/verify")
def verify_detection(detection_id: int):
    """Mark a detection as field-verified (human-in-the-loop step)."""
    db = SessionLocal()
    try:
        detection = db.query(AIDetection).filter(
            AIDetection.id == detection_id
        ).first()

        if not detection:
            return {"error": "Detection not found"}

        detection.verified = True
        db.commit()

        return {"message": "Detection marked as verified", "id": detection_id}
    finally:
        db.close()
@router.delete("/detections/{detection_id}")
def delete_detection(detection_id: int):
    """Remove a detection marked as a false positive by a human reviewer."""
    db = SessionLocal()
    try:
        detection = db.query(AIDetection).filter(
            AIDetection.id == detection_id
        ).first()

        if not detection:
            return {"error": "Detection not found"}

        db.delete(detection)
        db.commit()

        return {"message": "Detection removed as false positive", "id": detection_id}
    finally:
        db.close()