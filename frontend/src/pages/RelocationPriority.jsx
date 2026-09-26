import { useEffect, useState } from "react";
import "./RelocationPriority.css";
import { getHabitations, getRedZones } from "../services/api";

function RelocationPriority() {
  const [habitations, setHabitations] = useState([]);
  const [redZones, setRedZones] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getHabitations(),
      getRedZones(),
    ])
      .then(([habitationResponse, redZoneResponse]) => {
        setHabitations(habitationResponse.data);
        setRedZones(redZoneResponse.data);
      })
      .catch((error) => {
        console.error("Relocation Priority API Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // -----------------------------
  // FIND HAZARD
  // -----------------------------
  function getHazard(habitation) {
    if (!redZones.length) {
      return "Not available";
    }

    const sameDistrict = redZones.find(
      (zone) =>
        zone.district?.toLowerCase() ===
        habitation.district?.toLowerCase()
    );

    return sameDistrict
      ? sameDistrict.hazard_type
      : "Not available";
  }

  // -----------------------------
  // RISK SCORE
  // -----------------------------
  function getRiskScore(risk) {
    if (risk === "Critical") return 90;
    if (risk === "High") return 75;
    if (risk === "Medium") return 50;
    return 25;
  }

  // -----------------------------
  // RELOCATION STAGE
  // -----------------------------
  function getRelocationStage(risk) {
    if (risk === "Critical") {
      return "Immediate";
    }

    if (risk === "High") {
      return "Short-Term";
    }

    if (risk === "Medium") {
      return "Medium-Term";
    }

    return "Monitor";
  }

  // -----------------------------
  // ACTION STATUS
  // -----------------------------
  function getStatus(stage) {
    if (stage === "Immediate") {
      return "Immediate evacuation required";
    }

    if (stage === "Short-Term") {
      return "Short-term relocation planning";
    }

    if (stage === "Medium-Term") {
      return "Medium-term relocation planning";
    }

    return "Continue monitoring";
  }

  // -----------------------------
  // PRIORITY DATA
  // -----------------------------
  const priorityData = habitations
    .map((item) => {
      const riskScore = getRiskScore(item.risk_level);
      const relocationStage = getRelocationStage(
        item.risk_level
      );

      return {
        id: `HAB-${item.id}`,
        name: item.name,
        district: item.district,
        hazard: getHazard(item),
        population: Number(item.population || 0),
        riskLevel: item.risk_level,
        riskScore,
        relocationStage,
        status: getStatus(relocationStage),
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  // -----------------------------
  // SUMMARY
  // -----------------------------
  const immediateCount = priorityData.filter(
    (item) => item.relocationStage === "Immediate"
  ).length;

  const shortTermCount = priorityData.filter(
    (item) => item.relocationStage === "Short-Term"
  ).length;

  const mediumTermCount = priorityData.filter(
    (item) => item.relocationStage === "Medium-Term"
  ).length;

  const peopleAtRisk = priorityData.reduce(
    (total, item) => total + item.population,
    0
  );

  const highestRisk =
    priorityData.length > 0
      ? Math.max(
          ...priorityData.map(
            (item) => item.riskScore
          )
        )
      : 0;

  return (
    <div className="priority-page">

      {/* HEADER */}
      <div className="priority-header">
        <div>
          

          <h1>Relocation Priority</h1>

          <p>
            AI-assisted prioritization of vulnerable
            habitations for proactive relocation.
          </p>
        </div>

        <div className="priority-mode">
          ● PRIORITY ANALYSIS
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="priority-summary">

        <div className="priority-summary-card immediate-card">
          <div className="summary-icon">!</div>

          <div>
            <span>Immediate</span>

            <h2>
              {loading ? "..." : immediateCount}
            </h2>

            <p>Urgent evacuation</p>
          </div>
        </div>

        <div className="priority-summary-card high-card">
          <div className="summary-icon">↑</div>

          <div>
            <span>Short-Term</span>

            <h2>
              {loading ? "..." : shortTermCount}
            </h2>

            <p>Relocation planning</p>
          </div>
        </div>

        <div className="priority-summary-card people-card">
          <div className="summary-icon">👥</div>

          <div>
            <span>Medium-Term</span>

            <h2>
              {loading ? "..." : mediumTermCount}
            </h2>

            <p>Planned relocation</p>
          </div>
        </div>

       <div className="priority-summary-card priority-risk-card">
          <div className="summary-icon">⚠</div>

          <div>
            <span>People at Risk</span>

            <h2>
              {loading
                ? "..."
                : peopleAtRisk.toLocaleString()}
            </h2>

            <p>Across monitored habitations</p>
          </div>
        </div>

      </div>

      {/* MAIN TABLE */}
      <div className="priority-table-card">

        <div className="priority-table-header">

          <div>
            <h2>Priority Assessment</h2>

            <p>
              Habitations ranked using risk,
              population and hazard information.
            </p>
          </div>

          <span className="demo-label">
            BACKEND DATA
          </span>

        </div>

        <div className="priority-table-wrapper">

          {loading ? (
            <p style={{ padding: "20px" }}>
              Loading priority data...
            </p>
          ) : (
            <table className="priority-table">

              <thead>
                <tr>
                  <th>RANK</th>
                  <th>HABITATION</th>
                  <th>HAZARD</th>
                  <th>POPULATION</th>
                  <th>RISK SCORE</th>
                  <th>RELOCATION STAGE</th>
                  <th>STATUS</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {priorityData.map(
                  (item, index) => (

                    <tr key={item.id}>

                      <td>
                        <div className="rank-number">
                          #{index + 1}
                        </div>
                      </td>

                      <td>
                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          {item.district}
                        </small>
                      </td>

                      <td>
                        <span className="hazard-name">
                          {item.hazard}
                        </span>
                      </td>

                      <td>
                        {item.population.toLocaleString()}
                      </td>

                      <td>

                        <div className="risk-score-container">

                          <strong>
                            {item.riskScore}
                          </strong>

                          <div className="risk-progress">

                            <div
                              style={{
                                width:
                                  `${item.riskScore}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>

                      <td>

                        <span
                          className={`priority-badge ${item.relocationStage
                            .toLowerCase()
                            .replace("-", "-")}`}
                        >
                          {item.relocationStage}
                        </span>

                      </td>

                      <td>

                        <span className="status-text">
                          {item.status}
                        </span>

                      </td>

                      <td>

                        <button
                          className="details-button"
                          onClick={() =>
                            setSelected(item)
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </div>

      {/* DECISION ENGINE */}
      <div className="priority-ai-card">

        <div className="ai-icon">
          AI
        </div>

        <div>

          <span>RELOCATION PRIORITY ENGINE</span>

          <h2>
            How relocation priority is determined
          </h2>

          <p>
            The system evaluates habitation risk
            and exposure information to determine
            the appropriate relocation stage.
          </p>

          <div className="ai-factors">

            <div>
              <strong>01</strong>
              <span>Hazard Risk</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Population Exposure</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Vulnerability</span>
            </div>

            <div>
              <strong>04</strong>
              <span>Disaster History</span>
            </div>

          </div>

        </div>

      </div>

      {/* RELOCATION WORKFLOW */}
      <div className="priority-ai-card">

        <div className="ai-icon">
          →
        </div>

        <div>

          <span>RELOCATION WORKFLOW</span>

          <h2>
            From risk identification to resettlement
          </h2>

          <p>
            A prioritized habitation moves through
            immediate response, planned relocation
            and finally permanent resettlement.
          </p>

          <div className="ai-factors">

            <div>
              <strong>01</strong>
              <span>Immediate Evacuation</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Short-Term Relocation</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Medium-Term Relocation</span>
            </div>

            <div>
              <strong>04</strong>
              <span>Permanent Resettlement</span>
            </div>

          </div>

        </div>

      </div>

      {/* DETAILS */}
      {selected && (

        <div className="priority-detail-card">

          <div className="detail-header">

            <div>

              <span>
                HABITATION PRIORITY DETAILS
              </span>

              <h2>
                {selected.name}
              </h2>

            </div>

            <button
              className="close-detail"
              onClick={() =>
                setSelected(null)
              }
            >
              ×
            </button>

          </div>

          <div className="detail-grid">

            <div>
              <span>Habitation ID</span>
              <strong>
                {selected.id}
              </strong>
            </div>

            <div>
              <span>District</span>
              <strong>
                {selected.district}
              </strong>
            </div>

            <div>
              <span>Hazard Type</span>
              <strong>
                {selected.hazard}
              </strong>
            </div>

            <div>
              <span>Population</span>
              <strong>
                {selected.population.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Risk Level</span>
              <strong>
                {selected.riskLevel}
              </strong>
            </div>

            <div>
              <span>Risk Score</span>
              <strong>
                {selected.riskScore}/100
              </strong>
            </div>

            <div>
              <span>Relocation Stage</span>
              <strong>
                {selected.relocationStage}
              </strong>
            </div>

            <div>
              <span>Recommended Action</span>
              <strong>
                {selected.status}
              </strong>
            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default RelocationPriority;