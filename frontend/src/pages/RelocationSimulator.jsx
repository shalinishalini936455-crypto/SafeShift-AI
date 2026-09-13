import { useEffect, useState } from "react";
import "./RelocationSimulator.css";
import { getHabitations, getSafeSites } from "../services/api";

function RelocationSimulator() {
  const [habitations, setHabitations] = useState([]);
  const [safeSites, setSafeSites] = useState([]);

  const [habitation, setHabitation] = useState("");
  const [people, setPeople] = useState("");
  const [site, setSite] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load backend data
  useEffect(() => {
    Promise.all([getHabitations(), getSafeSites()])
      .then(([habitationResponse, siteResponse]) => {
        setHabitations(habitationResponse.data);
        setSafeSites(siteResponse.data);
      })
      .catch((error) => {
        console.error("Relocation Simulator API Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleHabitationChange(e) {
    const value = e.target.value;
    setHabitation(value);

    const selected = habitations.find(
      (item) => item.name === value
    );

    if (selected) {
      setPeople(selected.population);
    } else {
      setPeople("");
    }

    setResult(null);
  }

  function runSimulation() {
    if (!habitation || !people || !site) {
      setResult({
        type: "warning",
        title: "Incomplete Scenario",
        message:
          "Please select a habitation, enter the number of people, and select a safe site.",
      });
      return;
    }

    const selectedSite = safeSites.find(
      (item) => item.site_name === site
    );

    const selectedHabitation = habitations.find(
      (item) => item.name === habitation
    );

    if (!selectedSite || !selectedHabitation) {
      setResult({
        type: "danger",
        title: "Data Not Found",
        message:
          "The selected habitation or safe site could not be found in the backend.",
      });
      return;
    }

    const required = Number(people);
    const available = Number(selectedSite.available_capacity || 0);

    if (required <= available) {
      setResult({
        type: "success",
        title: "Relocation Recommended",
        message:
          "The selected safe site has sufficient capacity for the planned relocation.",
        required: required,
        available: available,
        remaining: available - required,
        risk: selectedHabitation.risk_level,
        score: null,
      });
    } else {
      setResult({
        type: "danger",
        title: "Capacity Insufficient",
        message:
          "The selected safe site cannot accommodate all people in this scenario.",
        required: required,
        available: available,
        remaining: 0,
        risk: selectedHabitation.risk_level,
        score: null,
      });
    }
  }

  const totalCapacity = safeSites.reduce(
    (total, site) =>
      total + Number(site.capacity || 0),
    0
  );

  const availableCapacity = safeSites.reduce(
    (total, site) =>
      total + Number(site.available_capacity || 0),
    0
  );

  const highRiskHabitations = habitations.filter(
    (item) =>
      item.risk_level === "Critical" ||
      item.risk_level === "High"
  ).length;

  return (
    <div className="relocation-page">

      {/* HEADER */}
      <div className="relocation-header">
        <div>
          <span className="page-label">
            DECISION SUPPORT
          </span>

          <h1>Relocation Simulator</h1>

          <p>
            Simulate evacuation scenarios using monitored
            habitation and safe-site data.
          </p>
        </div>

        <div className="simulation-status">
          <span className="status-dot"></span>
          BACKEND CONNECTED
        </div>
      </div>

      {/* SCENARIO CARD */}
      <div className="scenario-card">

        <div className="scenario-header">
          <div>
            <h2>Relocation Scenario</h2>

            <p>
              Configure a relocation scenario using
              backend habitation and safe-site data.
            </p>
          </div>

          <span className="demo-badge">
            BACKEND DATA
          </span>
        </div>

        {loading ? (
          <div className="field-info">
            Loading habitation and safe-site data...
          </div>
        ) : (
          <div className="scenario-grid">

            {/* HABITATION */}
            <div className="field-group">

              <label>
                Source Habitation
              </label>

              <select
                value={habitation}
                onChange={handleHabitationChange}
              >
                <option value="">
                  Select habitation
                </option>

                {habitations.map((item) => (
                  <option
                    key={item.id}
                    value={item.name}
                  >
                    {item.name} — {item.risk_level} Risk
                  </option>
                ))}
              </select>

              {habitation && (
                <div className="field-info">
                  Population loaded from backend
                </div>
              )}

            </div>

            {/* PEOPLE */}
            <div className="field-group">

              <label>
                People to Relocate
              </label>

              <input
                type="number"
                min="1"
                value={people}
                onChange={(e) => {
                  setPeople(e.target.value);
                  setResult(null);
                }}
                placeholder="Enter number of people"
              />

              <div className="field-info">
                Population requiring relocation
              </div>

            </div>

            {/* SAFE SITE */}
            <div className="field-group">

              <label>
                Destination Safe Site
              </label>

              <select
                value={site}
                onChange={(e) => {
                  setSite(e.target.value);
                  setResult(null);
                }}
              >
                <option value="">
                  Select safe site
                </option>

                {safeSites.map((item) => (
  <option
    key={item.id}
    value={item.site_name}
  >
    {item.site_name} — {item.available_capacity} available
  </option>
))}
              </select>

              <div className="field-info">
                Available accommodation capacity
              </div>

            </div>

          </div>
        )}

        {/* SELECTED DATA */}
        {habitation && site && (
          <div className="selection-preview">

            <div className="preview-item">
              <span>Source</span>

              <strong>
                {habitation}
              </strong>
            </div>

            <div className="preview-arrow">
              →
            </div>

            <div className="preview-item">
              <span>Destination</span>

              <strong>
                {site}
              </strong>
            </div>

          </div>
        )}

        <button
          className="simulate-button"
          onClick={runSimulation}
          disabled={loading}
        >
          <span>▶</span>
          Run Relocation Simulation
        </button>

      </div>

      {/* RESULT */}
      {result && (
        <div
          className={`result-card ${result.type}`}
        >

          <div className="result-top">

            <div className="result-icon">
              {result.type === "success"
                ? "✓"
                : "!"}
            </div>

            <div>

              <span className="result-label">
                RELOCATION ASSESSMENT
              </span>

              <h2>
                {result.title}
              </h2>

              <p>
                {result.message}
              </p>

            </div>

          </div>

          {result.required !== undefined && (
            <div className="result-metrics">

              <div className="result-metric">
                <span>
                  People
                </span>

                <strong>
                  {result.required.toLocaleString()}
                </strong>
              </div>

              <div className="result-metric">
                <span>
                  Site Available
                </span>

                <strong>
                  {result.available.toLocaleString()}
                </strong>
              </div>

              <div className="result-metric">
                <span>
                  Remaining
                </span>

                <strong>
                  {result.remaining.toLocaleString()}
                </strong>
              </div>

              <div className="result-metric">
                <span>
                  Risk Level
                </span>

                <strong>
                  {result.risk || "Not available"}
                </strong>
              </div>

            </div>
          )}

          {result.required !== undefined && (
            <div className="recommendation">

              <div className="recommendation-icon">
                🤖
              </div>

              <div>

                <strong>
                  Relocation Recommendation
                </strong>

                <p>
                  {result.type === "success"
                    ? `Relocate ${result.required.toLocaleString()} people from ${habitation} to ${site}. The selected site has sufficient available capacity.`
                    : `Consider an alternative safe site because ${site} has only ${result.available.toLocaleString()} spaces available for ${result.required.toLocaleString()} people.`}
                </p>

              </div>

            </div>
          )}

        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="simulator-summary">

        <div className="summary-card">

          <div className="summary-icon blue">
            🏘️
          </div>

          <div>

            <span>
              High-Risk Habitations
            </span>

            <strong>
              {loading ? "..." : highRiskHabitations}
            </strong>

            <small>
              From backend
            </small>

          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon green">
            📍
          </div>

          <div>

            <span>
              Monitored Safe Sites
            </span>

            <strong>
              {loading ? "..." : safeSites.length}
            </strong>

            <small>
              From backend
            </small>

          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon orange">
            👥
          </div>

          <div>

            <span>
              Available Capacity
            </span>

            <strong>
              {loading
                ? "..."
                : availableCapacity.toLocaleString()}
            </strong>

            <small>
              Current available spaces
            </small>

          </div>

        </div>

      </div>

    </div>
  );
}

export default RelocationSimulator;