import { useState, useEffect, useCallback } from "react";

import { getRedZones } from "../services/api";
import "./ChangeDetection.css";

const API_BASE = "http://localhost:8000/api/ai";

function formatDate(isoString) {
  if (!isoString) return "Unknown date";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function statusFor(detection) {
  return detection.verified ? "Confirmed" : "Pending Verification";
}

function riskClass(risk) {
  if (risk === "High") return "red-text";
  if (risk === "Medium") return "orange-text";
  return "green-text";
}

function riskBadgeClass(risk) {
  if (risk === "High") return "high-risk-badge";
  if (risk === "Medium") return "medium-risk-badge";
  return "low-risk-badge";
}

function ChangeDetection() {
  const [selected, setSelected] = useState(null);
  const [detections, setDetections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ---------- red zone trigger state (real SACHET + Copernicus run) ----------
  const [redZones, setRedZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [runningDetection, setRunningDetection] = useState(false);
  const [runError, setRunError] = useState(null);
  const [runMessage, setRunMessage] = useState(null);

  // Time window for the comparison. Changing these and re-running the
  // same zone produces a NEW, distinct detection record (different
  // before/after scenes), which is how you build up real history
  // instead of a single one-off snapshot.
  const [beforeDaysAgo, setBeforeDaysAgo] = useState(365);
  const [afterDaysAgo, setAfterDaysAgo] = useState(0);

  // Bulk run across every red zone at once
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null); // { done, total }

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detectionsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/detections`),
        fetch(`${API_BASE}/detections/summary`),
      ]);

      if (!detectionsRes.ok || !summaryRes.ok) {
        throw new Error("Backend returned an error response");
      }

      const detectionsData = await detectionsRes.json();
      const summaryData = await summaryRes.json();

      // Newest first
      const sorted = [...detectionsData].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setDetections(sorted);
      setSummary(summaryData);
    } catch (err) {
      setError(
        "Could not reach the backend. Make sure the API server is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- load red zones for the trigger dropdown ----------
  // Red zones here are the ones declared under Red Zone Management,
  // which are meant to be derived from live NDMA SACHET hazard data.
  const loadRedZones = useCallback(async () => {
    try {
      const res = await getRedZones();
      const data = res?.data || res;
      setRedZones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load red zones for detection trigger:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadRedZones();
  }, [loadData, loadRedZones]);

  // ---------- run a REAL detection: fetches Sentinel-2 imagery from
  // Copernicus Data Space for one zone's coordinates over the chosen
  // time window, then runs OpenCV change detection on the images ----------
  async function runScanForZone(zoneId) {
    const params = new URLSearchParams({
      before_days_ago: String(beforeDaysAgo),
      after_days_ago: String(afterDaysAgo),
    });

    const res = await fetch(
      `${API_BASE}/change-detection/auto/${zoneId}?${params.toString()}`,
      { method: "POST" }
    );
    const data = await res.json();

    if (data.error) {
      throw new Error(data.detail || data.error);
    }

    return data;
  }

  async function handleRunDetection() {
    if (!selectedZoneId) return;

    setRunningDetection(true);
    setRunError(null);
    setRunMessage(null);

    try {
      const data = await runScanForZone(selectedZoneId);

      setRunMessage(
        `Scan complete: ${data.change_percentage}% change detected, ` +
          `${data.regions_detected} region(s), risk level ${data.risk_level}.`
      );

      await loadData();
    } catch (err) {
      setRunError(
        err.message ||
          "Detection run failed. Check that CDSE_CLIENT_ID / CDSE_CLIENT_SECRET are set on the backend."
      );
    } finally {
      setRunningDetection(false);
    }
  }

  // ---------- run a scan across every declared red zone, one after
  // another (sequential, so we don't hammer Copernicus / the free
  // CDSE tier with parallel requests) ----------
  async function handleRunAllZones() {
    if (redZones.length === 0) return;

    setBulkRunning(true);
    setRunError(null);
    setRunMessage(null);
    setBulkProgress({ done: 0, total: redZones.length });

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < redZones.length; i++) {
      const zone = redZones[i];
      try {
        await runScanForZone(zone.id);
        succeeded += 1;
      } catch (err) {
        failed += 1;
        console.error(`Scan failed for zone ${zone.zone_name}:`, err.message);
      }
      setBulkProgress({ done: i + 1, total: redZones.length });
    }

    setBulkRunning(false);
    setRunMessage(
      `Bulk scan finished: ${succeeded} succeeded, ${failed} failed out of ${redZones.length} zone(s).`
    );

    await loadData();
  }

  async function handleVerify(id) {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/detections/${id}/verify`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Verify failed");
      await loadData();
      setSelected(null);
    } catch (err) {
      setError("Failed to verify detection. Try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkFalse(id) {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/detections/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await loadData();
      setSelected(null);
    } catch (err) {
      setError("Failed to remove detection. Try again.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="detection-page">
        <p>Loading AI detections…</p>
      </div>
    );
  }

  return (
    <div className="detection-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2>AI Change Detection</h2>
          <p>Monitor potential land-use changes inside declared red zones</p>
        </div>

        <div className="ai-status">
          <span>●</span> AI MONITORING ACTIVE
        </div>
      </div>

      {error && (
        <div className="ai-info" style={{ borderColor: "red" }}>
          <div className="ai-info-icon">⚠️</div>
          <div>
            <strong>Connection issue</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* RUN A REAL SCAN */}
      <div className="run-detection-card">
        <div className="run-detection-heading">
          <div>
            <h3>Run Satellite Scan</h3>
            <p>
              Fetches real Sentinel-2 imagery from Copernicus Data Space for a
              red zone (derived from live NDMA SACHET hazards) and compares
              it against an earlier scene using computer-vision change
              detection.
            </p>
          </div>
        </div>

        <div className="run-window-controls">
          <label>
            Compare vs.
            <select
              value={beforeDaysAgo}
              onChange={(e) => setBeforeDaysAgo(Number(e.target.value))}
              className="window-select"
            >
              <option value={30}>1 month ago</option>
              <option value={90}>3 months ago</option>
              <option value={180}>6 months ago</option>
              <option value={365}>1 year ago</option>
              <option value={730}>2 years ago</option>
            </select>
          </label>

          <label>
            Latest scene
            <select
              value={afterDaysAgo}
              onChange={(e) => setAfterDaysAgo(Number(e.target.value))}
              className="window-select"
            >
              <option value={0}>Today</option>
              <option value={30}>1 month ago</option>
              <option value={90}>3 months ago</option>
            </select>
          </label>
        </div>

        <div className="run-detection-controls">
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="zone-select"
          >
            <option value="">Select a red zone…</option>
            {redZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.zone_name} {z.district ? `(${z.district})` : ""}
              </option>
            ))}
          </select>

          <button
            className="run-scan-btn"
            onClick={handleRunDetection}
            disabled={!selectedZoneId || runningDetection || bulkRunning}
          >
            {runningDetection ? "Fetching imagery…" : "Run Scan"}
          </button>

          <button
            className="run-scan-btn run-all-btn"
            onClick={handleRunAllZones}
            disabled={redZones.length === 0 || bulkRunning || runningDetection}
          >
            {bulkRunning
              ? `Scanning ${bulkProgress?.done ?? 0}/${bulkProgress?.total ?? redZones.length}…`
              : `Scan All Zones (${redZones.length})`}
          </button>
        </div>

        {redZones.length === 0 && (
          <p className="run-detection-hint">
            No red zones found. Declare a red zone under Red Zone Management
            first — scans run against a zone's coordinates.
          </p>
        )}

        {redZones.length > 0 && (
          <p className="run-detection-hint">
            Tip: change the time window above and re-run a zone (or run all
            zones again later) to build up a real history of scans over time
            — each run adds a new detection rather than overwriting the last.
          </p>
        )}

        {runMessage && <div className="run-result run-success">{runMessage}</div>}
        {runError && <div className="run-result run-error">{runError}</div>}
      </div>

      {/* INFORMATION */}
      <div className="ai-info">
        <div className="ai-info-icon">🤖</div>
        <div>
          <strong>How AI Change Detection Works</strong>
          <p>
            For the selected red zone, the system pulls two real Sentinel-2
            satellite scenes (an older and a recent one) from the Copernicus
            Data Space Ecosystem, then runs classical computer vision
            (grayscale diffing, thresholding, contour detection) to identify
            new structures or land-use change. Detected changes are sent for
            authorized field verification.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="detection-summary">
        <div className="detection-stat">
          <span>Total Detections</span>
          <strong>{summary?.total_detections ?? 0}</strong>
        </div>

        <div className="detection-stat">
          <span>Pending Verification</span>
          <strong className="orange-text">
            {summary?.pending_verification ?? 0}
          </strong>
        </div>

        <div className="detection-stat">
          <span>High Risk</span>
          <strong className="red-text">{summary?.high_risk ?? 0}</strong>
        </div>

        <div className="detection-stat">
          <span>Verified</span>
          <strong className="green-text">{summary?.verified ?? 0}</strong>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="detection-grid">
        {/* DETECTION LIST */}
        <div className="detection-list-card">
          <div className="card-heading">
            <div>
              <h3>Recent AI Detections</h3>
              <p>Latest detected changes</p>
            </div>
          </div>

          {detections.length === 0 && (
            <p style={{ padding: "1rem" }}>
              No detections yet. Run a scan on a red zone above to see
              results here.
            </p>
          )}

          {detections.map((item) => (
            <div
              key={item.id}
              className={`detection-row ${
                selected?.id === item.id ? "selected" : ""
              }`}
              onClick={() => setSelected(item)}
            >
              <div className="detection-icon">🤖</div>

              <div className="detection-details">
                <strong>{item.location}</strong>
                <p>DET-{String(item.id).padStart(3, "0")}</p>
                <small>Detected {formatDate(item.created_at)}</small>
              </div>

              <div className="confidence">
                <strong>{Math.round(item.confidence * 100)}%</strong>
                <small>Confidence</small>
              </div>

              <span
                className={`detection-status ${statusFor(item)
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                {statusFor(item)}
              </span>
            </div>
          ))}
        </div>

        {/* DETAILS */}
        <div className="detection-detail-card">
          {selected ? (
            <>
              <div className="detail-header">
                <div>
                  <h3>DET-{String(selected.id).padStart(3, "0")}</h3>
                  <p>{selected.location}</p>
                </div>

                <span className={riskBadgeClass(selected.risk_level)}>
                  {selected.risk_level} Risk
                </span>
              </div>

              {/* IMAGE COMPARISON */}
              <div className="comparison">
                <div className="image-placeholder">
                  <span>PREVIOUS</span>
                  <div>🛰️</div>
                  <small>Previous Sentinel-2 scene</small>
                </div>

                <div className="image-placeholder">
                  <span>LATEST</span>
                  <div>🛰️</div>
                  <small>Latest Sentinel-2 scene</small>
                </div>
              </div>

              <div className="change-result">
                <h4>Detection Result</h4>

                <div className="result-row">
                  <span>Change Type</span>
                  <strong>
                    {selected.change_detected
                      ? "Land-Use Change Detected"
                      : "No Significant Change"}
                  </strong>
                </div>

                <div className="result-row">
                  <span>Change Percentage</span>
                  <strong>{selected.change_percentage?.toFixed(2)}%</strong>
                </div>

                <div className="result-row">
                  <span>Regions Detected</span>
                  <strong>{selected.regions_detected}</strong>
                </div>

                <div className="result-row">
                  <span>AI Confidence</span>
                  <strong>{Math.round(selected.confidence * 100)}%</strong>
                </div>

                <div className="result-row">
                  <span>Risk Level</span>
                  <strong className={riskClass(selected.risk_level)}>
                    {selected.risk_level}
                  </strong>
                </div>

                <div className="result-row">
                  <span>Status</span>
                  <strong>{statusFor(selected)}</strong>
                </div>
              </div>

              {!selected.verified && (
                <div className="verification-note">
                  <strong>⚠️ Field Verification Required</strong>
                  <p>
                    AI detection indicates a potential change. Authorized
                    personnel should verify the location before taking
                    action.
                  </p>
                </div>
              )}

              <div className="detail-actions">
                <button
                  className="verify-btn"
                  disabled={actionLoading || selected.verified}
                  onClick={() => handleVerify(selected.id)}
                >
                  {selected.verified ? "✓ Verified" : "✓ Verify Detection"}
                </button>

                <button
                  className="false-btn"
                  disabled={actionLoading}
                  onClick={() => handleMarkFalse(selected.id)}
                >
                  Mark as False Detection
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div>🤖</div>
              <h3>Select a Detection</h3>
              <p>
                Select an AI detection from the list to view the comparison
                and analysis.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TIMELINE */}
      <div className="timeline-card">
        <div className="card-heading">
          <div>
            <h3>Recent Detection Timeline</h3>
            <p>Latest monitoring activity across all zones</p>
          </div>
        </div>

        <div className="timeline">
          {detections.slice(0, 4).map((item) => (
            <div className="timeline-item" key={item.id}>
              <div className="timeline-dot"></div>
              <div>
                <strong>
                  {item.location} —{" "}
                  {item.change_detected ? "Change detected" : "No change"}
                </strong>
                <p>
                  {formatDate(item.created_at)} ·{" "}
                  {Math.round(item.confidence * 100)}% confidence
                </p>
              </div>
            </div>
          ))}

          {detections.length === 0 && (
            <p style={{ padding: "0.5rem" }}>No detection history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChangeDetection;
