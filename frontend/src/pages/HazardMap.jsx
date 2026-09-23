import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Polygon,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { getLiveHazards } from "../services/api";


// ============================================================
// MAP CONTROLLER
// ============================================================

function MapViewController() {

  const map = useMap();

  useEffect(() => {

    map.setView(
      [22.5, 79.0],
      5
    );

  }, [map]);

  return null;
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {

  if (!value) {
    return "Not provided";
  }

  try {

    return new Date(
      value
    ).toLocaleString();

  } catch {

    return value;
  }
}


// ============================================================
// HAZARD COLOR
// ============================================================

function getHazardColor(
  hazardType
) {

  const type = (
    hazardType || ""
  ).toLowerCase();

  if (
    type.includes("flood")
  ) {
    return "#1565c0";
  }

  if (
    type.includes("landslide")
  ) {
    return "#b71c1c";
  }

  if (
    type.includes("cyclone")
  ) {
    return "#6a1b9a";
  }

  if (
    type.includes("thunder")
    || type.includes("lightning")
  ) {
    return "#ef6c00";
  }

  if (
    type.includes("heavy rain")
  ) {
    return "#0277bd";
  }

  if (
    type.includes("rain")
  ) {
    return "#00acc1";
  }

  if (
    type.includes("heat")
  ) {
    return "#e65100";
  }

  if (
    type.includes("cold")
  ) {
    return "#283593";
  }

  if (
    type.includes("earthquake")
  ) {
    return "#4a148c";
  }

  if (
    type.includes("tsunami")
  ) {
    return "#006064";
  }

  if (
    type.includes("cloudburst")
  ) {
    return "#f57c00";
  }

  return "#424242";
}


// ============================================================
// SEVERITY COLOR
// ============================================================

function getSeverityColor(
  severity
) {

  const value = (
    severity || ""
  ).toLowerCase();

  if (
    value.includes("extreme")
  ) {
    return "#b71c1c";
  }

  if (
    value.includes("severe")
  ) {
    return "#d32f2f";
  }

  if (
    value.includes("moderate")
  ) {
    return "#f57c00";
  }

  if (
    value.includes("minor")
  ) {
    return "#388e3c";
  }

  return "#616161";
}


// ============================================================
// POPUP
// ============================================================

function HazardPopup({
  hazard
}) {

  const color =
    getSeverityColor(
      hazard.severity
    );

  return (
    <Popup
      maxWidth={420}
    >

      <div
        style={{
          minWidth: "300px",
          maxWidth: "390px",
          fontFamily:
            "Arial, sans-serif",
        }}
      >

        <h3
          style={{
            marginBottom: "8px",
            color:
              getHazardColor(
                hazard.hazard_type
              ),
          }}
        >
          {hazard.event ||
            hazard.hazard_type ||
            "Hazard Alert"}
        </h3>


        <div
          style={{
            background: color,
            color: "white",
            padding: "5px 8px",
            borderRadius: "5px",
            display: "inline-block",
            marginBottom: "10px",
            fontWeight: "bold",
          }}
        >
          Severity:{" "}
          {hazard.severity ||
            "Unknown"}
        </div>


        <p>
          <strong>
            Hazard Type:
          </strong>{" "}
          {hazard.hazard_type ||
            "Unknown"}
        </p>


        <p>
          <strong>
            Urgency:
          </strong>{" "}
          {hazard.urgency ||
            "Unknown"}
        </p>


        <p>
          <strong>
            Certainty:
          </strong>{" "}
          {hazard.certainty ||
            "Unknown"}
        </p>


        <p>
          <strong>
            Headline:
          </strong>{" "}
          {hazard.headline ||
            "Not provided"}
        </p>


        <p>
          <strong>
            Affected Areas:
          </strong>
        </p>

        <div
          style={{
            maxHeight: "100px",
            overflowY: "auto",
            background: "#f5f5f5",
            padding: "6px",
            borderRadius: "4px",
          }}
        >

          {hazard.affected_districts
            ?.length > 0
            ? hazard.affected_districts.join(
                ", "
              )
            : "Not provided"}

        </div>


        {hazard.description && (
          <p>
            <strong>
              Description:
            </strong>{" "}
            {hazard.description}
          </p>
        )}


        {hazard.instruction && (
          <p>
            <strong>
              Official Instruction:
            </strong>{" "}
            {hazard.instruction}
          </p>
        )}


        <hr />


        <p>
          <strong>
            Effective:
          </strong>{" "}
          {formatDate(
            hazard.effective
          )}
        </p>


        <p>
          <strong>
            Onset:
          </strong>{" "}
          {formatDate(
            hazard.onset
          )}
        </p>


        <p>
          <strong>
            Expires:
          </strong>{" "}
          {formatDate(
            hazard.expires
          )}
        </p>


        <p>
          <strong>
            Map Source:
          </strong>{" "}
          {hazard.mapping_method ||
            "Unknown"}
        </p>


        <p>
          <strong>
            Data Source:
          </strong>{" "}
          NDMA SACHET
        </p>


        {hazard.source_url && (
          <a
            href={
              hazard.source_url
            }
            target="_blank"
            rel="noreferrer"
          >
            View Official SACHET Alert
          </a>
        )}

      </div>

    </Popup>
  );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function HazardMap() {

  const [
    hazards,
    setHazards
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated
  ] = useState(null);


  // ==========================================================
  // FETCH LIVE DATA
  // ==========================================================

  const loadHazards =
    async () => {

      try {

        setError("");

        const response =
          await getLiveHazards();

        console.log(
          "LIVE SACHET RESPONSE:",
          response.data
        );

        const data =
          response.data;

        const alerts =
          data?.alerts || [];

        setHazards(
          alerts
        );

        setLastUpdated(
          new Date()
        );

      } catch (err) {

        console.error(
          "SACHET ERROR:",
          err
        );

        setError(
          "Unable to load live NDMA SACHET alerts."
        );

      } finally {

        setLoading(false);
      }
    };


  // ==========================================================
  // INITIAL LOAD + 5 MINUTE REFRESH
  // ==========================================================

  useEffect(() => {

    loadHazards();

    const interval =
      setInterval(
        loadHazards,
        5 * 60 * 1000
      );

    return () => {
      clearInterval(
        interval
      );
    };

  }, []);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const activeAlertCount =
    hazards.length;


  const mappedAlertCount =
    hazards.filter(
      hazard =>
        hazard.locations &&
        hazard.locations.length > 0
    ).length;


  const unmappedAlertCount =
    hazards.filter(
      hazard =>
        !hazard.locations ||
        hazard.locations.length === 0
    ).length;


  const mapLocations =
    hazards.flatMap(
      hazard =>
        (hazard.locations || [])
          .map(location => ({
            ...location,
            hazard,
          }))
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      style={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 80px)",
        minHeight: "650px",
      }}
    >

      {/* =====================================================
          MAP
      ====================================================== */}

      <MapContainer
        center={[
          22.5,
          79.0
        ]}
        zoom={5}
        style={{
          width: "100%",
          height: "100%",
        }}
      >

        <MapViewController />


        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* ===================================================
            ALL LIVE HAZARDS
        ==================================================== */}

        {mapLocations.map(
          (location, index) => {

            const hazard =
              location.hazard;

            const color =
              getHazardColor(
                hazard.hazard_type
              );


            // =================================================
            // CAP POLYGON
            // =================================================

            if (
              location.location_type ===
                "sachet_cap_polygon"
              &&
              location.polygon
            ) {

              return (

                <Polygon
                  key={
                    `${hazard.id}-polygon-${index}`
                  }

                  positions={
                    location.polygon
                  }

                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.25,
                    weight: 2,
                  }}
                >

                  <HazardPopup
                    hazard={
                      hazard
                    }
                  />

                </Polygon>
              );
            }


            // =================================================
            // CAP CIRCLE
            // =================================================

            if (
              location.location_type ===
                "sachet_cap_circle"
              &&
              location.latitude != null
              &&
              location.longitude != null
            ) {

              return (

                <Circle
                  key={
                    `${hazard.id}-circle-${index}`
                  }

                  center={[
                    location.latitude,
                    location.longitude
                  ]}

                  radius={
                    location.radius_meters ||
                    5000
                  }

                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.25,
                    weight: 2,
                  }}
                >

                  <HazardPopup
                    hazard={
                      hazard
                    }
                  />

                </Circle>
              );
            }


            // =================================================
            // DISTRICT FALLBACK
            // =================================================

            if (
              location.latitude != null
              &&
              location.longitude != null
            ) {

              return (

                <CircleMarker
                  key={
                    `${hazard.id}-district-${index}`
                  }

                  center={[
                    location.latitude,
                    location.longitude
                  ]}

                  radius={9}

                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.75,
                    weight: 2,
                  }}
                >

                  <HazardPopup
                    hazard={
                      hazard
                    }
                  />

                </CircleMarker>
              );
            }


            return null;
          }
        )}

      </MapContainer>


      {/* =====================================================
          TOP STATUS
      ====================================================== */}

      <div
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          zIndex: 1000,
          background: "white",
          padding: "12px 16px",
          borderRadius: "8px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >

        <strong>
          NDMA SACHET LIVE HAZARDS
        </strong>

        <div
          style={{
            marginTop: "5px",
            fontSize: "13px",
          }}
        >

          Active Alerts:{" "}
          <strong>
            {activeAlertCount}
          </strong>

        </div>


        <div
          style={{
            fontSize: "13px",
          }}
        >

          Mapped Alerts:{" "}
          <strong>
            {mappedAlertCount}
          </strong>

        </div>


        <div
          style={{
            fontSize: "13px",
          }}
        >

          Unmapped Alerts:{" "}
          <strong>
            {unmappedAlertCount}
          </strong>

        </div>


        <div
          style={{
            fontSize: "11px",
            marginTop: "5px",
            color: "#555",
          }}
        >

          Source: NDMA SACHET

        </div>


        {lastUpdated && (

          <div
            style={{
              fontSize: "11px",
              color: "#555",
            }}
          >

            Updated:{" "}
            {lastUpdated.toLocaleTimeString()}

          </div>

        )}

      </div>


      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (

        <div
          style={{
            position: "absolute",
            top: "90px",
            left: "50%",
            transform:
              "translateX(-50%)",
            zIndex: 1000,
            background: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >

          Loading live SACHET alerts...

        </div>

      )}


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div
          style={{
            position: "absolute",
            top: "90px",
            left: "50%",
            transform:
              "translateX(-50%)",
            zIndex: 1000,
            background: "#ffebee",
            color: "#b71c1c",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >

          {error}

        </div>

      )}


      {/* =====================================================
          UNMAPPED ALERT PANEL
      ====================================================== */}

      {unmappedAlertCount > 0 && (

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            zIndex: 1000,
            width: "350px",
            maxHeight: "260px",
            overflowY: "auto",
            background: "white",
            padding: "12px",
            borderRadius: "8px",
            boxShadow:
              "0 2px 12px rgba(0,0,0,0.25)",
          }}
        >

          <strong>
            Active alerts without map geometry
          </strong>


          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "4px",
              marginBottom: "8px",
            }}
          >

            These alerts are still real SACHET
            alerts. They are not removed just
            because SafeShift does not yet have
            coordinates for them.

          </div>


          {hazards
            .filter(
              hazard =>
                !hazard.locations ||
                hazard.locations.length === 0
            )
            .map(
              (hazard, index) => (

                <div
                  key={
                    `${hazard.id}-unmapped`
                  }

                  style={{
                    borderTop:
                      index === 0
                        ? "none"
                        : "1px solid #ddd",

                    padding:
                      "7px 0",
                  }}
                >

                  <strong>
                    {hazard.event}
                  </strong>


                  <div
                    style={{
                      fontSize: "12px",
                    }}
                  >

                    {hazard.affected_districts
                      ?.join(", ") ||
                      "Area not provided"}

                  </div>


                  <div
                    style={{
                      fontSize: "11px",
                      color: "#777",
                    }}
                  >

                    Severity:{" "}
                    {hazard.severity ||
                      "Unknown"}

                  </div>

                </div>

              )
            )}

        </div>

      )}

    </div>
  );
}