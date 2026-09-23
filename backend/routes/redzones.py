from datetime import datetime, timezone, timedelta

from fastapi import APIRouter
from database.database import SessionLocal
from models.redzone import RedZone
from ai.redzone_sync import sync_red_zones_from_sachet

router = APIRouter(
    prefix="/api/red-zones",
    tags=["Red Zones"]
)

# Only re-sync against live SACHET alerts if this many minutes
# have passed since the last sync. This is REQUIRED - without
# it, every page load re-fetches up to 99 alerts individually
# and NDMA will rate-limit you (429 Too Many Requests).
SYNC_INTERVAL_MINUTES = 10

_last_sync_at = None  # in-memory, resets on server restart


def _sync_if_stale():
    global _last_sync_at

    now = datetime.now(timezone.utc)

    if (
        _last_sync_at is not None
        and now - _last_sync_at < timedelta(minutes=SYNC_INTERVAL_MINUTES)
    ):
        return

    db = SessionLocal()
    try:
        sync_red_zones_from_sachet(db)
        _last_sync_at = now
    except Exception as exc:
        print("[RedZones] Sync skipped:", str(exc))
    finally:
        db.close()


@router.get("/")
def get_red_zones(source: str = None):
    _sync_if_stale()

    db = SessionLocal()
    try:
        query = db.query(RedZone)
        if source:
            query = query.filter(RedZone.source == source)
        return query.all()
    finally:
        db.close()


@router.post("/refresh")
def refresh_red_zones():
    """
    Force an immediate sync, ignoring the cache interval.

    NOTE: if NDMA is currently rate-limiting you (you'll see
    "429 Too Many Requests" in the terminal and Mapped alerts: 0),
    calling this repeatedly will NOT help and may extend the
    rate limit. Wait a few minutes before trying again after
    seeing 429 errors.
    """
    global _last_sync_at

    db = SessionLocal()
    try:
        result = sync_red_zones_from_sachet(db)
        _last_sync_at = datetime.now(timezone.utc)
        total = db.query(RedZone).count()
        return {
            "message": "Red zone sync completed",
            "created": result["created"],
            "escalated": result["escalated"],
            "skipped": result["skipped"],
            "error": result["error"],
            "total_red_zones": total,
        }
    finally:
        db.close()
