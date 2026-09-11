import "./CarryingCapacity.css";

function CarryingCapacity() {
  return (
    <div className="carrying-page">

      <div className="carrying-header">
        <div>
          <div className="section-label">
            RESOURCE MANAGEMENT
          </div>

          <h1>Carrying Capacity</h1>

          <p>
            Monitor shelter capacity and available accommodation
          </p>
        </div>

        <div className="live-badge">
          <span className="live-dot"></span>
          LIVE MONITORING
        </div>
      </div>


      <div className="capacity-summary">

        <div className="capacity-card">
          <div className="card-icon blue-icon">
            ▣
          </div>

          <div className="card-content">
            <span>Total Capacity</span>
            <h2>7,000</h2>
            <small>Across all safe sites</small>
          </div>
        </div>


        <div className="capacity-card">
          <div className="card-icon orange-icon">
            ◉
          </div>

          <div className="card-content">
            <span>Occupied</span>
            <h2>3,250</h2>
            <small>Currently accommodated</small>
          </div>
        </div>


        <div className="capacity-card">
          <div className="card-icon green-icon">
            ✓
          </div>

          <div className="card-content">
            <span>Available</span>
            <h2>3,750</h2>
            <small>Ready for relocation</small>
          </div>
        </div>


        <div className="capacity-card">
          <div className="card-icon purple-icon">
            %
          </div>

          <div className="card-content">
            <span>Utilization</span>
            <h2>46.4%</h2>
            <small>Overall occupancy rate</small>
          </div>
        </div>

      </div>


      <div className="overview-card">

        <div className="section-heading">
          <div>
            <h2>Capacity Overview</h2>

            <p>
              Current utilization across registered safe sites
            </p>
          </div>

          <span className="demo-badge">
            DEMO DATA
          </span>
        </div>


        <div className="capacity-label">
          <span>
            Overall Capacity Utilization
          </span>

          <strong>
            46.4%
          </strong>
        </div>


        <div className="main-progress">
          <div
            className="main-progress-fill"
            style={{ width: "46.4%" }}
          ></div>
        </div>


        <div className="capacity-legend">

          <span>
            <i className="occupied-dot"></i>
            Occupied: 3,250
          </span>

          <span>
            <i className="available-dot"></i>
            Available: 3,750
          </span>

        </div>

      </div>


      <div className="capacity-table-card">

        <div className="section-heading">

          <div>
            <h2>Site Capacity Assessment</h2>

            <p>
              Current accommodation status of evacuation sites
            </p>
          </div>

          <button className="refresh-button">
            ↻ Refresh
          </button>

        </div>


        <div className="table-container">

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

              <tr>
                <td>
                  <strong>
                    Government Higher Secondary School
                  </strong>
                </td>

                <td>Salem North</td>

                <td>1,500</td>

                <td className="occupied-number">
                  600
                </td>

                <td className="available-number">
                  900
                </td>

                <td>
                  40%
                </td>

                <td>
                  <span className="status-badge available-status">
                    ● Available
                  </span>
                </td>
              </tr>


              <tr>
                <td>
                  <strong>
                    District Community Hall
                  </strong>
                </td>

                <td>Salem Central</td>

                <td>1,000</td>

                <td className="occupied-number">
                  350
                </td>

                <td className="available-number">
                  650
                </td>

                <td>
                  35%
                </td>

                <td>
                  <span className="status-badge available-status">
                    ● Available
                  </span>
                </td>
              </tr>


              <tr>
                <td>
                  <strong>
                    Municipal Sports Complex
                  </strong>
                </td>

                <td>Salem East</td>

                <td>2,000</td>

                <td className="occupied-number">
                  1,600
                </td>

                <td className="available-number">
                  400
                </td>

                <td>
                  80%
                </td>

                <td>
                  <span className="status-badge limited-status">
                    ● Limited
                  </span>
                </td>
              </tr>


              <tr>
                <td>
                  <strong>
                    Government College Campus
                  </strong>
                </td>

                <td>Salem South</td>

                <td>2,500</td>

                <td className="occupied-number">
                  700
                </td>

                <td className="available-number">
                  1,800
                </td>

                <td>
                  28%
                </td>

                <td>
                  <span className="status-badge available-status">
                    ● Available
                  </span>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default CarryingCapacity;