import feedparser
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timezone


SACHET_FEED_URL = (
    "https://sachet.ndma.gov.in/"
    "cap_public_website/rss/rss_india.xml"
)


CAP_NS = {
    "cap": "urn:oasis:names:tc:emergency:cap:1.2"
}


def get_text(element, tag, default=""):
    """
    Get text from a CAP XML element.
    """

    if element is None:
        return default

    node = element.find(
        f"cap:{tag}",
        CAP_NS
    )

    if node is not None and node.text:
        return node.text.strip()

    return default


def get_all_text(element, tag):
    """
    Get all matching CAP XML elements.
    """

    values = []

    if element is None:
        return values

    for node in element.findall(
        f".//cap:{tag}",
        CAP_NS
    ):
        if node.text:
            values.append(
                node.text.strip()
            )

    return values


def parse_cap_alert(url):
    """
    Fetch and parse an individual
    NDMA SACHET CAP XML alert.
    """

    if not url:
        return {}

    try:

        response = requests.get(
            url,
            timeout=15,
            headers={
                "User-Agent": "SafeShift-AI/1.0"
            }
        )

        response.raise_for_status()

        root = ET.fromstring(
            response.content
        )

        info = root.find(
            "cap:info",
            CAP_NS
        )

        if info is None:
            return {}

        # -----------------------------
        # Basic CAP information
        # -----------------------------

        event = get_text(
            info,
            "event"
        )

        urgency = get_text(
            info,
            "urgency"
        )

        severity = get_text(
            info,
            "severity"
        )

        certainty = get_text(
            info,
            "certainty"
        )

        effective = get_text(
            info,
            "effective"
        )

        onset = get_text(
            info,
            "onset"
        )

        expires = get_text(
            info,
            "expires"
        )

        headline = get_text(
            info,
            "headline"
        )

        instruction = get_text(
            info,
            "instruction"
        )

        # -----------------------------
        # Geographic information
        # -----------------------------

        area = info.find(
            "cap:area",
            CAP_NS
        )

        affected_districts = []
        lgd_codes = []
        polygon_url = ""

        if area is not None:

            area_desc = get_text(
                area,
                "areaDesc"
            )

            if area_desc:

                affected_districts = [
                    district.strip()
                    for district in area_desc.split(",")
                    if district.strip()
                ]

            # Extract LGD district codes
            for geocode in area.findall(
                "cap:geocode",
                CAP_NS
            ):

                value_name = get_text(
                    geocode,
                    "valueName"
                )

                value = get_text(
                    geocode,
                    "value"
                )

                if (
                    "LGD" in value_name
                    and value
                ):
                    lgd_codes.append(
                        value
                    )

        # -----------------------------
        # Polygon URL
        # -----------------------------

        for parameter in info.findall(
            "cap:parameter",
            CAP_NS
        ):

            value_name = get_text(
                parameter,
                "valueName"
            )

            value = get_text(
                parameter,
                "value"
            )

            if (
                value_name.lower()
                == "polygon url"
            ):
                polygon_url = value

        # -----------------------------
        # Return CAP data
        # -----------------------------

        return {

            "event": event,

            "urgency": urgency,

            "severity": severity,

            "certainty": certainty,

            "effective": effective,

            "onset": onset,

            "expires": expires,

            "headline": headline,

            "instruction": instruction,

            "affected_districts":
                affected_districts,

            "lgd_codes":
                lgd_codes,

            "polygon_url":
                polygon_url,

            "sender":
                get_text(
                    root,
                    "sender"
                ),

            "status":
                get_text(
                    root,
                    "status"
                ),

            "scope":
                get_text(
                    root,
                    "scope"
                ),
        }

    except Exception as e:

        return {
            "cap_error": str(e)
        }


def is_active_alert(expires):
    """
    Check whether a SACHET alert
    has not expired.
    """

    if not expires:
        return True

    try:

        expiry_time = datetime.fromisoformat(
            expires.replace(
                "Z",
                "+00:00"
            )
        )

        return (
            expiry_time
            > datetime.now(timezone.utc)
        )

    except Exception:

        # Keep the alert if the
        # expiry date cannot be parsed
        return True


def classify_hazard(event, title):
    """
    Convert SACHET event/title
    information into a normalized
    hazard category.
    """

    text = (
        f"{event} {title}"
    ).lower()

    # Flood
    if any(
        word in text
        for word in [
            "flood",
            "flash flood",
            "waterlogging"
        ]
    ):
        return "Flood"

    # Landslide
    if any(
        word in text
        for word in [
            "landslide",
            "land slide"
        ]
    ):
        return "Landslide"

    # Cyclone
    if any(
        word in text
        for word in [
            "cyclone",
            "storm surge"
        ]
    ):
        return "Cyclone"

    # Thunderstorm
    if any(
        word in text
        for word in [
            "thunderstorm",
            "lightning"
        ]
    ):
        return "Thunderstorm"

    # Rain
    if any(
        word in text
        for word in [
            "heavy rain",
            "rainfall",
            "moderate rain",
            "rain"
        ]
    ):
        return "Heavy Rain"

    # Heatwave
    if any(
        word in text
        for word in [
            "heat wave",
            "heatwave"
        ]
    ):
        return "Heatwave"

    # Cold wave
    if any(
        word in text
        for word in [
            "cold wave",
            "coldwave"
        ]
    ):
        return "Cold Wave"

    # Earthquake
    if "earthquake" in text:
        return "Earthquake"

    # Tsunami
    if "tsunami" in text:
        return "Tsunami"

    return event or "Other"


def fetch_sachet_alerts():
    """
    Fetch current India-wide disaster
    alerts from the NDMA SACHET
    CAP RSS feed.
    """

    feed = feedparser.parse(
        SACHET_FEED_URL
    )

    alerts = []

    for entry in feed.entries:

        # -----------------------------
        # Basic RSS information
        # -----------------------------

        alert = {

            "id":
                entry.get("id")
                or entry.get("guid"),

            "title":
                entry.get(
                    "title",
                    "Disaster Alert"
                ),

            "description":
                entry.get(
                    "description",
                    ""
                ),

            "link":
                entry.get(
                    "link",
                    ""
                ),

            "published":
                entry.get(
                    "published",
                    ""
                ),

            "updated":
                entry.get(
                    "updated",
                    ""
                ),

            "source":
                "NDMA SACHET",
        }

        # -----------------------------
        # Fetch CAP XML
        # -----------------------------

        cap_data = parse_cap_alert(
            alert["link"]
        )

        alert.update(
            cap_data
        )

        # -----------------------------
        # Ignore expired alerts
        # -----------------------------

        if not is_active_alert(
            alert.get(
                "expires",
                ""
            )
        ):
            continue

        # -----------------------------
        # Add normalized hazard type
        # -----------------------------

        alert["hazard_type"] = (
            classify_hazard(
                alert.get(
                    "event",
                    ""
                ),
                alert.get(
                    "title",
                    ""
                )
            )
        )

        # -----------------------------
        # Add active alert
        # -----------------------------

        alerts.append(
            alert
        )

    # -----------------------------
    # Final API response
    # -----------------------------

    return {

        "source":
            "NDMA SACHET",

        "country":
            "India",

        "fetched_at":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "count":
            len(alerts),

        "alerts":
            alerts,
    }