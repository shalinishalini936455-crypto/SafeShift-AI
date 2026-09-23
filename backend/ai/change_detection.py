"""
SafeShift AI - GIS Change Detection

WHAT THIS ACTUALLY DOES
------------------------
Takes two real images of the SAME location (a "before" and an
"after" satellite/drone/aerial image) and detects structural
change between them using classical computer vision:

    1. Align sizes, convert both to grayscale
    2. Blur slightly to reduce noise (sensor/lighting differences)
    3. Compute an absolute pixel-wise difference
    4. Threshold the difference to isolate meaningfully changed
       regions (small lighting/shadow differences are ignored)
    5. Find contours (connected changed regions) above a minimum
       area - each one is a candidate "new structure" or
       significant land-use change
    6. Report: change_percentage, number of changed regions,
       and a confidence score based on how strong the change is

HONEST LIMITATION
------------------
This does NOT automatically fetch new satellite imagery on a
schedule - that requires a paid imagery API (Sentinel Hub /
Google Earth Engine) which is a separate integration. This
module analyzes whatever before/after image pair it's given,
whenever it's given one. "Continuous monitoring" in this system
means: the moment a new image pair is submitted (by a field
officer, drone operator, or a future automated imagery feed),
it's analyzed immediately and the dashboard updates - not that
it invents new imagery on its own.
"""

import cv2
import numpy as np


MIN_CHANGE_REGION_AREA = 150  # pixels - ignore tiny noise blobs
CHANGE_PIXEL_THRESHOLD = 30   # 0-255 grayscale difference to count as "changed"


def _decode_image(image_bytes: bytes):
    """Decode raw image bytes (from an uploaded file) into an OpenCV image."""
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image - unsupported or corrupt file")
    return image


def detect_change_from_images(before_bytes: bytes, after_bytes: bytes) -> dict:
    """
    Real image comparison. Returns a dict with:
        change_percentage   float, 0-100
        regions_detected    int, number of distinct changed areas
        change_detected     bool
        confidence          float, 0-1
    """
    before_img = _decode_image(before_bytes)
    after_img = _decode_image(after_bytes)

    # Resize "after" to match "before" if dimensions differ
    # (e.g. images captured at slightly different zoom/crop).
    if before_img.shape[:2] != after_img.shape[:2]:
        after_img = cv2.resize(after_img, (before_img.shape[1], before_img.shape[0]))

    before_gray = cv2.cvtColor(before_img, cv2.COLOR_BGR2GRAY)
    after_gray = cv2.cvtColor(after_img, cv2.COLOR_BGR2GRAY)

    before_blur = cv2.GaussianBlur(before_gray, (5, 5), 0)
    after_blur = cv2.GaussianBlur(after_gray, (5, 5), 0)

    diff = cv2.absdiff(before_blur, after_blur)
    _, thresh = cv2.threshold(diff, CHANGE_PIXEL_THRESHOLD, 255, cv2.THRESH_BINARY)

    # Clean up small speckle noise
    kernel = np.ones((3, 3), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    thresh = cv2.dilate(thresh, kernel, iterations=2)

    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    significant_regions = [
        c for c in contours if cv2.contourArea(c) >= MIN_CHANGE_REGION_AREA
    ]

    total_pixels = thresh.shape[0] * thresh.shape[1]
    changed_pixels = cv2.countNonZero(thresh)
    change_percentage = round((changed_pixels / total_pixels) * 100, 2)

    # A simple, explainable confidence measure: how much of the
    # changed area is concentrated in real regions (vs scattered
    # noise), scaled by how much change there is overall.
    region_pixel_total = sum(cv2.contourArea(c) for c in significant_regions)
    concentration = (
        region_pixel_total / changed_pixels if changed_pixels > 0 else 0
    )
    confidence = round(min(1.0, concentration * min(change_percentage / 5, 1.0)), 2)

    change_detected = len(significant_regions) > 0 and change_percentage >= 0.5

    return {
        "change_percentage": change_percentage,
        "regions_detected": len(significant_regions),
        "change_detected": change_detected,
        "confidence": confidence,
    }