def calculate_capacity(
    total_capacity: int,
    occupied_capacity: int,
    required_people: int
):
    available_capacity = total_capacity - occupied_capacity

    capacity_ok = available_capacity >= required_people

    if capacity_ok:
        status = "Sufficient"
    else:
        status = "Insufficient"

    return {
        "total_capacity": total_capacity,
        "occupied_capacity": occupied_capacity,
        "available_capacity": available_capacity,
        "required_people": required_people,
        "capacity_ok": capacity_ok,
        "status": status
    }
