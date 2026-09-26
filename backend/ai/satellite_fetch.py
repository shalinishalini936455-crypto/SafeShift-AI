"""
SafeShift AI - Satellite Image Fetch (Copernicus Data Space Ecosystem)

Fetches REAL Sentinel-2 satellite imagery for a given lat/lon area
and date, using the free Copernicus Data Space Ecosystem (CDSE)
Sentinel Hub Process API.

SETUP REQUIRED (one-time, free, no payment):
    1. Register at https://dataspace.copernicus.eu/
    2. In your dashboard, create an OAuth client under "Sentinel Hub"
    3. Set these as environment variables (never hardcode them):
           CDSE_CLIENT_ID
           CDSE_CLIENT_SECRET

FREE TIER LIMITS (as of account creation - check your dashboard
for current numbers, these can change):
    ~10,000 processing units/month, ~12TB transfer/month.
    Each image request here costs a small number of processing
    units - fine for a hackathon demo, not for high-frequency
    polling of hundreds of zones every few minutes.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()  # loads CDSE_CLIENT_ID / CDSE_CLIENT_SECRET from backend/.env

TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process"

_access_token = None


def _get_access_token() -> str:
    global _access_token

    client_id = os.environ.get("CDSE_CLIENT_ID")
    client_secret = os.environ.get("CDSE_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise RuntimeError(
            "CDSE_CLIENT_ID / CDSE_CLIENT_SECRET environment variables "
            "are not set. Register free at dataspace.copernicus.eu and "
            "create an OAuth client under Sentinel Hub."
        )

    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
        timeout=15,
    )
    response.raise_for_status()
    _access_token = response.json()["access_token"]
    return _access_token


# True-color evalscript - tells Sentinel Hub to render a normal
# looking RGB image (not raw spectral bands).
TRUE_COLOR_EVALSCRIPT = """
//VERSION=3
function setup() {
    return {
        input: ["B04", "B03", "B02"],
        output: { bands: 3 }
    };
}
function evaluatePixel(sample) {
    return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
}
"""


def fetch_satellite_image(
    latitude: float,
    longitude: float,
    date_from: str,
    date_to: str,
    box_km: float = 1.0,
    image_size: int = 512,
) -> bytes:
    """
    Fetch a true-color satellite image for a small area around
    (latitude, longitude), using the least-cloudy Sentinel-2 scene
    available between date_from and date_to (format: "YYYY-MM-DD").

    Returns raw JPEG image bytes.
    """
    token = _get_access_token()

    # Rough conversion: box_km -> degrees (good enough for a small
    # area of interest around one red zone, not for large regions).
    delta = box_km / 111.0  # ~111km per degree latitude

    bbox = [
        longitude - delta,
        latitude - delta,
        longitude + delta,
        latitude + delta,
    ]

    payload = {
        "input": {
            "bounds": {
                "bbox": bbox,
                "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"},
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{date_from}T00:00:00Z",
                            "to": f"{date_to}T23:59:59Z",
                        },
                        "mosaickingOrder": "leastCC",  # least cloud cover
                    },
                }
            ],
        },
        "output": {
            "width": image_size,
            "height": image_size,
            "responses": [{"identifier": "default", "format": {"type": "image/jpeg"}}],
        },
        "evalscript": TRUE_COLOR_EVALSCRIPT,
    }

    response = requests.post(
        PROCESS_URL,
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    response.raise_for_status()

    return response.content