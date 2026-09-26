from fastapi import APIRouter
from ai.capacity import calculate_capacity

router = APIRouter(
    prefix="/api/capacity",
)

@router.post("/calculate")
def calculate_site_capacity(
    total_capacity: int,
    occupied_capacity: int,
    required_people: int
):
    return calculate_capacity(
        total_capacity,
        occupied_capacity,
        required_people
    )
