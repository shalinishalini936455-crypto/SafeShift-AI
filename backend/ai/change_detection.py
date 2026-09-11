def detect_change(before_value, after_value):
    if before_value != after_value:
        return {
            "change_detected": True,
            "message": "Change detected"
        }

    return {
        "change_detected": False,
        "message": "No significant change detected"
    }
