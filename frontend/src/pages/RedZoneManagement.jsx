import { useEffect, useState, useCallback } from "react";
import { getRedZones, refreshRedZones } from "../services/api";

// How often the page auto-polls for updated AI-detected zones.
const AUTO_REFRESH_MS = 60000; // 1 minute

function RedZoneManagement() {
  const [showForm, setShowForm] = useState(false);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastSync, setLastSync] = useState(null);

  const loadZones = useCallback(() => {
    return getRedZones()
      .then((response) => {
        setZones(response.data);
        setLoading(false);
        setError("");
      })
      .catch((error) => {
        console.error("Red Zones API Error:", error);
        setError("Unable to load red zone data");
        setLoading(false);
      });
  }, []);

  // Initial load
  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Auto-poll in the background so newly AI-detected/escalated
  // zones show up without the user doing anything.
  useEffect(() => {
    const interval = setInterval(() => {
      loadZones();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadZones]);

  // Manually trigger the AI detection pass right now (compares
  // current live hazard data against known zones, escalates
  // recurring ones, creates new ones).
  const handleRunDetection = () => {
    setDetecting(true);
    setError("");

    refreshRedZones()
      .then((response) => {
        setLastSync(response.data);
        return loadZones();
      })
      .catch((error) => {
        console.error("Red Zone refresh error:", error);
        setError("AI detection run failed - showing last known data");
      })
      .finally(() => {
        setDetecting(false);
      });
  };

  const totalZones = zones.length;

  const criticalZones = zones.filter(
    (zone) => zone.severity === "Critical"
  ).length;

  const highZones = zones.filter(
    (zone) => zone.severity === "High"
  ).length;

  const permanentZones = zones.filter(
    (zone) => zone.is_permanent_zone
  ).length;

  const aiDetectedZones = zones.filter(
    (zone) => zone.source === "SACHET"
  ).length;

  const filteredZones = zones
    .filter((zone) =>
      `${zone.zone_name} ${zone.district} ${zone.hazard_type}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    // Highest risk / most recurring hazards first
    .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

  return (
    <div className="redzone-page">

      <div className="page-header">
        <div>
          <h2>Red Zone Management</h2>
          <p>
            AI-detected high-risk zones, updated from live hazard data
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="primary-btn"
            onClick={handleRunDetection}
            disabled={detecting}
          >
            {detecting ? "Running AI Detection..." : "Run AI Detection"}
          </button>

          <button
            className="primary-btn"
            onClick={() => setShowForm(!showForm)}
          >
            + Declare Red Zone
          </button>
        </div>
      </div>

      {lastSync && (
        <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          Last AI run: {lastSync.created} new zone(s) detected,{" "}
          {lastSync.escalated} zone(s) escalated from recurring hazards.
        </p>
      )}

      {/* FORM */}

      {showForm && (
        <div className="zone-form-card">

          <div className="form-title">
            <div>
              <h3>Declare New Red Zone</h3>
              <p>Enter the zone information below</p>
            </div>

            <button
              className="close-btn"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <div className="form-grid">

            <div>
              <label>Zone ID</label>
              <input placeholder="Example: RZ-025" />
            </div>

            <div>
              <label>Zone Name</label>
              <input placeholder="Enter zone name" />
            </div>

            <div>
              <label>Hazard Type</label>
              <select>
                <option>Flood</option>
                <option>Landslide</option>
                <option>Coastal Erosion</option>
                <option>Cloudburst</option>
              </select>
            </div>

            <div>
              <label>Severity</label>
              <select>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
              </select>
            </div>

            <div>
              <label>Latitude</label>
              <input placeholder="Enter latitude" />
            </div>

            <div>
              <label>Longitude</label>
              <input placeholder="Enter longitude" />
            </div>

          </div>

          <div className="form-actions">

            <button
              className="cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button className="primary-btn">
              Declare Zone
            </button>

          </div>

        </div>
      )}

      {/* SUMMARY */}

      <div className="zone-summary">

        <div>
          <span>Total Red Zones</span>
          <strong>
            {loading ? "..." : totalZones}
          </strong>
        </div>

        <div>
          <span>Critical</span>
          <strong className="critical-number">
            {loading ? "..." : criticalZones}
          </strong>
        </div>

        <div>
          <span>High Risk</span>
          <strong className="high-number">
            {loading ? "..." : highZones}
          </strong>
        </div>

        <div>
          <span>Permanent (Chronic)</span>
          <strong>
            {loading ? "..." : permanentZones}
          </strong>
        </div>

        <div>
          <span>AI-Detected</span>
          <strong>
            {loading ? "..." : aiDetectedZones}
          </strong>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* TABLE */}

      <div className="zone-table-card">

        <div className="table-header">

          <div>
            <h3>Declared Red Zones</h3>
            <p>Sorted by AI risk score, highest first</p>
          </div>

          <input
            className="search-input"
            placeholder="Search zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="table-wrapper">

          {loading ? (
            <p>Loading red zone data...</p>
          ) : (
            <table>

              <thead>
                <tr>
                  <th>Zone ID</th>
                  <th>Zone Name</th>
                  <th>District</th>
                  <th>Hazard</th>
                  <th>Severity</th>
                  <th>Risk Score</th>
                  <th>Occurrences</th>
                  <th>Status</th>
                  <th>Source</th>
                </tr>
              </thead>

              <tbody>

                {filteredZones.map((zone) => (

                  <tr key={zone.id}>

                    <td>
                      <strong>RZ-{zone.id}</strong>
                    </td>

                    <td>
                      {zone.zone_name}
                    </td>

                    <td>
                      {zone.district}
                    </td>

                    <td>
                      {zone.hazard_type}
                    </td>

                    <td>
                      <span
                        className={`severity ${zone.severity.toLowerCase()}`}
                      >
                        {zone.severity}
                      </span>
                    </td>

                    <td>
                      {zone.risk_score != null
                        ? Math.round(zone.risk_score)
                        : "-"}
                    </td>

                    <td>
                      {zone.occurrence_count ?? 1}
                    </td>

                    <td>
                      {zone.is_permanent_zone ? (
                        <span className="severity critical">
                          Permanent
                        </span>
                      ) : (
                        <span className="severity medium">
                          Active
                        </span>
                      )}
                    </td>

                    <td>
                      {zone.source === "SACHET" ? "AI (Live)" : "Manual"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>

    </div>
  );
}

export default RedZoneManagement;
