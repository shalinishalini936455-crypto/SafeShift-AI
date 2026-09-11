import { useState } from "react";
import "./RelocationPriority.css";

function RelocationPriority() {
  const [selected, setSelected] = useState(null);

  const priorityData = [
    {
      id: "PRI-001",
      name: "Hill View Colony",
      hazard: "Landslide",
      population: 1250,
      riskScore: 91,
      priority: "Immediate",
      status: "Relocation Required",
    },
    {
      id: "PRI-002",
      name: "River Bank Area",
      hazard: "Flood",
      population: 980,
      riskScore: 84,
      priority: "Immediate",
      status: "Action Required",
    },
    {
      id: "PRI-003",
      name: "Green Valley",
      hazard: "Flood",
      population: 760,
      riskScore: 68,
      priority: "High",
      status: "Planning Required",
    },
    {
      id: "PRI-004",
      name: "Lake View Settlement",
      hazard: "Flood",
      population: 540,
      riskScore: 57,
      priority: "Medium",
      status: "Monitor",
    },
  ];

  return (
    <div className="priority-page">

      {/* HEADER */}
      <div className="priority-header">
        <div>
          <span>RELOCATION DECISION SUPPORT</span>
          <h1>Relocation Priority</h1>
          <p>
            Identify and prioritize habitations requiring relocation action.
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
            <h2>2</h2>
            <p>Urgent relocation</p>
          </div>
        </div>

        <div className="priority-summary-card high-card">
          <div className="summary-icon">↑</div>
          <div>
            <span>High Priority</span>
            <h2>1</h2>
            <p>Action planning</p>
          </div>
        </div>

        <div className="priority-summary-card people-card">
          <div className="summary-icon">👥</div>
          <div>
            <span>People at Risk</span>
            <h2>2,990</h2>
            <p>Priority habitations</p>
          </div>
        </div>

        <div className="priority-summary-card risk-card">
          <div className="summary-icon">⚠</div>
          <div>
            <span>Highest Risk</span>
            <h2>91</h2>
            <p>Out of 100</p>
          </div>
        </div>

      </div>


      {/* MAIN TABLE */}
      <div className="priority-table-card">

        <div className="priority-table-header">
          <div>
            <h2>Priority Assessment</h2>
            <p>
              AI-assisted ranking of high-risk habitations
            </p>
          </div>

          <span className="demo-label">
            DEMO DATA
          </span>
        </div>


        <div className="priority-table-wrapper">

          <table className="priority-table">

            <thead>
              <tr>
                <th>RANK</th>
                <th>HABITATION</th>
                <th>HAZARD</th>
                <th>POPULATION</th>
                <th>RISK SCORE</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {priorityData.map((item, index) => (

                <tr key={item.id}>

                  <td>
                    <div className="rank-number">
                      #{index + 1}
                    </div>
                  </td>

                  <td>
                    <strong>{item.name}</strong>
                    <small>{item.id}</small>
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

                      <strong>{item.riskScore}</strong>

                      <div className="risk-progress">
                        <div
                          style={{
                            width: `${item.riskScore}%`,
                          }}
                        ></div>
                      </div>

                    </div>

                  </td>

                  <td>

                    <span
                      className={`priority-badge ${item.priority
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.priority}
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
                      onClick={() => setSelected(item)}
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* AI EXPLANATION */}
      <div className="priority-ai-card">

        <div className="ai-icon">
          AI
        </div>

        <div>
          <span>AI PRIORITY ENGINE</span>

          <h2>
            How relocation priority is determined
          </h2>

          <p>
            The system considers hazard severity, habitation risk score,
            exposed population and current risk status to organize
            relocation actions in priority order.
          </p>

          <div className="ai-factors">

            <div>
              <strong>01</strong>
              <span>Hazard Severity</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Risk Score</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Population Exposure</span>
            </div>

            <div>
              <strong>04</strong>
              <span>Priority Status</span>
            </div>

          </div>
        </div>

      </div>


      {/* SELECTED DETAILS */}
      {selected && (

        <div className="priority-detail-card">

          <div className="detail-header">

            <div>
              <span>HABITATION PRIORITY DETAILS</span>
              <h2>{selected.name}</h2>
            </div>

            <button
              className="close-detail"
              onClick={() => setSelected(null)}
            >
              ×
            </button>

          </div>


          <div className="detail-grid">

            <div>
              <span>Habitation ID</span>
              <strong>{selected.id}</strong>
            </div>

            <div>
              <span>Hazard Type</span>
              <strong>{selected.hazard}</strong>
            </div>

            <div>
              <span>Population</span>
              <strong>
                {selected.population.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Risk Score</span>
              <strong>{selected.riskScore}/100</strong>
            </div>

            <div>
              <span>Priority</span>
              <strong>{selected.priority}</strong>
            </div>

            <div>
              <span>Recommended Status</span>
              <strong>{selected.status}</strong>
            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default RelocationPriority;