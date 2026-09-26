# ============================================================
# SafeShift AI
# NDMA SACHET - INDIA-WIDE LIVE HAZARD SERVICE
#
# Source:
#   NDMA SACHET India CAP RSS Feed
#
# Purpose:
#   Fetch real active disaster alerts from the SACHET
#   Pan-India CAP feed and convert them into a clean
#   structure for the SafeShift AI frontend.
#
# Geometry priority:
#   1. CAP Polygon
#   2. CAP Circle
#   3. CAP Point / coordinate
#   4. LGD Code -> District -> Coordinate
#   5. Affected District -> Coordinate
#   6. Unmapped
#
# IMPORTANT:
#   This file NEVER creates fake hazards.
#   If SACHET has no active alert, no fake alert is created.
# ============================================================

import json
import re
import time
import xml.etree.ElementTree as ET

from datetime import datetime, timezone
from urllib.parse import urljoin

import feedparser
import requests


# ============================================================
# OPTIONAL PROJECT FILES
# ============================================================

try:
    from district_coordinates import DISTRICT_COORDINATES
except Exception:
    DISTRICT_COORDINATES = {}


try:
    from lgd_district_map import (
        get_district_names_from_lgd_codes,
        get_unmapped_lgd_codes,
        get_mapping_status,
    )
except Exception:

    def get_district_names_from_lgd_codes(codes):
        return []

    def get_unmapped_lgd_codes(codes):
        return list(codes or [])

    def get_mapping_status(codes):
        return {
            "mapped": [],
            "unmapped": list(codes or []),
            "mapped_count": 0,
            "unmapped_count": len(codes or []),
        }


# ============================================================
# SACHET INDIA RSS FEED
# ============================================================

SACHET_FEED_URL = (
    "https://sachet.ndma.gov.in/"
    "cap_public_website/rss/rss_india.xml"
)

SACHET_BASE_URL = "https://sachet.ndma.gov.in/"

REQUEST_TIMEOUT = 20

USER_AGENT = (
    "SafeShift-AI/1.0 "
    "(India Disaster Risk Decision Support System)"
)


# ============================================================
# HTTP SESSION
# ============================================================

SESSION = requests.Session()

SESSION.headers.update(
    {
        "User-Agent": USER_AGENT,
        "Accept": (
            "application/xml, "
            "text/xml, "
            "application/rss+xml, "
            "application/json, "
            "*/*"
        ),
    }
)


# ============================================================
# XML NAMESPACES
# ============================================================

CAP_NS = "urn:oasis:names:tc:emergency:cap:1.2"


# ============================================================
# BASIC HELPERS
# ============================================================

def clean_text(value):
    """
    Convert XML/text values into clean strings.
    """
    if value is None:
        return ""

    value = str(value)

    value = value.replace("\r", " ")
    value = value.replace("\n", " ")

    value = re.sub(r"\s+", " ", value)

    return value.strip()


def local_name(tag):
    """
    Return XML tag name without namespace.

    Example:
        {urn:oasis:names:tc:emergency:cap:1.2}event
        ->
        event
    """
    if not tag:
        return ""

    if "}" in tag:
        return tag.split("}", 1)[1]

    return tag


def find_child(element, name):
    """
    Find a direct child by local XML name.
    """
    if element is None:
        return None

    for child in list(element):
        if local_name(child.tag) == name:
            return child

    return None


def find_children(element, name):
    """
    Find direct children by local XML name.
    """
    if element is None:
        return []

    return [
        child
        for child in list(element)
        if local_name(child.tag) == name
    ]


def child_text(element, name, default=""):
    """
    Get text from a child element.
    """
    child = find_child(element, name)

    if child is None:
        return default

    return clean_text(child.text)


# ============================================================
# DATETIME
# ============================================================

def parse_datetime(value):
    """
    Convert CAP ISO timestamp into ISO UTC timestamp.

    Returns:
        string or None
    """

    value = clean_text(value)

    if not value:
        return None

    try:
        text = value

        if text.endswith("Z"):
            text = text[:-1] + "+00:00"

        dt = datetime.fromisoformat(text)

        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)

        return dt.astimezone(timezone.utc).isoformat()

    except Exception:
        return value


def datetime_to_timestamp(value):
    """
    Convert ISO timestamp to Unix timestamp.
    """
    if not value:
        return None

    try:
        text = value

        if text.endswith("Z"):
            text = text[:-1] + "+00:00"

        dt = datetime.fromisoformat(text)

        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)

        return dt.timestamp()

    except Exception:
        return None


# ============================================================
# ACTIVE ALERT CHECK
# ============================================================

def is_current_alert(effective=None, onset=None, expires=None):
    """
    Determine whether an alert is currently relevant.

    Expired alerts are excluded.

    Future alerts with a future onset are retained only if
    they have not expired, because SACHET may publish
    upcoming warnings.
    """

    now = datetime.now(timezone.utc).timestamp()

    expires_ts = datetime_to_timestamp(expires)

    if expires_ts is not None:
        if expires_ts <= now:
            return False

    return True


# ============================================================
# HAZARD CLASSIFICATION
# ============================================================

def classify_hazard(event="", headline="", description=""):
    """
    Convert the official CAP event text into a convenient
    SafeShift hazard category.

    The original official event is preserved separately.
    """

    text = " ".join(
        [
            clean_text(event),
            clean_text(headline),
            clean_text(description),
        ]
    ).lower()

    # Order matters.

    if "tsunami" in text:
        return "Tsunami"

    if "cyclone" in text:
        return "Cyclone"

    if "flood" in text:
        return "Flood"

    if "landslide" in text:
        return "Landslide"

    if "avalanche" in text:
        return "Avalanche"

    if "earthquake" in text or "seismic" in text:
        return "Earthquake"

    if "forest fire" in text:
        return "Forest Fire"

    if "wildfire" in text:
        return "Forest Fire"

    if "fire" in text:
        return "Fire"

    if "lightning" in text:
        return "Lightning"

    if "thunderstorm" in text:
        return "Thunderstorm"

    if "dust storm" in text:
        return "Dust Storm"

    if "duststorm" in text:
        return "Dust Storm"

    if "squall" in text:
        return "Squall"

    if "heat wave" in text:
        return "Heatwave"

    if "heatwave" in text:
        return "Heatwave"

    if "cold wave" in text:
        return "Cold Wave"

    if "coldwave" in text:
        return "Cold Wave"

    if "heavy rain" in text:
        return "Heavy Rain"

    if "rain" in text:
        return "Rain"

    if "snow" in text:
        return "Snow"

    if "smog" in text:
        return "Smog / Air Pollution"

    if "air pollution" in text:
        return "Smog / Air Pollution"

    if "drought" in text:
        return "Drought"

    if "chemical" in text:
        return "Chemical Emergency"

    if "biological" in text:
        return "Biological Emergency"

    if "nuclear" in text or "radiological" in text:
        return "Nuclear / Radiological Emergency"

    if event:
        return clean_text(event)

    return "Other"


# ============================================================
# DISTRICT NAME NORMALIZATION
# ============================================================

def normalize_district_name(name):
    """
    Normalize district names received from SACHET.

    Handles:
      District of X
      Districts of X
      hyphens
      Vijayawada Rural
      Chirimiri Bharatpur
      extra spaces
    """

    if not name:
        return ""

    text = clean_text(name).lower()

    text = text.replace("&", " and ")

    text = text.replace("districtsof", "districts of ")
    text = text.replace("districtof", "district of ")

    text = text.replace("vijayawadarural", "vijayawada rural")

    text = text.replace(
        "chirimiribharatpur",
        "chirimiri bharatpur",
    )

    text = re.sub(
        r"^(district|districts)\s+of\s+",
        "",
        text,
    )

    text = text.replace("-", " ")

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def compact_name(name):
    """
    Compact district name for fallback matching.
    """
    return re.sub(
        r"[^a-z0-9]",
        "",
        normalize_district_name(name),
    )


# ============================================================
# LOCATION TEXT CLEANING
# ============================================================

GENERIC_LOCATION_WORDS = {
    "india",
    "the",
    "of",
    "district",
    "districts",
    "mandal",
    "mandals",
    "state",
    "states",
}


def clean_location_text(text):
    """
    Clean an area description from CAP.
    """

    if not text:
        return ""

    text = clean_text(text).lower()

    text = re.sub(
        r"\b\d+\s+districts?\b",
        "",
        text,
    )

    text = re.sub(
        r"\b\d+\s+mandals?\b",
        "",
        text,
    )

    text = re.sub(
        r"\bdistricts?\s+of\b",
        "",
        text,
    )

    text = re.sub(
        r"\bmandals?\s+of\b",
        "",
        text,
    )

    text = re.sub(
        r"\s+districts?\b",
        "",
        text,
    )

    text = re.sub(
        r"\s+mandals?\b",
        "",
        text,
    )

    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ============================================================
# STATE NAMES
# ============================================================

INDIAN_STATES_AND_UTS = {
    "andhra pradesh",
    "arunachal pradesh",
    "assam",
    "bihar",
    "chhattisgarh",
    "goa",
    "gujarat",
    "haryana",
    "himachal pradesh",
    "jharkhand",
    "karnataka",
    "kerala",
    "madhya pradesh",
    "maharashtra",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "odisha",
    "punjab",
    "rajasthan",
    "sikkim",
    "tamil nadu",
    "telangana",
    "tripura",
    "uttar pradesh",
    "uttarakhand",
    "west bengal",
    "andaman and nicobar islands",
    "chandigarh",
    "dadra and nagar haveli and daman and diu",
    "delhi",
    "jammu and kashmir",
    "ladakh",
    "lakshadweep",
    "puducherry",
}


# ============================================================
# SPLIT AREA DESCRIPTIONS
# ============================================================

def split_area_description(area_description):
    """
    Split CAP areaDesc into possible district names.

    SACHET descriptions can contain commas, semicolons,
    line breaks, etc.
    """

    if not area_description:
        return []

    text = str(area_description)

    text = text.replace(";", ",")

    text = text.replace("|", ",")

    text = text.replace("\n", ",")

    parts = [
        clean_location_text(part)
        for part in text.split(",")
    ]

    results = []

    for part in parts:

        if not part:
            continue

        normalized = normalize_district_name(part)

        if not normalized:
            continue

        if normalized in INDIAN_STATES_AND_UTS:
            continue

        if re.fullmatch(
            r"\d+\s+(districts?|mandals?)",
            normalized,
        ):
            continue

        results.append(part)

    return results


# ============================================================
# CAP GEOCODES
# ============================================================

def parse_geocodes(area):
    """
    Extract CAP geocodes.

    Example:

        valueName = LGD
        value = 123

    Returns:

        {
            "LGD": ["123"]
        }
    """

    result = {}

    if area is None:
        return result

    for geocode in find_children(area, "geocode"):

        value_name = child_text(
            geocode,
            "valueName",
        )

        value = child_text(
            geocode,
            "value",
        )

        if not value:
            continue

        key = clean_text(value_name).upper()

        if not key:
            key = "UNKNOWN"

        result.setdefault(key, [])

        if value not in result[key]:
            result[key].append(value)

    return result


def extract_lgd_codes(geocodes):
    """
    Extract LGD codes from all CAP geocode formats.
    """

    codes = []

    for key, values in geocodes.items():

        key_upper = key.upper()

        if (
            "LGD" not in key_upper
            and "LOCAL" not in key_upper
        ):
            continue

        for value in values:

            # Some CAP records contain multiple values.
            parts = re.split(
                r"[,;\s]+",
                clean_text(value),
            )

            for part in parts:

                part = part.strip()

                if not part:
                    continue

                if part not in codes:
                    codes.append(part)

    return codes


# ============================================================
# CAP POLYGON
# ============================================================

def parse_polygon_text(value):
    """
    Parse CAP polygon.

    CAP polygon format:

        latitude,longitude latitude,longitude ...

    Returns Leaflet-friendly:

        [
            [lat, lon],
            [lat, lon],
            ...
        ]
    """

    if not value:
        return []

    points = []

    # CAP polygons normally separate points by spaces.
    raw_points = re.split(
        r"\s+",
        clean_text(value),
    )

    for raw_point in raw_points:

        raw_point = raw_point.strip()

        if not raw_point:
            continue

        parts = raw_point.split(",")

        if len(parts) != 2:
            continue

        try:

            lat = float(parts[0])
            lon = float(parts[1])

            if -90 <= lat <= 90 and -180 <= lon <= 180:

                points.append(
                    [lat, lon]
                )

        except Exception:
            continue

    # A valid polygon requires at least 3 points.
    if len(points) < 3:
        return []

    return points


# ============================================================
# CAP CIRCLE
# ============================================================

def parse_circle_text(value):
    """
    Parse CAP circle.

    CAP format:

        latitude,longitude radius_km

    Example:

        13.0827,80.2707 50

    Returns:

        {
            "latitude": 13.0827,
            "longitude": 80.2707,
            "radius_km": 50
        }
    """

    if not value:
        return None

    text = clean_text(value)

    match = re.match(
        r"^\s*"
        r"([-+]?\d+(?:\.\d+)?)"
        r"\s*,\s*"
        r"([-+]?\d+(?:\.\d+)?)"
        r"(?:\s+|,)"
        r"([-+]?\d+(?:\.\d+)?)"
        r"\s*$",
        text,
    )

    if not match:
        return None

    try:

        latitude = float(match.group(1))
        longitude = float(match.group(2))
        radius_km = float(match.group(3))

        if not (
            -90 <= latitude <= 90
            and -180 <= longitude <= 180
        ):
            return None

        if radius_km <= 0:
            return None

        return {
            "latitude": latitude,
            "longitude": longitude,
            "radius_km": radius_km,
        }

    except Exception:
        return None


# ============================================================
# CAP POINT
# ============================================================

def parse_point_text(value):
    """
    Parse a latitude,longitude point.
    """

    if not value:
        return None

    text = clean_text(value)

    parts = text.split(",")

    if len(parts) != 2:
        return None

    try:

        latitude = float(parts[0])
        longitude = float(parts[1])

        if not (
            -90 <= latitude <= 90
            and -180 <= longitude <= 180
        ):
            return None

        return {
            "latitude": latitude,
            "longitude": longitude,
        }

    except Exception:
        return None


# ============================================================
# PARSE AREA GEOMETRY
# ============================================================

def parse_area_geometry(area):
    """
    Read geometry directly from CAP area.

    Priority:

        polygon
        circle
        geocode/point
    """

    if area is None:
        return None

    # --------------------------------------------------------
    # POLYGON
    # --------------------------------------------------------

    polygon_text = child_text(
        area,
        "polygon",
    )

    polygon = parse_polygon_text(
        polygon_text
    )

    if polygon:

        return {
            "type": "Polygon",
            "coordinates": polygon,
            "source": "SACHET CAP polygon",
        }

    # --------------------------------------------------------
    # CIRCLE
    # --------------------------------------------------------

    circle_text = child_text(
        area,
        "circle",
    )

    circle = parse_circle_text(
        circle_text
    )

    if circle:

        return {
            "type": "Circle",
            "coordinates": [
                circle["latitude"],
                circle["longitude"],
            ],
            "radius_km": circle["radius_km"],
            "source": "SACHET CAP circle",
        }

    return None


# ============================================================
# CAP PARAMETERS
# ============================================================

def parse_parameters(info):
    """
    Read CAP <parameter> fields.

    Returns:

        {
            "Polygon": "...",
            "foo": "bar"
        }
    """

    parameters = {}

    if info is None:
        return parameters

    for parameter in find_children(
        info,
        "parameter",
    ):

        value_name = child_text(
            parameter,
            "valueName",
        )

        value = child_text(
            parameter,
            "value",
        )

        if not value:
            continue

        if not value_name:
            value_name = "unknown"

        parameters[value_name] = value

    return parameters


# ============================================================
# OPTIONAL EXTERNAL POLYGON
# ============================================================

def parse_geojson_geometry(data):
    """
    Extract Leaflet-compatible geometry from GeoJSON.
    """

    if not isinstance(data, dict):
        return None

    geometry = data.get("geometry")

    if not geometry:
        geometry = data

    if not isinstance(geometry, dict):
        return None

    geometry_type = geometry.get("type")

    coordinates = geometry.get(
        "coordinates"
    )

    if geometry_type == "Polygon":

        if not coordinates:
            return None

        ring = coordinates[0]

        converted = []

        for point in ring:

            if (
                isinstance(point, list)
                and len(point) >= 2
            ):

                lon = float(point[0])
                lat = float(point[1])

                converted.append(
                    [lat, lon]
                )

        if len(converted) >= 3:

            return {
                "type": "Polygon",
                "coordinates": converted,
                "source": "SACHET polygon service",
            }

    return None


def try_fetch_external_polygon(url):
    """
    Some SACHET CAP alerts may expose polygon data through
    an external parameter URL.

    This function is optional. If it fails, the main CAP
    alert is still returned.
    """

    if not url:
        return None

    url = clean_text(url)

    if not url:
        return None

    try:

        response = SESSION.get(
            url,
            timeout=REQUEST_TIMEOUT,
        )

        if response.status_code != 200:
            return None

        content_type = (
            response.headers.get(
                "content-type",
                ""
            ).lower()
        )

        text = response.text.strip()

        # ----------------------------------------------------
        # JSON / GEOJSON
        # ----------------------------------------------------

        if (
            "json" in content_type
            or text.startswith("{")
        ):

            data = response.json()

            geometry = parse_geojson_geometry(
                data
            )

            if geometry:
                return geometry

        # ----------------------------------------------------
        # XML / KML
        # ----------------------------------------------------

        if (
            "xml" in content_type
            or text.startswith("<")
        ):

            try:

                root = ET.fromstring(
                    response.content
                )

                coordinates = []

                for element in root.iter():

                    if (
                        local_name(
                            element.tag
                        ).lower()
                        == "coordinates"
                    ):

                        value = clean_text(
                            element.text
                        )

                        for item in value.split():

                            parts = item.split(",")

                            if len(parts) < 2:
                                continue

                            try:

                                lon = float(parts[0])
                                lat = float(parts[1])

                                coordinates.append(
                                    [lat, lon]
                                )

                            except Exception:
                                continue

                if len(coordinates) >= 3:

                    return {
                        "type": "Polygon",
                        "coordinates": coordinates,
                        "source": "SACHET external polygon",
                    }

            except Exception:
                pass

    except Exception:
        pass

    return None


# ============================================================
# CAP XML DOWNLOAD
# ============================================================

def download_cap_xml(url):
    """
    Download CAP XML from SACHET.
    """

    if not url:
        return None

    try:

        response = SESSION.get(
            url,
            timeout=REQUEST_TIMEOUT,
        )

        response.raise_for_status()

        return response.content

    except Exception as exc:

        print(
            "[SACHET] CAP download failed:",
            url,
            str(exc),
        )

        return None


# ============================================================
# CAP XML PARSER
# ============================================================

def parse_cap_alert(cap_url):
    """
    Parse one SACHET CAP XML alert.
    """

    xml_content = download_cap_xml(
        cap_url
    )

    if not xml_content:
        return None

    try:

        root = ET.fromstring(
            xml_content
        )

    except Exception as exc:

        print(
            "[SACHET] XML parse failed:",
            str(exc),
        )

        return None

    # ========================================================
    # ALERT LEVEL
    # ========================================================

    identifier = child_text(
        root,
        "identifier",
    )

    sender = child_text(
        root,
        "sender",
    )

    sent = parse_datetime(
        child_text(
            root,
            "sent",
        )
    )

    status = child_text(
        root,
        "status",
    )

    msg_type = child_text(
        root,
        "msgType",
    )

    source = child_text(
        root,
        "source",
    )

    scope = child_text(
        root,
        "scope",
    )

    # ========================================================
    # INFO
    # ========================================================

    info = None

    for child in list(root):

        if local_name(child.tag) == "info":

            info = child

            break

    if info is None:
        return None

    # ========================================================
    # BASIC INFO
    # ========================================================

    language = child_text(
        info,
        "language",
    )

    category = child_text(
        info,
        "category",
    )

    event = child_text(
        info,
        "event",
    )

    response_type = child_text(
        info,
        "responseType",
    )

    urgency = child_text(
        info,
        "urgency",
    )

    severity = child_text(
        info,
        "severity",
    )

    certainty = child_text(
        info,
        "certainty",
    )

    effective = parse_datetime(
        child_text(
            info,
            "effective",
        )
    )

    onset = parse_datetime(
        child_text(
            info,
            "onset",
        )
    )

    expires = parse_datetime(
        child_text(
            info,
            "expires",
        )
    )

    sender_name = child_text(
        info,
        "senderName",
    )

    headline = child_text(
        info,
        "headline",
    )

    description = child_text(
        info,
        "description",
    )

    instruction = child_text(
        info,
        "instruction",
    )

    web = child_text(
        info,
        "web",
    )

    parameters = parse_parameters(
        info
    )

    # ========================================================
    # AREA INFORMATION
    # ========================================================

    areas = find_children(
        info,
        "area",
    )

    all_districts = []
    all_lgd_codes = []

    geometries = []

    for area in areas:

        # ----------------------------------------------------
        # AREA DESCRIPTION
        # ----------------------------------------------------

        area_description = child_text(
            area,
            "areaDesc",
        )

        districts = split_area_description(
            area_description
        )

        for district in districts:

            normalized = normalize_district_name(
                district
            )

            if (
                normalized
                and normalized not in all_districts
            ):

                all_districts.append(
                    normalized
                )

        # ----------------------------------------------------
        # GEOCODES
        # ----------------------------------------------------

        geocodes = parse_geocodes(
            area
        )

        lgd_codes = extract_lgd_codes(
            geocodes
        )

        for code in lgd_codes:

            if code not in all_lgd_codes:

                all_lgd_codes.append(
                    code
                )

        # ----------------------------------------------------
        # DIRECT CAP GEOMETRY
        # ----------------------------------------------------

        geometry = parse_area_geometry(
            area
        )

        if geometry:

            geometries.append(
                geometry
            )

    # ========================================================
    # LGD -> DISTRICT
    # ========================================================

    lgd_district_names = (
        get_district_names_from_lgd_codes(
            all_lgd_codes
        )
    )

    unmapped_lgd_codes = (
        get_unmapped_lgd_codes(
            all_lgd_codes
        )
    )

    for district in lgd_district_names:

        normalized = normalize_district_name(
            district
        )

        if (
            normalized
            and normalized not in all_districts
        ):

            all_districts.append(
                normalized
            )

    # ========================================================
    # EXTERNAL POLYGON PARAMETER
    # ========================================================

    polygon_url = None

    for key, value in parameters.items():

        if "polygon" in key.lower():

            polygon_url = value

            break

    if polygon_url:

        polygon_geometry = (
            try_fetch_external_polygon(
                polygon_url
            )
        )

        if polygon_geometry:

            geometries.insert(
                0,
                polygon_geometry,
            )

    # ========================================================
    # HAZARD TYPE
    # ========================================================

    hazard_type = classify_hazard(
        event=event,
        headline=headline,
        description=description,
    )

    # ========================================================
    # CURRENT ALERT
    # ========================================================

    active = is_current_alert(
        effective=effective,
        onset=onset,
        expires=expires,
    )

    # ========================================================
    # RETURN
    # ========================================================

    return {
        "identifier": identifier,

        "source": "NDMA SACHET",

        "sender": sender,

        "sender_name": sender_name,

        "event": event,

        "hazard_type": hazard_type,

        "category": category,

        "response_type": response_type,

        "language": language,

        "status": status,

        "msg_type": msg_type,

        "scope": scope,

        "urgency": urgency,

        "severity": severity,

        "certainty": certainty,

        "sent": sent,

        "effective": effective,

        "onset": onset,

        "expires": expires,

        "active": active,

        "headline": headline,

        "description": description,

        "instruction": instruction,

        "web": web,

        "source_url": web or cap_url,

        "cap_url": cap_url,

        "affected_districts": all_districts,

        "lgd_codes": all_lgd_codes,

        "unmapped_lgd_codes": (
            unmapped_lgd_codes
        ),

        "parameters": parameters,

        "polygon_url": polygon_url,

        "geometries": geometries,
    }


# ============================================================
# COORDINATE LOOKUP
# ============================================================

def find_coordinates_by_name(name):
    """
    Find district coordinates.

    Uses normalized exact matching first,
    then compact-name matching.
    """

    if not name:
        return None

    normalized = normalize_district_name(
        name
    )

    # --------------------------------------------------------
    # DIRECT
    # --------------------------------------------------------

    if normalized in DISTRICT_COORDINATES:

        lat, lon = (
            DISTRICT_COORDINATES[
                normalized
            ]
        )

        return {
            "latitude": float(lat),
            "longitude": float(lon),
            "district": normalized,
        }

    # --------------------------------------------------------
    # COMPACT
    # --------------------------------------------------------

    compact = compact_name(
        normalized
    )

    for key, coordinates in (
        DISTRICT_COORDINATES.items()
    ):

        if compact_name(key) == compact:

            lat, lon = coordinates

            return {
                "latitude": float(lat),
                "longitude": float(lon),
                "district": normalize_district_name(
                    key
                ),
            }

    return None


# ============================================================
# DISTRICT COORDINATE RESOLUTION
# ============================================================

def resolve_district_coordinates(
    districts
):
    """
    Convert district names to map locations.

    These are FALLBACK visualization points.
    They do not replace official CAP geometry.
    """

    locations = []

    seen = set()

    for district in districts or []:

        normalized = normalize_district_name(
            district
        )

        if not normalized:
            continue

        # Skip generic descriptions.

        if re.fullmatch(
            r"\d+\s+(districts?|mandals?)",
            normalized,
        ):
            continue

        if normalized in INDIAN_STATES_AND_UTS:
            continue

        result = find_coordinates_by_name(
            normalized
        )

        if not result:
            continue

        key = (
            result["district"],
            round(result["latitude"], 6),
            round(result["longitude"], 6),
        )

        if key in seen:
            continue

        seen.add(key)

        locations.append(
            {
                "type": "District",
                "district": result[
                    "district"
                ],
                "latitude": result[
                    "latitude"
                ],
                "longitude": result[
                    "longitude"
                ],
                "source": (
                    "District coordinate fallback"
                ),
            }
        )

    return locations


# ============================================================
# REMOVE DUPLICATE LOCATIONS
# ============================================================

def remove_duplicate_locations(
    locations
):
    """
    Remove duplicate map locations.
    """

    result = []

    seen = set()

    for location in locations:

        if not isinstance(
            location,
            dict,
        ):
            continue

        location_type = location.get(
            "type"
        )

        # ----------------------------------------------------
        # POLYGON
        # ----------------------------------------------------

        if location_type == "Polygon":

            coordinates = location.get(
                "coordinates",
                [],
            )

            key = (
                "polygon",
                json.dumps(
                    coordinates,
                    sort_keys=True,
                ),
            )

        # ----------------------------------------------------
        # CIRCLE
        # ----------------------------------------------------

        elif location_type == "Circle":

            coords = location.get(
                "coordinates",
                [],
            )

            radius = location.get(
                "radius_km"
            )

            key = (
                "circle",
                tuple(coords),
                radius,
            )

        # ----------------------------------------------------
        # DISTRICT / POINT
        # ----------------------------------------------------

        else:

            key = (
                location_type,
                location.get(
                    "district"
                ),
                location.get(
                    "latitude"
                ),
                location.get(
                    "longitude"
                ),
            )

        if key in seen:
            continue

        seen.add(key)

        result.append(
            location
        )

    return result


# ============================================================
# BUILD FRONTEND LOCATIONS
# ============================================================

def build_locations(
    geometries,
    districts,
):
    """
    Build one clean locations[] array.

    Priority:
        official CAP geometry
        then district fallback
    """

    locations = []

    # ========================================================
    # OFFICIAL CAP GEOMETRY
    # ========================================================

    for geometry in geometries or []:

        if not geometry:
            continue

        geometry_type = geometry.get(
            "type"
        )

        # ----------------------------------------------------
        # POLYGON
        # ----------------------------------------------------

        if geometry_type == "Polygon":

            coordinates = geometry.get(
                "coordinates",
                [],
            )

            if len(coordinates) >= 3:

                locations.append(
                    {
                        "type": "Polygon",
                        "coordinates": coordinates,
                        "source": geometry.get(
                            "source",
                            "SACHET CAP",
                        ),
                    }
                )

        # ----------------------------------------------------
        # CIRCLE
        # ----------------------------------------------------

        elif geometry_type == "Circle":

            coordinates = geometry.get(
                "coordinates"
            )

            radius_km = geometry.get(
                "radius_km"
            )

            if (
                isinstance(
                    coordinates,
                    list,
                )
                and len(coordinates) == 2
                and radius_km
            ):

                locations.append(
                    {
                        "type": "Circle",
                        "latitude": float(
                            coordinates[0]
                        ),
                        "longitude": float(
                            coordinates[1]
                        ),
                        "coordinates": coordinates,
                        "radius_km": float(
                            radius_km
                        ),
                        "source": geometry.get(
                            "source",
                            "SACHET CAP",
                        ),
                    }
                )

    # ========================================================
    # DISTRICT FALLBACK
    # ========================================================

    if not locations:

        district_locations = (
            resolve_district_coordinates(
                districts
            )
        )

        locations.extend(
            district_locations
        )

    return remove_duplicate_locations(
        locations
    )


# ============================================================
# RSS ENTRY -> CAP URL
# ============================================================

def get_cap_url_from_entry(entry):
    """
    Get CAP XML URL from an RSS entry.

    SACHET RSS normally provides a link to the alert.
    """

    candidates = []

    # RSS link

    link = getattr(
        entry,
        "link",
        None,
    )

    if link:
        candidates.append(
            link
        )

    # Some feeds may expose cap_url

    for attribute in [
        "cap_url",
        "capurl",
        "url",
    ]:

        value = getattr(
            entry,
            attribute,
            None,
        )

        if value:
            candidates.append(
                value
            )

    # Look through enclosures

    enclosures = getattr(
        entry,
        "enclosures",
        [],
    )

    for enclosure in enclosures:

        href = enclosure.get(
            "href"
        )

        if href:
            candidates.append(
                href
            )

    # --------------------------------------------------------
    # Select likely CAP URL
    # --------------------------------------------------------

    for candidate in candidates:

        candidate = clean_text(
            candidate
        )

        if not candidate:
            continue

        candidate = urljoin(
            SACHET_BASE_URL,
            candidate,
        )

        return candidate

    return None


# ============================================================
# RSS FALLBACK ALERT
# ============================================================

def build_rss_fallback_alert(
    entry,
    cap_url,
):
    """
    If CAP XML cannot be downloaded, still keep the
    RSS alert instead of silently deleting it.

    This is important for complete alert visibility.
    """

    title = clean_text(
        getattr(
            entry,
            "title",
            "",
        )
    )

    description = clean_text(
        getattr(
            entry,
            "description",
            "",
        )
    )

    published = getattr(
        entry,
        "published",
        None,
    )

    return {
        "identifier": "",
        "source": "NDMA SACHET",
        "sender": "",
        "sender_name": "",
        "event": title,
        "hazard_type": classify_hazard(
            event=title,
            headline=title,
            description=description,
        ),
        "category": "",
        "response_type": "",
        "language": "",
        "status": "Actual",
        "msg_type": "Alert",
        "scope": "Public",
        "urgency": "",
        "severity": "",
        "certainty": "",
        "sent": published,
        "effective": None,
        "onset": None,
        "expires": None,
        "active": True,
        "headline": title,
        "description": description,
        "instruction": "",
        "web": cap_url,
        "source_url": cap_url,
        "cap_url": cap_url,
        "affected_districts": [],
        "lgd_codes": [],
        "unmapped_lgd_codes": [],
        "parameters": {},
        "polygon_url": None,
        "geometries": [],
    }


# ============================================================
# FETCH ALL SACHET ALERTS
# ============================================================

def fetch_sachet_alerts():
    """
    Fetch current active alerts from the INDIA-WIDE
    NDMA SACHET RSS feed.

    IMPORTANT:

    We do NOT filter by:
        Tamil Nadu
        Salem
        Chennai
        any particular state

    Therefore every current alert returned by the
    SACHET India RSS feed is processed.
    """

    start_time = time.time()

    print(
        "\n=================================================="
    )

    print(
        "[SACHET] Fetching INDIA-WIDE live alerts..."
    )

    print(
        "[SACHET] Feed:",
        SACHET_FEED_URL,
    )

    print(
        "=================================================="
    )

    # ========================================================
    # RSS DOWNLOAD
    # ========================================================

    try:

        response = SESSION.get(
            SACHET_FEED_URL,
            timeout=REQUEST_TIMEOUT,
        )

        response.raise_for_status()

        feed = feedparser.parse(
            response.content
        )

    except Exception as exc:

        print(
            "[SACHET] RSS ERROR:",
            str(exc),
        )

        return {
            "source": "NDMA SACHET",
            "country": "India",
            "feed_url": SACHET_FEED_URL,
            "count": 0,
            "mapped_count": 0,
            "unmapped_count": 0,
            "alerts": [],
            "error": str(exc),
        }

    entries = getattr(
        feed,
        "entries",
        [],
    )

    print(
        "[SACHET] RSS entries:",
        len(entries),
    )

    # ========================================================
    # PROCESS ALERTS
    # ========================================================

    alerts = []

    seen_identifiers = set()

    for entry in entries:

        cap_url = get_cap_url_from_entry(
            entry
        )

        if not cap_url:

            print(
                "[SACHET] Skipping entry "
                "without CAP URL"
            )

            continue

        # ----------------------------------------------------
        # Parse CAP
        # ----------------------------------------------------

        alert = parse_cap_alert(
            cap_url
        )

        # ----------------------------------------------------
        # CAP failed -> RSS fallback
        # ----------------------------------------------------

        if alert is None:

            alert = (
                build_rss_fallback_alert(
                    entry,
                    cap_url,
                )
            )

        # ----------------------------------------------------
        # Current alert check
        # ----------------------------------------------------

        if not alert.get(
            "active",
            True,
        ):
            continue

        # ----------------------------------------------------
        # Identifier deduplication
        # ----------------------------------------------------

        identifier = clean_text(
            alert.get(
                "identifier",
                "",
            )
        )

        if identifier:

            if identifier in seen_identifiers:
                continue

            seen_identifiers.add(
                identifier
            )

        # ----------------------------------------------------
        # TEMP DEBUG: log unmapped LGD codes
        #
        # This helps build out LGD_DISTRICT_MAP over time by
        # showing exactly which numeric LGD codes appear for
        # which real districts, straight from live SACHET
        # traffic. Safe to remove once Bihar (and any other
        # thin state sections) are filled in.
        # ----------------------------------------------------

        lgd_status = get_mapping_status(
            alert.get(
                "lgd_codes",
                [],
            )
        )

        if lgd_status["unmapped"]:

            print(
                "[LGD] Unmapped codes seen:",
                lgd_status["unmapped"],
                "for districts:",
                alert.get(
                    "affected_districts"
                ),
            )

        # ----------------------------------------------------
        # Build map locations
        # ----------------------------------------------------

        locations = build_locations(
            alert.get(
                "geometries",
                [],
            ),
            alert.get(
                "affected_districts",
                [],
            ),
        )

        alert["locations"] = locations

        # ----------------------------------------------------
        # Geometry status
        # ----------------------------------------------------

        has_geometry = len(
            locations
        ) > 0

        alert["has_geometry"] = (
            has_geometry
        )

        if has_geometry:

            alert[
                "location_resolution"
            ] = "resolved"

        else:

            alert[
                "location_resolution"
            ] = "unmapped"

        # ----------------------------------------------------
        # Location note
        # ----------------------------------------------------

        if locations:

            geometry_types = sorted(
                set(
                    location.get(
                        "type"
                    )
                    for location in locations
                )
            )

            alert[
                "location_resolution_note"
            ] = (
                "Map location resolved from "
                "official SACHET CAP geometry "
                "or district fallback: "
                + ", ".join(
                    geometry_types
                )
            )

        else:

            alert[
                "location_resolution_note"
            ] = (
                "SACHET supplied this alert, "
                "but no usable map geometry or "
                "district coordinate was available."
            )

        # ----------------------------------------------------
        # Remove internal field from API
        # ----------------------------------------------------

        alert.pop(
            "geometries",
            None,
        )

        alerts.append(
            alert
        )

    # ========================================================
    # COUNTS
    # ========================================================

    mapped_alerts = [
        alert
        for alert in alerts
        if alert.get(
            "has_geometry",
            False,
        )
    ]

    unmapped_alerts = [
        alert
        for alert in alerts
        if not alert.get(
            "has_geometry",
            False,
        )
    ]

    elapsed = round(
        time.time() - start_time,
        2,
    )

    # ========================================================
    # LOGGING
    # ========================================================

    print(
        "\n=================================================="
    )

    print(
        "[SACHET] INDIA-WIDE RESULT"
    )

    print(
        "[SACHET] Active alerts:",
        len(alerts),
    )

    print(
        "[SACHET] Mapped alerts:",
        len(mapped_alerts),
    )

    print(
        "[SACHET] Unmapped alerts:",
        len(unmapped_alerts),
    )

    print(
        "[SACHET] Processing time:",
        elapsed,
        "seconds",
    )

    print(
        "==================================================\n"
    )

    # ========================================================
    # RETURN API RESPONSE
    # ========================================================

    return {
        "source": "NDMA SACHET",

        "country": "India",

        "coverage": "Pan-India",

        "feed_url": SACHET_FEED_URL,

        "generated_at": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),

        "count": len(alerts),

        "mapped_count": len(
            mapped_alerts
        ),

        "unmapped_count": len(
            unmapped_alerts
        ),

        "alerts": alerts,
    }


# ============================================================
# SIMPLE LOCAL TEST
# ============================================================

if __name__ == "__main__":

    print(
        "SafeShift AI - SACHET India Test"
    )

    data = fetch_sachet_alerts()

    print(
        "\nActive alerts:",
        data.get(
            "count",
            0,
        ),
    )

    print(
        "Mapped alerts:",
        data.get(
            "mapped_count",
            0,
        ),
    )

    print(
        "Unmapped alerts:",
        data.get(
            "unmapped_count",
            0,
        ),
    )

    print(
        "\nHazards:"
    )

    for alert in data.get(
        "alerts",
        [],
    ):

        print(
            "----------------------------------------"
        )

        print(
            "Hazard:",
            alert.get(
                "hazard_type"
            ),
        )

        print(
            "Event:",
            alert.get(
                "event"
            ),
        )

        print(
            "Severity:",
            alert.get(
                "severity"
            ),
        )

        print(
            "Urgency:",
            alert.get(
                "urgency"
            ),
        )

        print(
            "Districts:",
            alert.get(
                "affected_districts"
            ),
        )

        print(
            "LGD:",
            alert.get(
                "lgd_codes"
            ),
        )

        print(
            "Locations:",
            len(
                alert.get(
                    "locations",
                    [],
                )
            ),
        )

        print(
            "Geometry:",
            [
                location.get(
                    "type"
                )
                for location in alert.get(
                    "locations",
                    [],
                )
            ],
        )

        print(
            "Headline:",
            alert.get(
                "headline"
            ),
        )
