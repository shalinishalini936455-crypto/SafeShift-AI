"""
SafeShift AI - Red Zone Sync (rule-based escalation + ML prediction)

Combines two distinct AI components, kept separate on purpose:

1. RULE-BASED ESCALATION (explainable, deterministic)
   Groups alerts by (district, hazard_type). Recurring hazards in
   the same place escalate risk_score and occurrence_count, and
   flip is_permanent_zone once a threshold is crossed.

2. TRAINED ML PREDICTION (ai/risk_predictor.py)
   A RandomForestClassifier predicts a risk label + confidence
   from the same features. This is stored alongside, not used to
   overwrite, the rule-based severity - so you can show both to
   judges: "our explainable rule engine says X, and our trained
   model independently agrees/predicts Y at Z% confidence."
"""

from datetime import datetime, timezone

from models.redzone import RedZone
from sachet_service import fetch_sachet_alerts
from ai.risk_predictor import predict_risk


SEVERITY_SCORE_MAP = {
    "extreme": 95,
    "severe": 80,
    "moderate": 55,
    "minor": 30,
    "unknown": 40,
}

ESCALATION_STEP = 5
PERMANENT_THRESHOLD = 3
MAX_RISK_SCORE = 100


def severity_to_score(severity: str) -> float:
    if not severity:
        return SEVERITY_SCORE_MAP["unknown"]
    return SEVERITY_SCORE_MAP.get(
        severity.strip().lower(),
        SEVERITY_SCORE_MAP["unknown"],
    )


def severity_to_label(severity: str) -> str:
    score = severity_to_score(severity)
    if score >= 80:
        return "Critical"
    elif score >= 55:
        return "High"
    elif score >= 30:
        return "Medium"
    return "Low"


def _apply_ml_prediction(zone: RedZone):
    """Attach the trained model's prediction to a zone, if available."""
    label, confidence = predict_risk(
        occurrence_count=zone.occurrence_count,
        severity_score=zone.risk_score,
        hazard_type=zone.hazard_type,
    )
    zone.ml_predicted_severity = label  # None if model not trained yet
    zone.ml_confidence = confidence


def sync_red_zones_from_sachet(db) -> dict:
    result = {"created": 0, "escalated": 0, "skipped": 0, "error": None}

    try:
        data = fetch_sachet_alerts()
    except Exception as exc:
        result["error"] = str(exc)
        return result

    alerts = data.get("alerts", [])

    for alert in alerts:
        hazard_type = alert.get("hazard_type", "Other")
        severity = alert.get("severity", "")
        base_score = severity_to_score(severity)
        severity_label = severity_to_label(severity)

        locations = alert.get("locations", [])
        if not locations:
            result["skipped"] += 1
            continue

        for loc in locations:
            if loc.get("type") not in ("District", "Circle"):
                continue

            latitude = loc.get("latitude")
            longitude = loc.get("longitude")
            if latitude is None or longitude is None:
                continue

            district = loc.get("district") or (
                alert.get("affected_districts", ["Unknown"])[0]
                if alert.get("affected_districts")
                else "Unknown"
            )

            external_id = f"{district}:{hazard_type}".lower()

            existing = (
                db.query(RedZone)
                .filter(RedZone.external_id == external_id)
                .first()
            )

            if existing:
                existing.occurrence_count += 1

                escalated_score = base_score + (
                    (existing.occurrence_count - 1) * ESCALATION_STEP
                )
                escalated_score = min(escalated_score, MAX_RISK_SCORE)

                existing.risk_score = max(existing.risk_score, escalated_score)
                existing.severity = severity_to_label(
                    "extreme" if existing.risk_score >= 80 else severity
                )
                existing.latitude = float(latitude)
                existing.longitude = float(longitude)
                existing.source = "SACHET"
                existing.last_updated = datetime.now(timezone.utc)

                if existing.occurrence_count >= PERMANENT_THRESHOLD:
                    existing.is_permanent_zone = True

                _apply_ml_prediction(existing)

                result["escalated"] += 1
            else:
                zone_name = (alert.get("headline") or hazard_type)[:100]

                new_zone = RedZone(
                    zone_name=zone_name,
                    district=district,
                    latitude=float(latitude),
                    longitude=float(longitude),
                    hazard_type=hazard_type,
                    severity=severity_label,
                    risk_score=base_score,
                    source="SACHET",
                    external_id=external_id,
                    occurrence_count=1,
                    first_detected=datetime.now(timezone.utc),
                    last_updated=datetime.now(timezone.utc),
                    is_permanent_zone=False,
                )
                _apply_ml_prediction(new_zone)

                db.add(new_zone)
                result["created"] += 1

    db.commit()
    return result
