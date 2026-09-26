import { useState, useEffect, useCallback } from "react";

// The Flask wrapper around sachet_service.py (see api_server.py).
// Change this if you run the API server on a different host/port.
const ALERTS_API_URL = "http://localhost:8010/api/alerts";

// Poll for new alerts every 2 minutes (the API itself caches
// upstream SACHET fetches for 2 minutes, so this stays in sync
// without hammering either server).
const POLL_INTERVAL_MS = 120000;

// CAP severity (Extreme/Severe/Moderate/Minor/Unknown) mapped
// to the badge levels this UI already knows how to color.
function mapCapSeverity(capSeverity) {
  switch ((capSeverity || "").toLowerCase()) {
    case "extreme":
      return "Critical";
    case "severe":
      return "High";
    case "moderate":
      return "Moderate";
    case "minor":
      return "Low";
    default:
      return "Unknown";
  }
}

function formatAlertDate(isoString) {
  if (!isoString) return "Time not published";

  try {
    return new Date(isoString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

// Convert one SACHET alert object (as returned by
// fetch_sachet_alerts() in sachet_service.py) into the shape
// this component's cards and modal already render.
function mapAlertToReport(alert, index) {
  const districts =
    alert.affected_districts && alert.affected_districts.length
      ? alert.affected_districts
          .map((d) => d.replace(/\b\w/g, (c) => c.toUpperCase()))
          .join(", ")
      : "District not specified in alert";

  return {
    id: alert.identifier || `SACHET-${index}`,
    habitation: districts,
    hazard: alert.hazard_type || "Other",
    severity: mapCapSeverity(alert.severity),
    population: "Not published in alert",
    verification: alert.status === "Actual" ? "Completed" : "Pending",
    condition:
      alert.headline || alert.description || alert.event || "No description published.",
    recommendation:
      alert.instruction ||
      "No specific instruction published with this alert; monitor official SACHET updates.",
    officer: alert.sender_name || alert.sender || "NDMA SACHET",
    date: formatAlertDate(alert.sent),
  };
}

function FieldReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const loadAlerts = useCallback(async () => {
    try {
      const response = await fetch(ALERTS_API_URL);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Respect the service's own rule: if SACHET has no active
      // alert, this is an empty list — never a fake one.
      const mapped = (data.alerts || []).map(mapAlertToReport);

      setReports(mapped);
      setLastFetched(new Date());
      setError(null);
    } catch (err) {
      setError(
        err.message ||
          "Could not reach the SACHET alert service. Is api_server.py running on port 8000?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(loadAlerts, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadAlerts]);

  const [selectedReport, setSelectedReport] = useState(null);

  const verifiedReports = reports.filter(
    (report) => report.verification === "Completed"
  ).length;

  const pendingReports = reports.filter(
    (report) => report.verification === "Pending"
  ).length;

  const criticalReports = reports.filter(
    (report) => report.severity === "Critical"
  ).length;

  const acknowledgeAlert = (id) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === id
          ? {
              ...report,
              verification: "Completed",
            }
          : report
      )
    );
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          

          <h1 style={styles.title}>Field Data Collection</h1>

          <p style={styles.subtitle}>
            Live pan-India hazard alerts pulled from the NDMA SACHET feed.
          </p>
        </div>

        <div style={styles.live}>
          <span>●</span> LIVE SACHET FEED
        </div>
      </div>

      {/* DATA SOURCE NOTE */}
      <div style={styles.demo}>
        {loading
          ? "LOADING LIVE ALERTS FROM SACHET…"
          : error
          ? `COULD NOT LOAD LIVE DATA — ${error}`
          : `LIVE DATA — NDMA SACHET (PAN-INDIA)${
              lastFetched ? ` · UPDATED ${lastFetched.toLocaleTimeString("en-IN")}` : ""
            }`}
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.cards}>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Reports</p>

          <h2 style={styles.cardNumber}>
            {reports.length}
          </h2>

          <p style={styles.cardText}>
            Field reports received
          </p>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Acknowledged Alerts</p>

          <h2 style={styles.cardNumber}>
            {verifiedReports}
          </h2>

          <p style={styles.cardText}>
            Reviewed by an officer
          </p>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Awaiting Acknowledgement</p>

          <h2 style={styles.cardNumber}>
            {pendingReports}
          </h2>

          <p style={styles.cardText}>
            Not yet reviewed
          </p>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Critical Reports</p>

          <h2 style={styles.cardNumber}>
            {criticalReports}
          </h2>

          <p style={styles.cardText}>
            Require immediate attention
          </p>
        </div>

      </div>

      {/* REPORT SECTION */}
      <div style={styles.section}>

        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Live SACHET Alerts
            </h2>

            <p style={styles.sectionSubtitle}>
              Active hazard alerts pulled directly from the NDMA SACHET CAP feed.
            </p>
          </div>

          <div style={styles.reportCount}>
            {reports.length} Reports
          </div>
        </div>

        {!loading && !error && reports.length === 0 && (
          <p style={styles.sectionSubtitle}>
            SACHET currently reports no active alerts. Nothing is shown here
            because this dashboard never fabricates hazards.
          </p>
        )}

        {/* REPORTS */}
        {reports.map((report) => (

          <div key={report.id} style={styles.report}>

            {/* REPORT ICON */}
            <div style={styles.reportIcon}>
              📋
            </div>

            {/* MAIN INFORMATION */}
            <div style={styles.info}>

              <div style={styles.titleRow}>

                <h3 style={styles.habitation}>
                  {report.habitation}
                </h3>

                <span
                  style={{
                    ...styles.severity,
                    background:
                      report.severity === "Critical"
                        ? "rgba(239, 68, 68, 0.22)"
                        : report.severity === "High"
                        ? "rgba(245, 158, 11, 0.22)"
                        : report.severity === "Moderate"
                        ? "rgba(59, 130, 246, 0.22)"
                        : "rgba(148, 163, 184, 0.22)",
                    color:
                      report.severity === "Critical"
                        ? "#ff9c9c"
                        : report.severity === "High"
                        ? "#ffcf9e"
                        : report.severity === "Moderate"
                        ? "#93c5fd"
                        : "#cbd5e1",
                  }}
                >
                  {report.severity}
                </span>

              </div>

              <p style={styles.details}>
                {report.hazard} •{" "}
                {typeof report.population === "number"
                  ? `${report.population.toLocaleString()} people`
                  : report.population}
              </p>

              <p style={styles.condition}>
                <strong>Alert:</strong>{" "}
                {report.condition}
              </p>

              <div style={styles.meta}>
                <span>
                  <strong>Report:</strong> {report.id}
                </span>

                <span>
                  <strong>Officer:</strong> {report.officer}
                </span>

                <span>
                  <strong>Date:</strong> {report.date}
                </span>
              </div>

            </div>

            {/* VERIFICATION STATUS */}
            <div
              style={{
                ...styles.status,
                color:
                  report.verification === "Completed"
                    ? "#a8f0c6"
                    : "#ffd699",
              }}
            >
              <span>
                {report.verification === "Completed"
                  ? "✓"
                  : "●"}
              </span>

              {report.verification}
            </div>

            {/* VIEW BUTTON */}
            <button
              style={styles.viewButton}
              onClick={() => setSelectedReport(report)}
            >
              View Report
            </button>

          </div>

        ))}

      </div>

      {/* WORKFLOW */}
      <div style={styles.workflow}>

        <h2 style={styles.sectionTitle}>
          Field Verification Workflow
        </h2>

        <p style={styles.sectionSubtitle}>
          Field reports connect system alerts with real-world verification.
        </p>

        <div style={styles.steps}>

          <div style={styles.step}>
            <div style={styles.stepNumber}>01</div>

            <div>
              <h3 style={styles.stepTitle}>
                Alert Received
              </h3>

              <p style={styles.stepText}>
                System identifies a high-risk habitation.
              </p>
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>02</div>

            <div>
              <h3 style={styles.stepTitle}>
                Field Inspection
              </h3>

              <p style={styles.stepText}>
                Officer checks the actual ground condition.
              </p>
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>03</div>

            <div>
              <h3 style={styles.stepTitle}>
                Report Submitted
              </h3>

              <p style={styles.stepText}>
                Observations and recommendations are recorded.
              </p>
            </div>
          </div>

          <div style={styles.step}>
            <div style={styles.stepNumber}>04</div>

            <div>
              <h3 style={styles.stepTitle}>
                Relocation Decision
              </h3>

              <p style={styles.stepText}>
                Verified information supports relocation priority.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* REPORT DETAILS MODAL */}
      {selectedReport && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>
                <p style={styles.modalLabel}>
                  SACHET HAZARD ALERT
                </p>

                <h2 style={styles.modalTitle}>
                  {selectedReport.id}
                </h2>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>

            </div>

            <div style={styles.modalGrid}>

              <div style={styles.detailBox}>
                <span>Habitation</span>
                <strong>{selectedReport.habitation}</strong>
              </div>

              <div style={styles.detailBox}>
                <span>Hazard</span>
                <strong>{selectedReport.hazard}</strong>
              </div>

              <div style={styles.detailBox}>
                <span>Population</span>
                <strong>
                  {typeof selectedReport.population === "number"
                    ? selectedReport.population.toLocaleString()
                    : selectedReport.population}
                </strong>
              </div>

              <div style={styles.detailBox}>
                <span>Risk Level</span>
                <strong>{selectedReport.severity}</strong>
              </div>

            </div>

            <div style={styles.modalSection}>

              <h3 style={styles.modalSectionHeading}>Alert Details</h3>

              <p style={styles.modalSectionText}>
                {selectedReport.condition}
              </p>

            </div>

            <div style={styles.modalSection}>

              <h3 style={styles.modalSectionHeading}>Official Instruction</h3>

              <p style={styles.modalSectionText}>
                {selectedReport.recommendation}
              </p>

            </div>

            <div style={styles.modalSection}>

              <h3 style={styles.modalSectionHeading}>Acknowledgement Status</h3>

              <p style={styles.modalSectionText}>
                {selectedReport.verification}
              </p>

            </div>

            {selectedReport.verification === "Pending" && (

              <button
                style={styles.verifyButton}
                onClick={() => {
                  acknowledgeAlert(selectedReport.id);
                  setSelectedReport({
                    ...selectedReport,
                    verification: "Completed",
                  });
                }}
              >
                Acknowledge Alert
              </button>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================
   STYLES — glassmorphism, matches
   RelocationPriority / RedZone / Habitations / ActionPlans
========================= */

const glassCard = {
  background: "rgba(255, 255, 255, 0.12)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "14px",
  backdropFilter: "blur(24px) saturate(150%)",
  WebkitBackdropFilter: "blur(24px) saturate(150%)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
};

const styles = {

  page: {
    padding: "30px",
    color: "#ffffff",
    minHeight: "calc(100vh - 82px)",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5.5px 20px 32px",
    marginBottom: "22px",
    gap: "20px",
    flexWrap: "wrap",
    background: "rgba(255, 255, 255, 0.28)",
    width: "900px",
    height: "80px",
    borderRadius: "8px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#a8b3c4",
    letterSpacing: "1px",
    margin: 0,
  },

  title: {
    fontSize: "32px",
    margin: "6px 0",
    fontWeight: "700",
    color: "#ffffff",
  },

  subtitle: {
    color: "#d7dee6",
    margin: 0,
    fontSize: "14px",
  },

  live: {
    padding: "10px 16px",
    borderRadius: "20px",
    background: "rgba(59, 130, 246, 0.18)",
    border: "1px solid rgba(96, 165, 250, 0.35)",
    color: "#93c5fd",
    fontWeight: "700",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },

  demo: {
    display: "inline-block",
    padding: "6px 10px",
    background: "rgba(255, 176, 64, 0.18)",
    color: "#ffd699",
    border: "1px solid rgba(255, 176, 64, 0.35)",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    marginBottom: "18px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
    marginBottom: "25px",
  },

  card: {
    ...glassCard,
    padding: "20px",
  },

  cardLabel: {
    color: "#b9c2cf",
    fontSize: "13px",
    fontWeight: "600",
    margin: 0,
  },

  cardNumber: {
    fontSize: "30px",
    margin: "12px 0 4px",
    color: "#ffffff",
    fontWeight: "800",
  },

  cardText: {
    color: "#a8b3c4",
    fontSize: "12px",
    margin: 0,
  },

  section: {
    ...glassCard,
    padding: "25px",
    marginBottom: "25px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "15px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#ffffff",
  },

  sectionSubtitle: {
    color: "#b9c2cf",
    margin: "6px 0 0",
    fontSize: "13px",
  },

  reportCount: {
    background: "rgba(59, 130, 246, 0.18)",
    color: "#93c5fd",
    border: "1px solid rgba(96, 165, 250, 0.35)",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  report: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "20px 0",
    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
  },

  reportIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  info: {
    flex: 1,
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  habitation: {
    margin: 0,
    fontSize: "16px",
    color: "#ffffff",
  },

  severity: {
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "11px",
    fontWeight: "700",
  },

  details: {
    color: "#d7dee6",
    fontSize: "13px",
    margin: "6px 0",
  },

  condition: {
    color: "#b9c2cf",
    fontSize: "12px",
    margin: "7px 0",
    lineHeight: "1.5",
  },

  meta: {
    display: "flex",
    gap: "18px",
    color: "#a8b3c4",
    fontSize: "11px",
    marginTop: "8px",
    flexWrap: "wrap",
  },

  status: {
    minWidth: "100px",
    fontSize: "12px",
    fontWeight: "700",
  },

  viewButton: {
    border: "1px solid rgba(147, 197, 253, 0.5)",
    padding: "9px 14px",
    borderRadius: "7px",
    background: "rgba(59, 130, 246, 0.15)",
    color: "#bcdcff",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  workflow: {
    ...glassCard,
    padding: "25px",
  },

  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginTop: "20px",
  },

  step: {
    display: "flex",
    gap: "12px",
    padding: "15px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.06)",
  },

  stepNumber: {
    width: "35px",
    height: "35px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    color: "#93c5fd",
    flexShrink: 0,
  },

  stepTitle: {
    margin: "2px 0 5px",
    fontSize: "13px",
    color: "#ffffff",
  },

  stepText: {
    margin: 0,
    color: "#b9c2cf",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(5, 10, 20, 0.6)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modal: {
    ...glassCard,
    width: "700px",
    maxWidth: "100%",
    background: "rgba(20, 28, 45, 0.9)",
    padding: "25px",
    color: "#ffffff",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
    paddingBottom: "18px",
  },

  modalLabel: {
    fontSize: "11px",
    color: "#a8b3c4",
    fontWeight: "700",
    letterSpacing: "1px",
    margin: 0,
  },

  modalTitle: {
    margin: "5px 0 0",
    fontSize: "24px",
    color: "#ffffff",
  },

  closeButton: {
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.1)",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    fontSize: "22px",
    cursor: "pointer",
    color: "#ffffff",
  },

  modalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "20px",
  },

  detailBox: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "14px",
    borderRadius: "9px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    color: "#e8ecf1",
  },

  modalSection: {
    marginTop: "20px",
  },

  modalSectionHeading: {
    margin: "0 0 6px",
    fontSize: "14px",
    color: "#ffffff",
  },

  modalSectionText: {
    margin: 0,
    color: "#d7dee6",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  verifyButton: {
    marginTop: "20px",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    padding: "11px 18px",
    borderRadius: "8px",
    background: "rgba(34, 197, 94, 0.25)",
    color: "#a8f0c6",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default FieldReports;
