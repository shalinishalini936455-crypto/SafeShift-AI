import { useState } from "react";

import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  Marker
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function HazardMap() {

  // =====================================================
  // HAZARD DATA
  // =====================================================

  const hazards = [
    {
      id: "RZ-024",
      name: "RZ-024",
      type: "Landslide",
      risk: "Critical",
      lat: 11.6643,
      lng: 78.1460,
      radius: 900,
      population: 1240,
      score: 87
    },

    {
      id: "RZ-018",
      name: "RZ-018",
      type: "Flood",
      risk: "High",
      lat: 11.7500,
      lng: 78.1500,
      radius: 700,
      population: 850,
      score: 78
    },

    {
      id: "RZ-011",
      name: "RZ-011",
      type: "Flood",
      risk: "Medium",
      lat: 11.5800,
      lng: 78.0500,
      radius: 600,
      population: 620,
      score: 65
    },

    // Prototype coastal erosion zone
    {
      id: "RZ-031",
      name: "RZ-031",
      type: "Coastal Erosion",
      risk: "High",
      lat: 11.6200,
      lng: 78.1800,
      radius: 500,
      population: 430,
      score: 72
    },

    // Prototype cloudburst zone
    {
      id: "RZ-042",
      name: "RZ-042",
      type: "Cloudburst",
      risk: "Critical",
      lat: 11.7000,
      lng: 78.0800,
      radius: 450,
      population: 310,
      score: 82
    }
  ];


  // =====================================================
  // LAYER STATE
  // =====================================================

  const [layers, setLayers] = useState({
    Flood: true,
    Landslide: true,
    "Coastal Erosion": true,
    Cloudburst: true,
    "Red Zones": true,
    Habitations: true,
    Population: true,
    SafeSites: true
  });


  // =====================================================
  // TOGGLE LAYER
  // =====================================================

  const toggleLayer = (layer) => {

    setLayers((previous) => ({
      ...previous,
      [layer]: !previous[layer]
    }));

  };


  // =====================================================
  // FILTER HAZARDS
  // =====================================================

  const visibleHazards = hazards.filter((hazard) => {

    if (!layers["Red Zones"]) {
      return false;
    }

    if (hazard.type === "Flood" && layers.Flood) {
      return true;
    }

    if (
      hazard.type === "Landslide" &&
      layers.Landslide
    ) {
      return true;
    }

    if (
      hazard.type === "Coastal Erosion" &&
      layers["Coastal Erosion"]
    ) {
      return true;
    }

    if (
      hazard.type === "Cloudburst" &&
      layers.Cloudburst
    ) {
      return true;
    }

    return false;

  });


  // =====================================================
  // HAZARD COLOR
  // =====================================================

  const getHazardColor = (hazard) => {

    if (hazard.type === "Landslide") {
      return "#dc2626";
    }

    if (hazard.type === "Flood") {
      return "#2563eb";
    }

    if (hazard.type === "Coastal Erosion") {
      return "#9333ea";
    }

    if (hazard.type === "Cloudburst") {
      return "#f97316";
    }

    return "#dc2626";

  };


  return (

    <div className="hazard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="map-header">

        <div>

          <h2>Live Multi-Hazard GIS Map</h2>

          <p>
            Monitor disaster zones, habitations and safe
            locations
          </p>

        </div>


        <div className="map-live">
          ● LIVE MONITORING
        </div>

      </div>


      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="map-layout">


        {/* =================================================
            MAP
        ================================================= */}

        <div className="map-container">

          <MapContainer

            center={[
              11.6643,
              78.1460
            ]}

            zoom={10}

            style={{
              height: "100%",
              width: "100%"
            }}

          >


            {/* OPEN STREET MAP */}

            <TileLayer

              attribution="&copy; OpenStreetMap contributors"

              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

            />


            {/* =================================================
                HAZARD ZONES
            ================================================= */}

            {visibleHazards.map((hazard) => {

              const color =
                getHazardColor(hazard);

              return (

                <Circle

                  key={hazard.id}

                  center={[
                    hazard.lat,
                    hazard.lng
                  ]}

                  radius={hazard.radius}

                  pathOptions={{

                    color: color,

                    fillColor: color,

                    fillOpacity: 0.50,

                    opacity: 1,

                    weight: 5

                  }}

                >

                  <Popup>

                    <div>

                      <h3>
                        {hazard.name}
                      </h3>

                      <p>
                        <strong>
                          Hazard:
                        </strong>{" "}
                        {hazard.type}
                      </p>

                      <p>
                        <strong>
                          Risk:
                        </strong>{" "}
                        {hazard.risk}
                      </p>

                      <p>
                        <strong>
                          Population:
                        </strong>{" "}
                        {hazard.population}
                      </p>

                      <p>
                        <strong>
                          AI Risk Score:
                        </strong>{" "}
                        {hazard.score}/100
                      </p>

                      <p>
                        <strong>
                          Status:
                        </strong>{" "}
                        Active
                      </p>

                    </div>

                  </Popup>

                </Circle>

              );

            })}


            {/* =================================================
                HIGH RISK HABITATION
            ================================================= */}

            {layers.Habitations && (

              <Marker
                position={[
                  11.7000,
                  78.1200
                ]}
              >

                <Popup>

                  <strong>
                    High Risk Habitation
                  </strong>

                  <br />

                  Village A

                  <br />

                  Population: 1,240

                  <br />

                  AI Risk Score: 87/100

                </Popup>

              </Marker>

            )}


            {/* =================================================
                SAFE SITE
            ================================================= */}

            {layers.SafeSites && (

              <Marker
                position={[
                  11.6200,
                  78.2000
                ]}
              >

                <Popup>

                  <strong>
                    Safe Site A
                  </strong>

                  <br />

                  Capacity: 1,500

                  <br />

                  Available: 900

                </Popup>

              </Marker>

            )}

          </MapContainer>


          {/* =================================================
              MAP LEGEND
          ================================================= */}

          <div className="map-legend">

            <h4>
              Hazard / Risk
            </h4>


            <div>
              <span
                className="legend-color critical"
              ></span>

              Landslide / Critical
            </div>


            <div>
              <span
                className="legend-color high"
              ></span>

              Flood / High
            </div>


            <div>
              <span
                className="legend-color medium"
              ></span>

              Flood / Medium
            </div>


            <div>
              <span
                className="legend-color safe"
              ></span>

              Safe Site
            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT PANEL
        ================================================= */}

        <div className="map-panel">


          <h3>
            Map Layers
          </h3>


          {/* FLOOD */}

          <label>

            <input

              type="checkbox"

              checked={layers.Flood}

              onChange={() =>
                toggleLayer("Flood")
              }

            />

            Flood Risk

          </label>


          {/* LANDSLIDE */}

          <label>

            <input

              type="checkbox"

              checked={layers.Landslide}

              onChange={() =>
                toggleLayer("Landslide")
              }

            />

            Landslide Risk

          </label>


          {/* COASTAL EROSION */}

          <label>

            <input

              type="checkbox"

              checked={
                layers["Coastal Erosion"]
              }

              onChange={() =>
                toggleLayer("Coastal Erosion")
              }

            />

            Coastal Erosion

          </label>


          {/* CLOUDBURST */}

          <label>

            <input

              type="checkbox"

              checked={layers.Cloudburst}

              onChange={() =>
                toggleLayer("Cloudburst")
              }

            />

            Cloudburst

          </label>


          {/* RED ZONES */}

          <label>

            <input

              type="checkbox"

              checked={layers["Red Zones"]}

              onChange={() =>
                toggleLayer("Red Zones")
              }

            />

            Red Zones

          </label>


          {/* HIGH RISK HABITATIONS */}

          <label>

            <input

              type="checkbox"

              checked={layers.Habitations}

              onChange={() =>
                toggleLayer("Habitations")
              }

            />

            High Risk Habitations

          </label>


          {/* VULNERABLE POPULATION */}

          <label>

            <input

              type="checkbox"

              checked={layers.Population}

              onChange={() =>
                toggleLayer("Population")
              }

            />

            Vulnerable Population

          </label>


          {/* SAFE SITES */}

          <label>

            <input

              type="checkbox"

              checked={layers.SafeSites}

              onChange={() =>
                toggleLayer("SafeSites")
              }

            />

            Safe Sites

          </label>


          {/* =================================================
              SELECTED AREA
          ================================================= */}

          <div className="map-info">

            <h4>
              Selected Area
            </h4>


            <p>

              <strong>
                Zone:
              </strong>{" "}

              RZ-024

            </p>


            <p>

              <strong>
                Hazard:
              </strong>{" "}

              Landslide

            </p>


            <p>

              <strong>
                Severity:
              </strong>{" "}

              <span className="critical-text">
                Critical
              </span>

            </p>


            <p>

              <strong>
                Population:
              </strong>{" "}

              1,240

            </p>


            <p>

              <strong>
                AI Risk Score:
              </strong>{" "}

              87/100

            </p>


            <button
              className="details-btn"
              onClick={() =>
                alert(
                  "RZ-024: Landslide Critical Zone"
                )
              }
            >

              View Zone Details

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default HazardMap;