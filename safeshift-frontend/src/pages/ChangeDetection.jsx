import { useState } from "react";

function ChangeDetection() {
  const [selected, setSelected] = useState(null);

  const detections = [
    {
      id: "DET-051",
      zone: "RZ-024",
      type: "New Structure",
      confidence: 94,
      date: "2026-09-10",
      status: "Pending Verification",
      risk: "High",
    },
    {
      id: "DET-050",
      zone: "RZ-018",
      type: "Land Disturbance",
      confidence: 89,
      date: "2026-09-09",
      status: "Under Verification",
      risk: "High",
    },
    {
      id: "DET-049",
      zone: "RZ-011",
      type: "Construction Activity",
      confidence: 82,
      date: "2026-09-08",
      status: "Confirmed",
      risk: "Medium",
    },
  ];

  return (
    <div className="detection-page">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <h2>AI Change Detection</h2>
          <p>
            Monitor potential land-use changes inside declared red zones
          </p>
        </div>

        <div className="ai-status">
          <span>●</span> AI MONITORING ACTIVE
        </div>
      </div>


      {/* INFORMATION */}

      <div className="ai-info">

        <div className="ai-info-icon">
          🤖
        </div>

        <div>
          <strong>How AI Change Detection Works</strong>

          <p>
            The system compares previous and latest imagery to identify
            potential new structures or land-use changes. Detected changes
            are sent for authorized field verification.
          </p>
        </div>

      </div>


      {/* SUMMARY */}

      <div className="detection-summary">

        <div className="detection-stat">
          <span>Total Detections</span>
          <strong>50</strong>
        </div>

        <div className="detection-stat">
          <span>Pending Verification</span>
          <strong className="orange-text">6</strong>
        </div>

        <div className="detection-stat">
          <span>High Risk</span>
          <strong className="red-text">14</strong>
        </div>

        <div className="detection-stat">
          <span>Verified</span>
          <strong className="green-text">30</strong>
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

          {detections.map((item) => (

            <div
              key={item.id}
              className={`detection-row ${
                selected?.id === item.id ? "selected" : ""
              }`}
              onClick={() => setSelected(item)}
            >

              <div className="detection-icon">
                🤖
              </div>

              <div className="detection-details">

                <strong>{item.type}</strong>

                <p>
                  {item.zone} · {item.id}
                </p>

                <small>
                  Detected {item.date}
                </small>

              </div>

              <div className="confidence">

                <strong>{item.confidence}%</strong>

                <small>Confidence</small>

              </div>

              <span
                className={`detection-status ${
                  item.status
                    .toLowerCase()
                    .replaceAll(" ", "-")
                }`}
              >
                {item.status}
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
                  <h3>{selected.id}</h3>
                  <p>{selected.zone}</p>
                </div>

                <span className="high-risk-badge">
                  {selected.risk} Risk
                </span>
              </div>


              {/* IMAGE COMPARISON */}

              <div className="comparison">

                <div className="image-placeholder">

                  <span>PREVIOUS</span>

                  <div>
                    🛰️
                  </div>

                  <small>
                    Previous imagery
                  </small>

                </div>


                <div className="image-placeholder">

                  <span>LATEST</span>

                  <div>
                    🛰️
                  </div>

                  <small>
                    Latest imagery
                  </small>

                </div>

              </div>


              <div className="change-result">

                <h4>Detection Result</h4>

                <div className="result-row">
                  <span>Change Type</span>
                  <strong>{selected.type}</strong>
                </div>

                <div className="result-row">
                  <span>AI Confidence</span>
                  <strong>{selected.confidence}%</strong>
                </div>

                <div className="result-row">
                  <span>Risk Level</span>
                  <strong className="red-text">
                    {selected.risk}
                  </strong>
                </div>

                <div className="result-row">
                  <span>Status</span>
                  <strong>{selected.status}</strong>
                </div>

              </div>


              <div className="verification-note">

                <strong>⚠️ Field Verification Required</strong>

                <p>
                  AI detection indicates a potential change.
                  Authorized personnel should verify the location
                  before taking action.
                </p>

              </div>


              <div className="detail-actions">

                <button className="verify-btn">
                  ✓ Verify Detection
                </button>

                <button className="false-btn">
                  Mark as False Detection
                </button>

              </div>

            </>

          ) : (

            <div className="no-selection">

              <div>🤖</div>

              <h3>Select a Detection</h3>

              <p>
                Select an AI detection from the list to view
                the comparison and analysis.
              </p>

            </div>

          )}

        </div>

      </div>


      {/* TIMELINE */}

      <div className="timeline-card">

        <div className="card-heading">
          <div>
            <h3>Change Timeline — RZ-024</h3>
            <p>Historical monitoring activity</p>
          </div>
        </div>

        <div className="timeline">

          <div className="timeline-item">
            <div className="timeline-dot"></div>

            <div>
              <strong>New structure detected</strong>
              <p>September 10, 2026 · 94% confidence</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>

            <div>
              <strong>Possible construction activity</strong>
              <p>August 18, 2026 · 87% confidence</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>

            <div>
              <strong>Land disturbance detected</strong>
              <p>July 12, 2026 · 81% confidence</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>

            <div>
              <strong>No significant change</strong>
              <p>June 05, 2026</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ChangeDetection;