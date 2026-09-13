import { useEffect, useState } from "react";
import { getSafeSites } from "../services/api";

function SafeSites() {
  const [selected, setSelected] = useState(null);
  const [safeSites, setSafeSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSafeSites()
      .then((response) => {
        console.log("Safe Sites API:", response.data);
        setSafeSites(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Safe Sites API Error:", error);
        setError("Unable to load safe site data");
        setLoading(false);
      });
  }, []);

  const totalSites = safeSites.length;

  const totalCapacity = safeSites.reduce(
    (total, site) => total + (site.capacity || 0),
    0
  );

  const availableSpaces = safeSites.reduce(
    (total, site) => total + (site.available_capacity || 0),
    0
  );

  const availableSites = safeSites.filter(
    (site) => (site.available_capacity || 0) > 0
  ).length;

  return (
    <div className="habitations-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h2>Safe Site Finder</h2>

          <p>
            Identify suitable evacuation and temporary shelter locations
          </p>
        </div>

        <div className="demo-badge">
          BACKEND DATA
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* SUMMARY */}

      <div className="summary-grid">

        <div className="summary-card">
          <span>Total Safe Sites</span>
          <strong>
            {loading ? "..." : totalSites}
          </strong>
        </div>

        <div className="summary-card">
          <span>Total Capacity</span>
          <strong>
            {loading ? "..." : totalCapacity.toLocaleString()}
          </strong>
        </div>

        <div className="summary-card">
          <span>Available Spaces</span>
          <strong>
            {loading ? "..." : availableSpaces.toLocaleString()}
          </strong>
        </div>

        <div className="summary-card">
          <span>Available Sites</span>
          <strong>
            {loading ? "..." : availableSites}
          </strong>
        </div>

      </div>

      {/* TABLE */}

      <div className="table-card">

        <div className="card-title">

          <h3>Recommended Safe Sites</h3>

          <span>
            Capacity and availability monitoring
          </span>

        </div>

        <div className="table-wrapper">

          {loading ? (
            <p>Loading safe site data...</p>
          ) : (
            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Safe Site</th>
                  <th>District</th>
                  <th>Capacity</th>
                  <th>Available</th>
                  <th>Safety Level</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {safeSites.map((site) => (

                  <tr key={site.id}>

                    <td>
                      SAFE-{String(site.id).padStart(3, "0")}
                    </td>

                    <td>
                      <strong>{site.site_name}</strong>

                      <small>
                        {site.district}
                      </small>
                    </td>

                    <td>
                      {site.district}
                    </td>

                    <td>
                      {(site.capacity || 0).toLocaleString()}
                    </td>

                    <td>
                      {(site.available_capacity || 0).toLocaleString()}
                    </td>

                    <td>

                      <span className="risk-badge medium">
                        {site.safety_level}
                      </span>

                    </td>

                    <td>

                      <button
                        className="view-btn"
                        onClick={() => setSelected(site)}
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>

      {/* DETAILS */}

      {selected && (

        <div className="risk-panel">

          <h3>Safe Site Details</h3>

          <h2>{selected.site_name}</h2>

          <div className="analysis-item">
            <span>Site ID</span>
            <strong>
              SAFE-{String(selected.id).padStart(3, "0")}
            </strong>
          </div>

          <div className="analysis-item">
            <span>District</span>
            <strong>{selected.district}</strong>
          </div>

          <div className="analysis-item">
            <span>Total Capacity</span>
            <strong>
              {(selected.capacity || 0).toLocaleString()}
            </strong>
          </div>

          <div className="analysis-item">
            <span>Available Spaces</span>
            <strong>
              {(selected.available_capacity || 0).toLocaleString()}
            </strong>
          </div>

          <div className="analysis-item">
            <span>Latitude</span>
            <strong>{selected.latitude}</strong>
          </div>

          <div className="analysis-item">
            <span>Longitude</span>
            <strong>{selected.longitude}</strong>
          </div>

          <div className="analysis-item">
            <span>Safety Level</span>
            <strong>{selected.safety_level}</strong>
          </div>

          <button
            className="primary-action"
            onClick={() => setSelected(null)}
          >
            Close Details
          </button>

        </div>

      )}

    </div>
  );
}

export default SafeSites;