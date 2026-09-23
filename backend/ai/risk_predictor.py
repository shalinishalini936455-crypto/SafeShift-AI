"""
SafeShift AI - Risk Level Predictor

Loads the trained RandomForestClassifier (see ai/train_model.py)
and exposes a simple function to predict a risk label + confidence
for a given (occurrence_count, severity_score, hazard_type).

If the model file doesn't exist yet (train_model.py hasn't been
run), this fails gracefully and the caller should just skip the
ML prediction rather than crash the whole sync.
"""

import os

import joblib

from ai.train_model import hazard_weight

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "models", "risk_model.pkl"
)

_model = None
_model_load_error = None


def _load_model():
    global _model, _model_load_error

    if _model is not None or _model_load_error is not None:
        return

    try:
        _model = joblib.load(MODEL_PATH)
    except Exception as exc:
        _model_load_error = str(exc)


def predict_risk(occurrence_count: int, severity_score: float, hazard_type: str):
    """
    Returns (predicted_label: str | None, confidence: float | None).

    Returns (None, None) if the model hasn't been trained yet -
    callers should treat this as "ML prediction unavailable" and
    fall back to the rule-based severity, not as an error.
    """
    _load_model()

    if _model is None:
        return None, None

    h_weight = hazard_weight(hazard_type)
    features = [[occurrence_count, severity_score, h_weight]]

    probabilities = _model.predict_proba(features)[0]
    predicted_index = probabilities.argmax()
    predicted_label = _model.classes_[predicted_index]
    confidence = float(probabilities[predicted_index])

    return predicted_label, confidence
