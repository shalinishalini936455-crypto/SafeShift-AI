import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  Marker
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function HazardMap() {
  const hazards = [
    {
      name: "RZ-024",
      type: "Landslide",
      risk: "Critical",
      lat: 11.6643,
      lng: 78.146,
      radius: 900
    },
    {
      name: "RZ-018",
      type: "Flood",
      risk: "High",
      lat: 11.75,
      lng: 78.15,
      radius: 700
    },
    {
      name: "RZ-011",
      type: "Flood",
      risk: "Medium",
      lat: 11.58,
      lng: 78.05,
      radius: 600
    }
  ];

  return (
    <div className="hazard-page">

      <div className="map-header">
        <div>
          <h2>Live Multi-Hazard GIS Map</h2>
          <p>
            Monitor disaster zones, habitations and safe locations
          </p>
        </div>

        <div className="map-live">
          ● LIVE MONITORING
        </div>
      </div>

      <div className="map-layout">

        {/* MAP */}

        <div className="map-container">

          <MapContainer
            center={[11.6643, 78.146]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {hazards.map((hazard) => {

              let color = "#facc15";

              if (hazard.risk === "Critical") {
                color = "#dc2626";
              }

              if (hazard.risk === "High") {
                color = "#f97316";
              }

              return (
                <Circle
                  key={hazard.name}
                  center={[hazard.lat, hazard.lng]}
                  radius={hazard.radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.35
                  }}
                >
                  <Popup>
                    <strong>{hazard.name}</strong>
                    <br />
                    Hazard: {hazard.type}
                    <br />
                    Risk: {hazard.risk}
                    <br />
                    Status: Active
                  </Popup>
                </Circle>
              );
            })}

            <Marker position={[11.70, 78.12]}>
              <Popup>
                <strong>High Risk Habitation</strong>
                <br />
                Population: 1,250
                <br />
                AI Risk Score: 91/100
              </Popup>
            </Marker>

            <Marker position={[11.62, 78.20]}>
              <Popup>
                <strong>Safe Site A</strong>
                <br />
                Capacity: 1,500
                <br />
                Available: 900
              </Popup>
            </Marker>

          </MapContainer>

          {/* MAP LEGEND */}

          <div className="map-legend">

            <h4>Risk Level</h4>

            <div>
              <span className="legend-color critical"></span>
              Critical
            </div>

            <div>
              <span className="legend-color high"></span>
              High
            </div>

            <div>
              <span className="legend-color medium"></span>
              Medium
            </div>

            <div>
              <span className="legend-color safe"></span>
              Safe
            </div>

          </div>

        </div>


        {/* RIGHT PANEL */}

        <div className="map-panel">

          <h3>Map Layers</h3>

          <label>
            <input type="checkbox" defaultChecked />
            Flood Risk
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Landslide Risk
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Coastal Erosion
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Cloudburst
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Red Zones
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            High Risk Habitations
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Vulnerable Population
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Safe Sites
          </label>


          <div className="map-info">

            <h4>Selected Area</h4>

            <p>
              <strong>Zone:</strong> RZ-024
            </p>

            <p>
              <strong>Hazard:</strong> Landslide
            </p>

            <p>
              <strong>Severity:</strong>{" "}
              <span className="critical-text">
                Critical
              </span>
            </p>

            <p>
              <strong>Population:</strong> 1,240
            </p>

            <p>
              <strong>AI Risk Score:</strong> 87/100
            </p>

            <button className="details-btn">
              View Zone Details
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default HazardMap;