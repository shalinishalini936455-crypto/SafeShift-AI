# ============================================================
# SafeShift AI - API server
#
# Exposes the SACHET India-wide hazard service to the React
# frontend over a normal JSON endpoint with CORS enabled.
#
# sachet.ndma.gov.in does not send CORS headers, so the
# browser cannot call it directly. This tiny server fetches
# the feed on the backend (where CORS does not apply) and
# hands the already-parsed result to the frontend.
#
# Run:
#   pip install flask flask-cors feedparser requests
#   python api_server.py
#
# Then the frontend calls:
#   GET http://localhost:8000/api/alerts
# ============================================================

import time

from flask import Flask, jsonify
from flask_cors import CORS

from sachet_service import fetch_sachet_alerts

app = Flask(__name__)
CORS(app)  # allow the Vite dev server (localhost:5173) to call this

# Simple in-memory cache so a burst of page loads/polling
# doesn't hammer sachet.ndma.gov.in on every request.
CACHE_TTL_SECONDS = 120
_cache = {"data": None, "fetched_at": 0}


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    now = time.time()

    if _cache["data"] is None or (now - _cache["fetched_at"]) > CACHE_TTL_SECONDS:
        _cache["data"] = fetch_sachet_alerts()
        _cache["fetched_at"] = now

    return jsonify(_cache["data"])


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8010, debug=True)
