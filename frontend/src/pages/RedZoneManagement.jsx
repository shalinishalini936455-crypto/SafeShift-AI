import { useEffect, useState } from "react";
import { getRedZones } from "../services/api";

function RedZoneManagement() {
  const [showForm, setShowForm] = useState(false);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getRedZones()
      .then((response) => {
        console.log("Red Zones API:", response.data);
        setZones(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Red Zones API Error:", error);
        setError("Unable to load red zone data");
        setLoading(false);
      });
  }, []);

  const totalZones = zones.length;

  const criticalZones = zones.filter(
    (zone) => zone.severity === "Critical"
  ).length;

  const highZones = zones.filter(
    (zone) => zone.severity === "High"
  ).length;

  const filteredZones = zones.filter((zone) =>
    `${zone.zone_name} ${zone.district} ${zone.hazard_type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
          <span>Other</span>
          <strong>
            {loading
              ? "..."
              : totalZones - criticalZones - highZones}
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
            <p>Current monitored zones</p>
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
                  <th>Latitude</th>
                  <th>Longitude</th>
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
                      {zone.latitude}
                    </td>

                    <td>
                      {zone.longitude}
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