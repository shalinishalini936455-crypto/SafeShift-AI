from fastapi import APIRouter
from ai.change_detection import detect_change

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Detection"]
)

@router.post("/change-detection")
def change_detection(before_value: str, after_value: str):
    return detect_change(before_value, after_value)
