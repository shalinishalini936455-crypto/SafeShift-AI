from datetime import date, timedelta

from fastapi import APIRouter
from database.database import SessionLocal
from models.redzone import RedZone
from models.ai_detection import AIDetection
from ai.satellite_fetch import fetch_satellite_image
from ai.change_detection import detect_change_from_images

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Change Detection - Auto"]
)


def _risk_level_from_change(change_percentage: float) -> str:
    if change_percentage >= 15:
        return "High"
    elif change_percentage >= 5:
        return "Medium"
    return "Low"


@router.post("/change-detection/auto/{red_zone_id}")
def auto_detect_change_for_zone(
    red_zone_id: int,
    before_days_ago: int = 365,
    after_days_ago: int = 0,
):
    """
    Fully automatic change detection for a red zone: fetches REAL
    Sentinel-2 satellite imagery for two time periods (via
    Copernicus Data Space Ecosystem) and runs genuine computer
    vision change detection on them - no manual image upload.

    Requires CDSE_CLIENT_ID / CDSE_CLIENT_SECRET environment
    variables to be set (see ai/satellite_fetch.py).
    """
    db = SessionLocal()
    try:
        zone = db.query(RedZone).filter(RedZone.id == red_zone_id).first()
        if not zone:
            return {"error": "Red zone not found"}

        today = date.today()
        before_center = today - timedelta(days=before_days_ago)
        after_center = today - timedelta(days=after_days_ago)

        try:
            before_bytes = fetch_satellite_image(
                latitude=zone.latitude,
                longitude=zone.longitude,
                date_from=(before_center - timedelta(days=15)).isoformat(),
                date_to=(before_center + timedelta(days=15)).isoformat(),
            )
            after_bytes = fetch_satellite_image(
                latitude=zone.latitude,
                longitude=zone.longitude,
                date_from=(after_center - timedelta(days=15)).isoformat(),
                date_to=after_center.isoformat(),
            )
        except Exception as exc:
            return {
                "error": "Satellite image fetch failed",
                "detail": str(exc),
            }

        result = detect_change_from_images(before_bytes, after_bytes)

        detection = AIDetection(
            location=f"{zone.zone_name} ({zone.district})",
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
            "message": "Automatic satellite change detection completed",
            "red_zone_id": red_zone_id,
            "district": zone.district,
            "id": detection.id,
            "change_percentage": detection.change_percentage,
            "regions_detected": detection.regions_detected,
            "change_detected": detection.change_detected,
            "confidence": detection.confidence,
            "risk_level": detection.risk_level,
        }
    finally:
        db.close()
