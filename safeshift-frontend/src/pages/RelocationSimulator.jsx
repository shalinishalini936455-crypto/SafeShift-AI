import { useState } from "react";
import "./RelocationSimulator.css";

function RelocationSimulator() {
  const [habitation, setHabitation] = useState("");
  const [people, setPeople] = useState("");
  const [site, setSite] = useState("");
  const [result, setResult] = useState(null);

  const habitations = [
    {
      name: "Hill View Colony",
      population: 1250,
      risk: "Critical",
      score: 91,
    },
    {
      name: "River Bank Area",
      population: 980,
      risk: "High",
      score: 84,
    },
    {
      name: "Green Valley",
      population: 760,
      risk: "Medium",
      score: 68,
    },
  ];

  const safeSites = [
    {
      name: "Government Higher Secondary School",
      available: 900,
      capacity: 1500,
      distance: "2.4 km",
    },
    {
      name: "District Community Hall",
      available: 650,
      capacity: 1000,
      distance: "3.1 km",
    },
    {
      name: "Municipal Sports Complex",
      available: 400,
      capacity: 2000,
      distance: "4.8 km",
    },
    {
      name: "Government College Campus",
      available: 1800,
      capacity: 2500,
      distance: "5.2 km",
    },
  ];

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
      (item) => item.name === site
    );

    const selectedHabitation = habitations.find(
      (item) => item.name === habitation
    );

    const required = Number(people);

    if (required <= selectedSite.available) {
      setResult({
        type: "success",
        title: "Relocation Recommended",
        message:
          "The selected safe site has sufficient capacity for the planned relocation.",
        required: required,
        available: selectedSite.available,
        remaining: selectedSite.available - required,
        risk: selectedHabitation.risk,
        score: selectedHabitation.score,
        distance: selectedSite.distance,
      });
    } else {
      setResult({
        type: "danger",
        title: "Capacity Insufficient",
        message:
          "The selected safe site cannot accommodate all people in this scenario.",
        required: required,
        available: selectedSite.available,
        remaining: 0,
        risk: selectedHabitation.risk,
        score: selectedHabitation.score,
        distance: selectedSite.distance,
      });
    }
  }

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
            Simulate evacuation scenarios and evaluate safe-site capacity
          </p>
        </div>

        <div className="simulation-status">
          <span className="status-dot"></span>
          SIMULATION MODE
        </div>

      </div>


      {/* SCENARIO CARD */}

      <div className="scenario-card">

        <div className="scenario-header">

          <div>
            <h2>Relocation Scenario</h2>

            <p>
              Configure a relocation scenario using monitored
              habitation and safe-site data.
            </p>
          </div>

          <span className="demo-badge">
            DEMO DATA
          </span>

        </div>


        {/* FORM */}

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
                  key={item.name}
                  value={item.name}
                >
                  {item.name} — {item.risk} Risk
                </option>
              ))}

            </select>

            {habitation && (
              <div className="field-info">
                Selected habitation
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
                  key={item.name}
                  value={item.name}
                >
                  {item.name} — {item.available} available
                </option>
              ))}

            </select>

            <div className="field-info">
              Available accommodation capacity
            </div>

          </div>

        </div>


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
                AI ASSESSMENT
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
                  Risk Score
                </span>

                <strong>
                  {result.score}/100
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
                    ? `Relocate ${result.required.toLocaleString()} people from ${habitation} to ${site}. The site has sufficient capacity and is approximately ${result.distance} away.`
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
              3
            </strong>

            <small>
              Available for simulation
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
              4
            </strong>

            <small>
              Evacuation destinations
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
              3,750
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