import { useState } from "react";

function SafeSites() {
  const [selected, setSelected] = useState(null);

  const safeSites = [
    {
      id: "SAFE-001",
      name: "Government Higher Secondary School",
      location: "Salem North",
      type: "School",
      capacity: 1500,
      available: 900,
      distance: "2.4 km",
      status: "Available"
    },
    {
      id: "SAFE-002",
      name: "District Community Hall",
      location: "Salem Central",
      type: "Community Hall",
      capacity: 1000,
      available: 650,
      distance: "3.1 km",
      status: "Available"
    },
    {
      id: "SAFE-003",
      name: "Municipal Sports Complex",
      location: "Salem East",
      type: "Sports Complex",
      capacity: 2000,
      available: 400,
      distance: "4.8 km",
      status: "Limited"
    },
    {
      id: "SAFE-004",
      name: "Government College Campus",
      location: "Salem South",
      type: "College",
      capacity: 2500,
      available: 1800,
      distance: "5.2 km",
      status: "Available"
    }
  ];

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
          DEMO DATA
        </div>

      </div>


      {/* SUMMARY */}

      <div className="summary-grid">

        <div className="summary-card">
          <span>Total Safe Sites</span>
          <strong>24</strong>
        </div>

        <div className="summary-card">
          <span>Total Capacity</span>
          <strong>18,500</strong>
        </div>

        <div className="summary-card">
          <span>Available Spaces</span>
          <strong>11,240</strong>
        </div>

        <div className="summary-card">
          <span>Available Sites</span>
          <strong>18</strong>
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

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Safe Site</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Available</th>
                <th>Distance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {safeSites.map((site) => (

                <tr key={site.id}>

                  <td>{site.id}</td>

                  <td>
                    <strong>{site.name}</strong>

                    <small>
                      {site.location}
                    </small>
                  </td>

                  <td>
                    {site.type}
                  </td>

                  <td>
                    {site.capacity.toLocaleString()}
                  </td>

                  <td>
                    {site.available.toLocaleString()}
                  </td>

                  <td>
                    {site.distance}
                  </td>

                  <td>

                    <span
                      className={
                        site.status === "Available"
                          ? "risk-badge medium"
                          : "risk-badge high"
                      }
                    >
                      {site.status}
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

        </div>

      </div>


      {/* DETAILS */}

      {selected && (

        <div className="risk-panel">

          <h3>Safe Site Details</h3>

          <h2>{selected.name}</h2>


          <div className="analysis-item">
            <span>Site ID</span>
            <strong>{selected.id}</strong>
          </div>


          <div className="analysis-item">
            <span>Location</span>
            <strong>{selected.location}</strong>
          </div>


          <div className="analysis-item">
            <span>Site Type</span>
            <strong>{selected.type}</strong>
          </div>


          <div className="analysis-item">
            <span>Total Capacity</span>
            <strong>
              {selected.capacity.toLocaleString()}
            </strong>
          </div>


          <div className="analysis-item">
            <span>Available Spaces</span>
            <strong>
              {selected.available.toLocaleString()}
            </strong>
          </div>


          <div className="analysis-item">
            <span>Distance</span>
            <strong>{selected.distance}</strong>
          </div>


          <div className="analysis-item">
            <span>Status</span>
            <strong>{selected.status}</strong>
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