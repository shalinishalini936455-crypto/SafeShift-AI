import { useEffect, useState } from "react";
import { getHabitations } from "../services/api";

function Habitations() {
  const [selected, setSelected] = useState(null);
  const [habitations, setHabitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHabitations()
      .then((response) => {
        console.log("Habitations API:", response.data);
        setHabitations(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Habitations API Error:", error);
        setError("Unable to load habitation data");
        setLoading(false);
      });
  }, []);

  const totalHabitations = habitations.length;

  const criticalRisk = habitations.filter(
    (item) => item.risk_level === "Critical"
  ).length;

  const highRisk = habitations.filter(
    (item) => item.risk_level === "High"
  ).length;

  return (
    <div style={{ padding: "30px" }}>

      <h1>High Risk Habitations</h1>

      <p>
        Monitor settlements and prioritize people at risk
      </p>

      {/* Summary Cards */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "25px",
          marginBottom: "30px"
        }}
      >

        <div className="summary-card">
          <h3>Total Habitations</h3>
          <h2>{loading ? "..." : totalHabitations}</h2>
        </div>

        <div className="summary-card">
          <h3>Critical Risk</h3>
          <h2>{loading ? "..." : criticalRisk}</h2>
        </div>

        <div className="summary-card">
          <h3>High Risk</h3>
          <h2>{loading ? "..." : highRisk}</h2>
        </div>

      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <div className="table-card">

        <h2>Risk Assessment</h2>

        {loading ? (
          <p>Loading habitation data...</p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Habitation</th>
                <th>District</th>
                <th>Population</th>
                <th>Risk Score</th>
                <th>Risk</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {habitations.map((item) => (
                <tr key={item.id}>

                  <td>
                    HAB-{item.id}
                  </td>

                  <td>
                    <strong>{item.name}</strong>
                  </td>

                  <td>
                    {item.district}
                  </td>

                  <td>
                    {item.population}
                  </td>

                  <td>
                    Not available
                  </td>

                  <td>
                    {item.risk_level}
                  </td>

                  <td>

                    <button
                      onClick={() => setSelected(item)}
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

      {/* Details */}
      {selected && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            background: "white",
            borderRadius: "10px"
          }}
        >

          <h2>{selected.name}</h2>

          <p>
            District: {selected.district}
          </p>

          <p>
            Population: {selected.population}
          </p>

          <p>
            Latitude: {selected.latitude}
          </p>

          <p>
            Longitude: {selected.longitude}
          </p>

          <p>
            Risk Level: {selected.risk_level}
          </p>

          <button onClick={() => setSelected(null)}>
            Close
          </button>

        </div>
      )}

    </div>
  );
}

export default Habitations;