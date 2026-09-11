import { useState } from "react";

function Habitations() {
  const [selected, setSelected] = useState(null);

  const habitations = [
    {
      id: "HAB-101",
      name: "Hill View Colony",
      hazard: "Landslide",
      population: 1250,
      riskScore: 91,
      risk: "Critical"
    },
    {
      id: "HAB-102",
      name: "River Bank Area",
      hazard: "Flood",
      population: 980,
      riskScore: 84,
      risk: "High"
    },
    {
      id: "HAB-103",
      name: "Green Valley",
      hazard: "Flood",
      population: 760,
      riskScore: 68,
      risk: "Medium"
    }
  ];

  return (
    <div style={{ padding: "30px" }}>

      <h1>High Risk Habitations</h1>

      <p>
        Monitor settlements and prioritize people at risk
      </p>

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
          <h2>48</h2>
        </div>

        <div className="summary-card">
          <h3>Critical Risk</h3>
          <h2>12</h2>
        </div>

        <div className="summary-card">
          <h3>High Risk</h3>
          <h2>18</h2>
        </div>

      </div>


      <div className="table-card">

        <h2>Risk Assessment</h2>

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Habitation</th>
              <th>Hazard</th>
              <th>Population</th>
              <th>Risk Score</th>
              <th>Risk</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {habitations.map((item) => (
              <tr key={item.id}>

                <td>{item.id}</td>

                <td>
                  <strong>{item.name}</strong>
                </td>

                <td>{item.hazard}</td>

                <td>
                  {item.population}
                </td>

                <td>
                  {item.riskScore}/100
                </td>

                <td>
                  {item.risk}
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

      </div>


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
            Hazard: {selected.hazard}
          </p>

          <p>
            Population: {selected.population}
          </p>

          <p>
            AI Risk Score: {selected.riskScore}/100
          </p>

          <p>
            Risk Level: {selected.risk}
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