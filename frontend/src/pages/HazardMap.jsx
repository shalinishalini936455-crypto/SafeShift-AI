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
import Icon from "../components/Icons";


// ============================================================
// SETTINGS
// ============================================================

// Frosted-glass look for the white overlay panels
const FROST = {
  background: "rgba(255, 255, 255, 0.78)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255, 255, 255, 0.65)",
};


// ============================================================
// MAP CONTROLLER
// ============================================================

function MapViewController() {
  const map = useMap();

  useEffect(() => {
    map.setView([22.5, 79.0], 5);
  }, [map]);

  return null;
}


// ============================================================
// HELPERS
// ============================================================

function formatDate(value) {
  if (!value) return "Not provided";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function getHazardColor(hazardType) {
  const type = (hazardType || "").toLowerCase();

  if (type.includes("flood")) return "#1565c0";
  if (type.includes("landslide")) return "#b71c1c";
  if (type.includes("cyclone")) return "#6a1b9a";
  if (type.includes("thunder") || type.includes("lightning")) return "#ef6c00";
  if (type.includes("heavy rain")) return "#0277bd";
  if (type.includes("rain")) return "#00acc1";
  if (type.includes("heat")) return "#e65100";
  if (type.includes("cold")) return "#283593";
  if (type.includes("earthquake")) return "#4a148c";
  if (type.includes("tsunami")) return "#006064";
  if (type.includes("cloudburst")) return "#f57c00";

  return "#424242";
}

function getSeverityColor(severity) {
  const value = (severity || "").toLowerCase();

  if (value.includes("extreme")) return "#b71c1c";
  if (value.includes("severe")) return "#d32f2f";
  if (value.includes("moderate")) return "#f57c00";
  if (value.includes("minor")) return "#388e3c";

  return "#616161";
}


// ============================================================
// HAZARD POPUP
// ============================================================

function HazardPopup({ hazard }) {
  const color = getSeverityColor(hazard.severity);

  return (
    <Popup maxWidth={420}>
      <div style={{ minWidth: "300px", maxWidth: "390px", fontFamily: "Arial, sans-serif" }}>

        <h3 style={{ marginBottom: "8px", color: getHazardColor(hazard.hazard_type) }}>
          {hazard.event || hazard.hazard_type || "Hazard Alert"}
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
          Severity: {hazard.severity || "Unknown"}
        </div>

        <p><strong>Hazard Type:</strong> {hazard.hazard_type || "Unknown"}</p>
        <p><strong>Urgency:</strong> {hazard.urgency || "Unknown"}</p>
        <p><strong>Certainty:</strong> {hazard.certainty || "Unknown"}</p>
        <p><strong>Headline:</strong> {hazard.headline || "Not provided"}</p>

        <p><strong>Affected Areas:</strong></p>

        <div
          style={{
            maxHeight: "100px",
            overflowY: "auto",
            background: "#f5f5f5",
            padding: "6px",
            borderRadius: "4px",
          }}
        >
          {hazard.affected_districts?.length > 0
            ? hazard.affected_districts.join(", ")
            : "Not provided"}
        </div>

        {hazard.description && (
          <p><strong>Description:</strong> {hazard.description}</p>
        )}

        {hazard.instruction && (
          <p><strong>Official Instruction:</strong> {hazard.instruction}</p>
        )}

        <hr />

        <p><strong>Effective:</strong> {formatDate(hazard.effective)}</p>
        <p><strong>Onset:</strong> {formatDate(hazard.onset)}</p>
        <p><strong>Expires:</strong> {formatDate(hazard.expires)}</p>
        <p><strong>Map Source:</strong> {hazard.mapping_method || "Unknown"}</p>
        <p><strong>Data Source:</strong> NDMA SACHET</p>

        {hazard.source_url && (
          <a href={hazard.source_url} target="_blank" rel="noreferrer">
            View Official SACHET Alert
          </a>
        )}

      </div>
    </Popup>
  );
}


// ============================================================
// MAIN COMPONENT
//   <HazardMap />          full page (map + legend)
//   <HazardMap compact />  map only, for the dashboard card
// ============================================================

export default function HazardMap({ compact = false }) {

  // ---------- live hazard state ----------
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);


  // ---------- fetch live SACHET data ----------
  const loadHazards = async () => {
    try {
      setError("");

      const response = await getLiveHazards();
      const data = response.data;

      setHazards(data?.alerts || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("SACHET ERROR:", err);
      setError("Unable to load live NDMA SACHET alerts.");
    } finally {
      setLoading(false);
    }
  };


  // ---------- initial load ----------
  useEffect(() => {
    loadHazards();
    const hazardInterval = setInterval(loadHazards, 5 * 60 * 1000);

    return () => {
      clearInterval(hazardInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);


  // ---------- statistics ----------
  const activeAlertCount = hazards.length;

  const mappedAlertCount = hazards.filter(
    (h) => h.locations && h.locations.length > 0
  ).length;

  const unmappedAlertCount = hazards.filter(
    (h) => !h.locations || h.locations.length === 0
  ).length;

  const mapLocations = hazards.flatMap((hazard) =>
    (hazard.locations || []).map((location) => ({ ...location, hazard }))
  );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: compact ? "100%" : "calc(100vh - 110px)",
        minHeight: compact ? "480px" : "650px",
        overflow: "hidden",
        borderRadius: compact ? "0" : "18px",
        color: "#1f2937", // dark text for the white/frosted panels
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >

      {/* ================= MAP ================= */}

      <MapContainer
        center={[22.5, 79.0]}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
      >
        <MapViewController />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapLocations.map((location, index) => {
          const hazard = location.hazard;
          const color = getHazardColor(hazard.hazard_type);

          // CAP polygon
          if (location.location_type === "sachet_cap_polygon" && location.polygon) {
            return (
              <Polygon
                key={`${hazard.id}-polygon-${index}`}
                positions={location.polygon}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }}
              >
                <HazardPopup hazard={hazard} />
              </Polygon>
            );
          }

          // CAP circle
          if (
            location.location_type === "sachet_cap_circle" &&
            location.latitude != null &&
            location.longitude != null
          ) {
            return (
              <Circle
                key={`${hazard.id}-circle-${index}`}
                center={[location.latitude, location.longitude]}
                radius={location.radius_meters || 5000}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }}
              >
                <HazardPopup hazard={hazard} />
              </Circle>
            );
          }

          // district fallback
          if (location.latitude != null && location.longitude != null) {
            return (
              <CircleMarker
                key={`${hazard.id}-district-${index}`}
                center={[location.latitude, location.longitude]}
                radius={9}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.75, weight: 2 }}
              >
                <HazardPopup hazard={hazard} />
              </CircleMarker>
            );
          }

          return null;
        })}
      </MapContainer>


      {/* ================= EVERYTHING BELOW IS HIDDEN IN COMPACT MODE ================= */}

      {!compact && (
        <>

          {/* ---------- TITLE + LIVE STATUS (single merged panel) ---------- */}

          <div
            style={{
              ...FROST,
              position: "absolute",
              top: "16px",
              left: "16px",
              zIndex: 1000,
              width: "290px",
              maxWidth: "calc(100vw - 32px)",
              borderRadius: "14px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px 12px",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              >
                Live Hazard Map
              </h2>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "12px",
                  color: "#6b7280",
                  lineHeight: 1.4,
                }}
              >
                Real-time hazard tracking across monitored regions
              </p>
            </div>

            <div style={{ padding: "12px 16px 14px" }}>
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                NDMA SACHET LIVE HAZARDS
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: "8px", padding: "7px 9px" }}>
                  <div style={{ fontSize: "9.5px", color: "#6b7280" }}>ACTIVE</div>
                  <strong style={{ fontSize: "16px" }}>{activeAlertCount}</strong>
                </div>

                <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: "8px", padding: "7px 9px" }}>
                  <div style={{ fontSize: "9.5px", color: "#6b7280" }}>MAPPED</div>
                  <strong style={{ fontSize: "16px" }}>{mappedAlertCount}</strong>
                </div>

                <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: "8px", padding: "7px 9px" }}>
                  <div style={{ fontSize: "9.5px", color: "#6b7280" }}>UNMAPPED</div>
                  <strong style={{ fontSize: "16px" }}>{unmappedAlertCount}</strong>
                </div>

                <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: "8px", padding: "7px 9px" }}>
                  <div style={{ fontSize: "9.5px", color: "#6b7280" }}>SOURCE</div>
                  <strong style={{ fontSize: "11px" }}>SACHET</strong>
                </div>
              </div>

              {lastUpdated && (
                <div style={{ fontSize: "10.5px", color: "#9ca3af" }}>
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>


          {/* ---------- LOADING / ERROR (stacked, never overlapping) ---------- */}

          {loading && (
            <div
              style={{
                ...FROST,
                position: "absolute",
                top: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                padding: "9px 18px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                fontSize: "13px",
              }}
            >
              Loading live SACHET alerts...
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                background: "#ffebee",
                color: "#b71c1c",
                padding: "9px 18px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}


          {/* ---------- UNMAPPED ALERTS ---------- */}

          {unmappedAlertCount > 0 && (
            <div
              style={{
                ...FROST,
                position: "absolute",
                bottom: "16px",
                left: "16px",
                zIndex: 900,
                width: "320px",
                maxWidth: "calc(100vw - 32px)",
                maxHeight: "240px",
                overflowY: "auto",
                padding: "14px",
                borderRadius: "14px",
                boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
              }}
            >
              <strong style={{ fontSize: "13px" }}>Active alerts without map geometry</strong>

              <div
                style={{
                  fontSize: "11.5px",
                  color: "#6b7280",
                  marginTop: "4px",
                  marginBottom: "8px",
                  lineHeight: 1.4,
                }}
              >
                These alerts are still real SACHET alerts. They are not removed
                just because SafeShift does not yet have coordinates for them.
              </div>

              {hazards
                .filter((h) => !h.locations || h.locations.length === 0)
                .map((hazard, index) => (
                  <div
                    key={`${hazard.id ?? "no-id"}-unmapped-${index}`}
                    style={{
                      borderTop: index === 0 ? "none" : "1px solid rgba(0,0,0,0.08)",
                      padding: "7px 0",
                    }}
                  >
                    <strong style={{ fontSize: "12.5px" }}>{hazard.event}</strong>

                    <div style={{ fontSize: "12px" }}>
                      {hazard.affected_districts?.join(", ") || "Area not provided"}
                    </div>

                    <div style={{ fontSize: "11px", color: "#6b7280" }}>
                      Severity: {hazard.severity || "Unknown"}
                    </div>
                  </div>
                ))}
            </div>
          )}


          {/* ---------- MAP LEGEND ---------- */}

          <div
            style={{
              ...FROST,
              position: "absolute",
              right: "16px",
              bottom: "16px",
              zIndex: 800,
              padding: "10px 14px",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
              fontSize: "11px",
            }}
          >
            <strong>Map Legend</strong>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
              <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#1565c0", display: "inline-block" }} />
              Live Hazard
            </div>
          </div>

        </>
      )}

    </div>
  );
}
