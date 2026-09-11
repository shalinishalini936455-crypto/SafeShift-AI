import { useState } from "react";

function RedZoneManagement() {
  const [showForm, setShowForm] = useState(false);

  const zones = [
    {
      id: "RZ-024",
      name: "Hill View Zone",
      hazard: "Landslide",
      severity: "Critical",
      area: "2.8 km²",
      population: "1,240",
      status: "Active",
    },
    {
      id: "RZ-018",
      name: "River Bank Zone",
      hazard: "Flood",
      severity: "High",
      area: "4.2 km²",
      population: "980",
      status: "Active",
    },
    {
      id: "RZ-011",
      name: "Lowland Area",
      hazard: "Flood",
      severity: "Medium",
      area: "1.9 km²",
      population: "560",
      status: "Under Review",
    },
  ];

  return (
    <div className="redzone-page">

      <div className="page-header">
        <div>
          <h2>Red Zone Management</h2>
          <p>
            Manage and monitor officially declared high-risk zones
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Declare Red Zone
        </button>
      </div>


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

            <div>
              <label>Affected Area</label>
              <input placeholder="Example: 2.5 km²" />
            </div>

            <div>
              <label>Effective Date</label>
              <input type="date" />
            </div>

            <div>
              <label>Review Date</label>
              <input type="date" />
            </div>

            <div className="full-width">
              <label>Reason</label>
              <textarea
                placeholder="Enter reason for declaring this red zone"
                rows="3"
              ></textarea>
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
          <strong>24</strong>
        </div>

        <div>
          <span>Critical</span>
          <strong className="critical-number">7</strong>
        </div>

        <div>
          <span>High Risk</span>
          <strong className="high-number">11</strong>
        </div>

        <div>
          <span>Under Review</span>
          <strong>6</strong>
        </div>

      </div>


      {/* TABLE */}

      <div className="zone-table-card">

        <div className="table-header">
          <div>
            <h3>Declared Red Zones</h3>
            <p>Current monitored zones</p>
          </div>

          <input
            className="search-input"
            placeholder="Search zone..."
          />
        </div>


        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Zone ID</th>
                <th>Zone Name</th>
                <th>Hazard</th>
                <th>Severity</th>
                <th>Area</th>
                <th>Population</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {zones.map((zone) => (

                <tr key={zone.id}>

                  <td>
                    <strong>{zone.id}</strong>
                  </td>

                  <td>{zone.name}</td>

                  <td>{zone.hazard}</td>

                  <td>
                    <span
                      className={`severity ${zone.severity.toLowerCase()}`}
                    >
                      {zone.severity}
                    </span>
                  </td>

                  <td>{zone.area}</td>

                  <td>{zone.population}</td>

                  <td>
                    <span
                      className={`zone-status ${
                        zone.status === "Active"
                          ? "active"
                          : "review"
                      }`}
                    >
                      {zone.status}
                    </span>
                  </td>

                  <td>
                    <button className="view-btn">
                      View
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default RedZoneManagement;