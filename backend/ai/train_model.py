"""
SafeShift AI - Risk Level Predictor: Training Script

WHAT THIS TRAINS
-----------------
A RandomForestClassifier that predicts a risk severity label
(Low / Medium / High / Critical) for a location, from features:

    - occurrence_count   how many times a hazard has recurred there
    - severity_score     numeric severity of the current/latest alert (0-100)
    - hazard_weight      how dangerous this TYPE of hazard tends to be
                         (Flood/Landslide weighted higher than Thunderstorm, etc.)

HOW THE TRAINING DATA IS BUILT (BE HONEST ABOUT THIS)
-------------------------------------------------------
There is no public labeled "Red Zone outcome" dataset for India to
train on. This script generates a domain-informed synthetic dataset:
labels are assigned using disaster-management thresholds (higher
occurrence + higher severity + more dangerous hazard type = higher
risk label), then random noise is added so the classes are NOT
perfectly separable - meaning the Random Forest has to genuinely
learn a decision boundary rather than just re-deriving an if/else
rule. This is a standard, defensible approach when no real labeled
dataset exists yet: the same domain thresholds an expert would use,
turned into training signal for a model that can later be retrained
on real historical outcomes as your platform collects them.

WHAT IT SAVES
-------------
ai/models/risk_model.pkl - the trained RandomForestClassifier
Printed accuracy on a held-out test set, so you have a real,
reportable number for your SIH presentation.

RUN THIS ONCE:
    python -m ai.train_model
(run from the backend/ folder, with your venv active)
"""

import os
import random

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

random.seed(42)
np.random.seed(42)

# How dangerous each hazard type tends to be, on a 0-1 scale.
# These weights are domain judgement calls - documented here so
# they can be reviewed/adjusted by anyone, not hidden in a model.
HAZARD_WEIGHTS = {
    "flood": 0.9,
    "landslide": 0.85,
    "cloudburst": 0.8,
    "coastal erosion": 0.75,
    "cyclone": 0.9,
    "thunderstorm": 0.5,
    "lightning": 0.45,
    "heavy rain": 0.6,
    "other": 0.4,
}

RISK_LABELS = ["Low", "Medium", "High", "Critical"]


def hazard_weight(hazard_type: str) -> float:
    return HAZARD_WEIGHTS.get((hazard_type or "other").strip().lower(), 0.4)


def generate_training_data(n_samples: int = 4000):
    """
    Generates a synthetic-but-domain-informed dataset.

    Each row: [occurrence_count, severity_score, hazard_weight] -> label
    """
    rows = []
    labels = []

    hazard_types = list(HAZARD_WEIGHTS.keys())

    for _ in range(n_samples):
        occurrence_count = np.random.randint(1, 15)
        severity_score = np.random.uniform(10, 100)
        hazard_type = random.choice(hazard_types)
        h_weight = hazard_weight(hazard_type)

        # Combined danger signal (same spirit as the rule-based
        # escalation logic, but now used to LABEL training data,
        # not to make the live decision directly).
        combined = (
            severity_score * 0.5
            + occurrence_count * 4
            + h_weight * 40
        )

        # Add noise so classes overlap somewhat - forces the model
        # to learn a real boundary instead of memorizing a formula.
        combined += np.random.normal(0, 12)

        if combined >= 85:
            label = "Critical"
        elif combined >= 60:
            label = "High"
        elif combined >= 35:
            label = "Medium"
        else:
            label = "Low"

        rows.append([occurrence_count, severity_score, h_weight])
        labels.append(label)

    return np.array(rows), np.array(labels)


def train_and_save():
    X, y = generate_training_data()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print(f"Test accuracy: {accuracy:.3f}")
    print(classification_report(y_test, predictions))

    os.makedirs("ai/models", exist_ok=True)
    joblib.dump(model, "ai/models/risk_model.pkl")
    print("Saved model to ai/models/risk_model.pkl")


if __name__ == "__main__":
    train_and_save()
