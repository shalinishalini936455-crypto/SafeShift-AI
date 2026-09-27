import { useEffect, useState, useCallback } from "react";
import { getSafeSites } from "../services/api";
import "./CarryingCapacity.css";

function statusFor(utilizationPct) {
  return utilizationPct >= 75 ? "Limited" : "Available";
}

function CarryingCapacity() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadSites = useCallback(() => {
    setError("");
    return getSafeSites()
      .then((response) => {
        const data = response?.data || response;
        setSites(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        console.error("Safe Sites API error:", err);
        setError("Unable to load safe site capacity data.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // ---------- real aggregates, computed from actual site records ----------
  const totalCapacity = sites.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const totalAvailable = sites.reduce(
    (sum, s) => sum + (s.available_capacity || 0),
    0
  );
  const totalOccupied = totalCapacity - totalAvailable;
  const utilizationPct =
    totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

  return (
    <div className="carrying-page">

      <div className="carrying-header">
        <div>
          <h1>Carrying Capacity</h1>
          <p>Monitor shelter capacity and available accommodation</p>
        </div>

        <div className="live-badge">
          <span className="live-dot"></span>
          LIVE · {sites.length} SITE{sites.length === 1 ? "" : "S"}
        </div>
      </div>

      {error && (
        <p style={{ color: "#f87171", marginBottom: "16px" }}>{error}</p>
      )}

      <div className="capacity-summary">

        <div className="capacity-card">
          <div className="card-icon blue-icon">▣</div>
          <div className="card-content">
            <span>Total Capacity</span>
            <h2>{loading ? "…" : totalCapacity.toLocaleString()}</h2>
            <small>Across {sites.length} registered safe site{sites.length === 1 ? "" : "s"}</small>
          </div>
        </div>

        <div className="capacity-card">
          <div className="card-icon orange-icon">◉</div>
          <div className="card-content">
            <span>Occupied</span>
            <h2>{loading ? "…" : totalOccupied.toLocaleString()}</h2>
            <small>Currently accommodated</small>
          </div>
        </div>

        <div className="capacity-card">
          <div className="card-icon green-icon">✓</div>
          <div className="card-content">
            <span>Available</span>
            <h2>{loading ? "…" : totalAvailable.toLocaleString()}</h2>
            <small>Ready for relocation</small>
          </div>
        </div>

        <div className="capacity-card">
          <div className="card-icon purple-icon">%</div>
          <div className="card-content">
            <span>Utilization</span>
            <h2>{loading ? "…" : `${utilizationPct.toFixed(1)}%`}</h2>
            <small>Overall occupancy rate</small>
          </div>
        </div>

      </div>


      <div className="overview-card">

        <div className="section-heading">
          <div>
            <h2>Capacity Overview</h2>
            <p>Current utilization across registered safe sites</p>
          </div>

          <span className="demo-badge" style={{ background: "rgba(16,185,129,0.18)", borderColor: "rgba(110,231,183,0.35)", color: "#6ee7b7" }}>
            LIVE DATA
          </span>
        </div>

        <div className="capacity-label">
          <span>Overall Capacity Utilization</span>
          <strong>{loading ? "…" : `${utilizationPct.toFixed(1)}%`}</strong>
        </div>

        <div className="main-progress">
          <div
            className="main-progress-fill"
            style={{ width: `${Math.min(utilizationPct, 100)}%` }}
          ></div>
        </div>

        <div className="capacity-legend">
          <span>
            <i className="occupied-dot"></i>
            Occupied: {totalOccupied.toLocaleString()}
          </span>
          <span>
            <i className="available-dot"></i>
            Available: {totalAvailable.toLocaleString()}
          </span>
        </div>

      </div>


      <div className="capacity-table-card">

        <div className="section-heading">
          <div>
            <h2>Site Capacity Assessment</h2>
            <p>
              Current accommodation status of evacuation sites
              {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>

          <button className="refresh-button" onClick={loadSites} disabled={loading}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>

        <div className="table-container">
          {loading ? (
            <p style={{ padding: "16px" }}>Loading safe site data...</p>
          ) : sites.length === 0 ? (
            <p style={{ padding: "16px" }}>No safe sites registered yet.</p>
          ) : (
            <table className="capacity-table">
              <thead>
                <tr>
                  <th>SAFE SITE</th>
                  <th>LOCATION</th>
                  <th>TOTAL</th>
                  <th>OCCUPIED</th>
                  <th>AVAILABLE</th>
                  <th>UTILIZATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {sites.map((site) => {
                  const occupied = (site.capacity || 0) - (site.available_capacity || 0);
                  const util =
                    site.capacity > 0
                      ? (occupied / site.capacity) * 100
                      : 0;
                  const status = statusFor(util);

                  return (
                    <tr key={site.id}>
                      <td>
                        <strong>{site.site_name}</strong>
                      </td>

                      <td>{site.district}</td>

                      <td>{(site.capacity ?? 0).toLocaleString()}</td>

                      <td className="occupied-number">
                        {occupied.toLocaleString()}
                      </td>

                      <td className="available-number">
                        {(site.available_capacity ?? 0).toLocaleString()}
                      </td>

                      <td>{util.toFixed(0)}%</td>

                      <td>
                        <span
                          className={`status-badge ${
                            status === "Available"
                              ? "available-status"
                              : "limited-status"
                          }`}
                        >
                          ● {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}

export default CarryingCapacity;
