import { useEffect, useState, useCallback, useMemo } from "react";
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

  // ---------------------------------------------------------------------
  // Relocation Simulator
  // "What if we move N people to Site X?" — a pure what-if calculation
  // over the live sites data already loaded above. Nothing is persisted
  // until the officer explicitly applies it.
  // ---------------------------------------------------------------------
  const [simSiteId, setSimSiteId] = useState("");
  const [simPeople, setSimPeople] = useState("");
  const [simResult, setSimResult] = useState(null);
  const [simError, setSimError] = useState("");
  const [applied, setApplied] = useState(false);

  const selectedSite = useMemo(
    () => sites.find((s) => String(s.id) === String(simSiteId)) || null,
    [sites, simSiteId]
  );

  const runSimulation = () => {
    setApplied(false);
    setSimError("");

    const count = Number(simPeople);

    if (!selectedSite) {
      setSimError("Choose a safe site to simulate.");
      setSimResult(null);
      return;
    }
    if (!simPeople || Number.isNaN(count) || count <= 0) {
      setSimError("Enter the number of people to relocate.");
      setSimResult(null);
      return;
    }

    const capacity = selectedSite.capacity || 0;
    const currentOccupied = capacity - (selectedSite.available_capacity || 0);
    const projectedOccupied = currentOccupied + count;
    const projectedAvailable = capacity - projectedOccupied;
    const projectedUtilization =
      capacity > 0 ? (projectedOccupied / capacity) * 100 : 0;
    const fits = projectedOccupied <= capacity;

    setSimResult({
      site: selectedSite,
      count,
      currentOccupied,
      projectedOccupied: Math.min(projectedOccupied, capacity + count),
      projectedAvailable,
      projectedUtilization,
      fits,
      status: fits ? statusFor(projectedUtilization) : "Over Capacity",
    });
  };

  const resetSimulation = () => {
    setSimSiteId("");
    setSimPeople("");
    setSimResult(null);
    setSimError("");
    setApplied(false);
  };

  // Marks the plan as applied in the UI. Wire this to a real relocation
  // API call (e.g. postRelocationPlan) once that endpoint exists — kept
  // as a local UI-only confirmation for now so nothing is written
  // without an explicit backend contract.
  const applySimulation = () => {
    if (!simResult || !simResult.fits) return;
    setApplied(true);
  };

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


      {/* ---------------- Relocation Simulator ---------------- */}
      <div className="simulator-card">

        <div className="section-heading">
          <div>
            <h2>Relocation Simulator</h2>
            <p>Test whether a safe site can absorb a planned relocation before committing it</p>
          </div>

          <span
            className="demo-badge"
            style={{ background: "rgba(99,102,241,0.18)", borderColor: "rgba(165,180,252,0.35)", color: "#a5b4fc" }}
          >
            WHAT-IF
          </span>
        </div>

        <div className="simulator-controls">
          <div className="sim-field">
            <label htmlFor="sim-site">Safe site</label>
            <select
              id="sim-site"
              value={simSiteId}
              onChange={(e) => {
                setSimSiteId(e.target.value);
                setSimResult(null);
                setApplied(false);
              }}
              disabled={loading || sites.length === 0}
            >
              <option value="">Select a site…</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.site_name} · {s.district}
                </option>
              ))}
            </select>
          </div>

          <div className="sim-field">
            <label htmlFor="sim-people">People to relocate</label>
            <input
              id="sim-people"
              type="number"
              min="1"
              placeholder="e.g. 120"
              value={simPeople}
              onChange={(e) => {
                setSimPeople(e.target.value);
                setSimResult(null);
                setApplied(false);
              }}
            />
          </div>

          <div className="sim-actions">
            <button className="refresh-button" onClick={runSimulation}>
              Simulate
            </button>
            <button className="reset-button" onClick={resetSimulation}>
              Reset
            </button>
          </div>
        </div>

        {simError && <p className="sim-error">{simError}</p>}

        {simResult && (
          <div className={`sim-result ${simResult.fits ? "sim-fit" : "sim-overflow"}`}>

            <div className="sim-result-header">
              <strong>{simResult.site.site_name}</strong>
              <span
                className={`status-badge ${
                  simResult.fits
                    ? simResult.status === "Available"
                      ? "available-status"
                      : "limited-status"
                    : "overflow-status"
                }`}
              >
                ● {simResult.status}
              </span>
            </div>

            <div className="sim-compare">
              <div className="sim-col">
                <span>Before</span>
                <p>{simResult.currentOccupied.toLocaleString()} occupied</p>
                <p>{(simResult.site.available_capacity ?? 0).toLocaleString()} available</p>
              </div>
              <div className="sim-arrow">→</div>
              <div className="sim-col">
                <span>After (+{simResult.count.toLocaleString()})</span>
                <p>{simResult.projectedOccupied.toLocaleString()} occupied</p>
                <p>
                  {Math.max(simResult.projectedAvailable, 0).toLocaleString()} available
                </p>
              </div>
            </div>

            <div className="main-progress">
              <div
                className="main-progress-fill"
                style={{
                  width: `${Math.min(simResult.projectedUtilization, 100)}%`,
                  background: simResult.fits ? undefined : "#f87171",
                }}
              ></div>
            </div>
            <div className="capacity-label">
              <span>Projected utilization</span>
              <strong>{simResult.projectedUtilization.toFixed(1)}%</strong>
            </div>

            {!simResult.fits && (
              <p className="sim-error">
                This site cannot absorb {simResult.count.toLocaleString()} people —
                capacity would be exceeded by{" "}
                {(simResult.projectedOccupied - simResult.site.capacity).toLocaleString()}.
                Choose a different site or split the group.
              </p>
            )}

            {simResult.fits && (
              <div className="sim-apply-row">
                <button
                  className="refresh-button"
                  onClick={applySimulation}
                  disabled={applied}
                >
                  {applied ? "✓ Plan Confirmed" : "Apply to Relocation Plan"}
                </button>
                {applied && (
                  <span className="sim-applied-note">
                    Recorded for this session — hook this action up to the relocation
                    API to persist it.
                  </span>
                )}
              </div>
            )}
          </div>
        )}
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
