import { useState } from "react";

function Alerts() {
  const [alerts, setAlerts] = useState([
    {
      id: "ALT-001",
      location: "Hill View Colony",
      hazard: "Landslide",
      severity: "Critical",
      people: 1250,
      status: "Active",
      time: "5 min ago",
      description:
        "High landslide risk detected near the habitation. Immediate authority attention is recommended.",
    },
    {
      id: "ALT-002",
      location: "River Bank Area",
      hazard: "Flood",
      severity: "High",
      people: 980,
      status: "Active",
      time: "18 min ago",
      description:
        "Rising flood risk has been identified near the residential area.",
    },
    {
      id: "ALT-003",
      location: "Green Valley",
      hazard: "Flood",
      severity: "Warning",
      people: 760,
      status: "Acknowledged",
      time: "32 min ago",
      description:
        "Moderate flood risk detected. Continue monitoring the affected area.",
    },
    {
      id: "ALT-004",
      location: "Mountain Road",
      hazard: "Landslide",
      severity: "High",
      people: 420,
      status: "Active",
      time: "45 min ago",
      description:
        "Possible slope instability detected near the road section.",
    },
  ]);

  const [selectedAlert, setSelectedAlert] = useState(null);

  const acknowledgeAlert = (id) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id
          ? { ...alert, status: "Acknowledged" }
          : alert
      )
    );
  };

  const criticalCount = alerts.filter(
    (alert) => alert.severity === "Critical"
  ).length;

  const highCount = alerts.filter(
    (alert) => alert.severity === "High"
  ).length;

  const activeCount = alerts.filter(
    (alert) => alert.status === "Active"
  ).length;

  const peopleAffected = alerts.reduce(
    (total, alert) => total + alert.people,
    0
  );

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>DISASTER MONITORING</div>

          <h1 style={styles.title}>Alerts</h1>

          <p style={styles.subtitle}>
            Monitor and respond to active disaster risk alerts.
          </p>
        </div>

        <div style={styles.live}>
          <span style={styles.liveDot}>●</span>
          LIVE ALERT MONITORING
        </div>
      </div>

      <div style={styles.demo}>
        DEMO DATA
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.cards}>

        <SummaryCard
          icon="!"
          title="Critical Alerts"
          value={criticalCount}
          text="Immediate attention"
          iconStyle={styles.criticalIcon}
        />

        <SummaryCard
          icon="↑"
          title="High Alerts"
          value={highCount}
          text="Action required"
          iconStyle={styles.highIcon}
        />

        <SummaryCard
          icon="●"
          title="Active Alerts"
          value={activeCount}
          text="Currently active"
          iconStyle={styles.activeIcon}
        />

        <SummaryCard
          icon="👥"
          title="People Affected"
          value={peopleAffected.toLocaleString()}
          text="Across alert zones"
          iconStyle={styles.peopleIcon}
        />

      </div>

      {/* ALERT LIST */}
      <div style={styles.section}>

        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Current Alerts</h2>

            <p style={styles.sectionSubtitle}>
              Latest disaster risk notifications
            </p>
          </div>

          <div style={styles.alertCount}>
            {alerts.length} Alerts
          </div>
        </div>

        {alerts.map((alert) => (
          <div key={alert.id} style={styles.alertRow}>

            <div style={styles.alertIcon}>
              ⚠
            </div>

            <div style={styles.alertInfo}>

              <div style={styles.locationRow}>
                <h3 style={styles.location}>
                  {alert.location}
                </h3>

                <span
                  style={{
                    ...styles.severity,
                    ...(alert.severity === "Critical"
                      ? styles.criticalBadge
                      : alert.severity === "High"
                      ? styles.highBadge
                      : styles.warningBadge),
                  }}
                >
                  {alert.severity}
                </span>
              </div>

              <p style={styles.alertDetails}>
                {alert.hazard} •{" "}
                {alert.people.toLocaleString()} people
              </p>

              <small style={styles.alertId}>
                {alert.id} • {alert.time}
              </small>

            </div>

            <div
              style={{
                ...styles.status,
                ...(alert.status === "Active"
                  ? styles.activeStatus
                  : styles.ackStatus),
              }}
            >
              {alert.status}
            </div>

            <button
              style={styles.viewButton}
              onClick={() => setSelectedAlert(alert)}
            >
              View
            </button>

            {alert.status === "Active" && (
              <button
                style={styles.ackButton}
                onClick={() => acknowledgeAlert(alert.id)}
              >
                Acknowledge
              </button>
            )}

          </div>
        ))}

      </div>

      {/* RESPONSE WORKFLOW */}
      <div style={styles.workflow}>

        <div>
          <div style={styles.eyebrow}>
            ALERT RESPONSE SYSTEM
          </div>

          <h2 style={styles.workflowTitle}>
            Alert Response Workflow
          </h2>

          <p style={styles.sectionSubtitle}>
            From automated detection to field action.
          </p>
        </div>

        <div style={styles.steps}>

          <WorkflowStep
            number="01"
            title="Alert Detected"
            text="Hazard risk identified"
          />

          <WorkflowStep
            number="02"
            title="Authority Notified"
            text="Relevant officers alerted"
          />

          <WorkflowStep
            number="03"
            title="Field Verification"
            text="Ground situation verified"
          />

          <WorkflowStep
            number="04"
            title="Action Initiated"
            text="Response plan activated"
          />

        </div>

      </div>

      {/* DETAILS MODAL */}
      {selectedAlert && (
        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>
                <div style={styles.eyebrow}>
                  ALERT DETAILS
                </div>

                <h2 style={styles.modalTitle}>
                  {selectedAlert.location}
                </h2>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setSelectedAlert(null)}
              >
                ×
              </button>

            </div>

            <div style={styles.detailGrid}>

              <Detail
                label="Alert ID"
                value={selectedAlert.id}
              />

              <Detail
                label="Hazard"
                value={selectedAlert.hazard}
              />

              <Detail
                label="Severity"
                value={selectedAlert.severity}
              />

              <Detail
                label="People at Risk"
                value={selectedAlert.people.toLocaleString()}
              />

              <Detail
                label="Status"
                value={selectedAlert.status}
              />

              <Detail
                label="Detected"
                value={selectedAlert.time}
              />

            </div>

            <div style={styles.descriptionBox}>
              <strong style={styles.descriptionHeading}>Description</strong>

              <p style={styles.descriptionText}>
                {selectedAlert.description}
              </p>
            </div>

            <div style={styles.modalActions}>

              {selectedAlert.status === "Active" && (
                <button
                  style={styles.ackButton}
                  onClick={() => {
                    acknowledgeAlert(selectedAlert.id);
                    setSelectedAlert({
                      ...selectedAlert,
                      status: "Acknowledged",
                    });
                  }}
                >
                  Acknowledge Alert
                </button>
              )}

              <button
                style={styles.closeAction}
                onClick={() => setSelectedAlert(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


/* SUMMARY CARD */

function SummaryCard({
  icon,
  title,
  value,
  text,
  iconStyle,
}) {
  return (
    <div style={styles.card}>

      <div style={styles.cardTop}>

        <span style={styles.cardTitle}>
          {title}
        </span>

        <div style={{ ...styles.cardIcon, ...iconStyle }}>
          {icon}
        </div>

      </div>

      <h2 style={styles.cardValue}>
        {value}
      </h2>

      <p style={styles.cardText}>
        {text}
      </p>

    </div>
  );
}


/* WORKFLOW STEP */

function WorkflowStep({ number, title, text }) {
  return (
    <div style={styles.step}>

      <div style={styles.stepNumber}>
        {number}
      </div>

      <div>
        <strong style={styles.stepTitle}>
          {title}
        </strong>

        <p style={styles.stepText}>
          {text}
        </p>
      </div>

    </div>
  );
}


/* DETAIL */

function Detail({ label, value }) {
  return (
    <div style={styles.detail}>
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value}</strong>
    </div>
  );
}


/* STYLES — glassmorphism, matches
   RelocationPriority / RedZone / Habitations / ActionPlans / FieldReports / Reports */

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
    minHeight: "calc(100vh - 90px)",
    color: "#ffffff",
    fontFamily: "Inter, Arial, Helvetica, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    gap: "15px",
    flexWrap: "wrap",
  },

  eyebrow: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#a8b3c4",
  },

  title: {
    fontSize: "32px",
    margin: "6px 0",
    color: "#ffffff",
  },

  subtitle: {
    margin: 0,
    color: "#d7dee6",
    fontSize: "14px",
  },

  live: {
    padding: "10px 16px",
    borderRadius: "20px",
    background: "rgba(34, 197, 94, 0.18)",
    color: "#7be0b1",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  liveDot: {
    marginRight: "6px",
  },

  demo: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "rgba(255, 176, 64, 0.18)",
    color: "#ffd699",
    border: "1px solid rgba(255, 176, 64, 0.35)",
    fontSize: "10px",
    fontWeight: "800",
    marginBottom: "20px",
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

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: "#b9c2cf",
    fontSize: "13px",
    fontWeight: "700",
  },

  cardIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
  },

  criticalIcon: {
    background: "rgba(239, 68, 68, 0.22)",
    color: "#ff9c9c",
  },

  highIcon: {
    background: "rgba(245, 158, 11, 0.22)",
    color: "#ffcf9e",
  },

  activeIcon: {
    background: "rgba(59, 130, 246, 0.22)",
    color: "#93c5fd",
  },

  peopleIcon: {
    background: "rgba(139, 92, 246, 0.22)",
    color: "#d0bfff",
  },

  cardValue: {
    fontSize: "30px",
    margin: "16px 0 5px",
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
    marginBottom: "10px",
    gap: "15px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#ffffff",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#b9c2cf",
    fontSize: "13px",
  },

  alertCount: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#e8ecf1",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  alertRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "18px 0",
    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
    flexWrap: "wrap",
  },

  alertIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "rgba(239, 68, 68, 0.22)",
    color: "#ff9c9c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    flexShrink: 0,
  },

  alertInfo: {
    flex: 1,
    minWidth: "200px",
  },

  locationRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  location: {
    margin: 0,
    fontSize: "15px",
    color: "#ffffff",
  },

  severity: {
    padding: "4px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  criticalBadge: {
    background: "rgba(239, 68, 68, 0.22)",
    color: "#ff9c9c",
  },

  highBadge: {
    background: "rgba(245, 158, 11, 0.22)",
    color: "#ffcf9e",
  },

  warningBadge: {
    background: "rgba(250, 204, 21, 0.2)",
    color: "#ffe49e",
  },

  alertDetails: {
    margin: "5px 0",
    color: "#d7dee6",
    fontSize: "12px",
  },

  alertId: {
    color: "#a8b3c4",
    fontSize: "10px",
  },

  status: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  activeStatus: {
    background: "rgba(239, 68, 68, 0.22)",
    color: "#ff9c9c",
  },

  ackStatus: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#a8f0c6",
  },

  viewButton: {
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#e8ecf1",
    padding: "8px 13px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  ackButton: {
    border: "1px solid rgba(34, 197, 94, 0.4)",
    background: "rgba(34, 197, 94, 0.25)",
    color: "#a8f0c6",
    padding: "9px 14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  workflow: {
    ...glassCard,
    padding: "25px",
  },

  workflowTitle: {
    margin: "6px 0 0",
    fontSize: "20px",
    color: "#ffffff",
  },

  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginTop: "22px",
  },

  step: {
    display: "flex",
    gap: "12px",
    padding: "15px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
  },

  stepNumber: {
    fontSize: "12px",
    fontWeight: "900",
    color: "#93c5fd",
  },

  stepTitle: {
    fontSize: "12px",
    color: "#ffffff",
  },

  stepText: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#b9c2cf",
  },

  overlay: {
    position: "fixed",
    inset: 0,
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
    width: "600px",
    maxWidth: "90%",
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
    marginBottom: "25px",
  },

  modalTitle: {
    margin: "6px 0 0",
    fontSize: "24px",
    color: "#ffffff",
  },

  closeButton: {
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.1)",
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    fontSize: "22px",
    cursor: "pointer",
    color: "#ffffff",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },

  detail: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "14px",
    borderRadius: "9px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  detailLabel: {
    color: "#a8b3c4",
    fontSize: "11px",
  },

  detailValue: {
    color: "#ffffff",
    fontSize: "14px",
  },

  descriptionBox: {
    marginTop: "18px",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    fontSize: "13px",
  },

  descriptionHeading: {
    color: "#ffffff",
  },

  descriptionText: {
    margin: "8px 0 0",
    color: "#d7dee6",
    lineHeight: "1.6",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  closeAction: {
    border: "1px solid rgba(255, 255, 255, 0.4)",
    background: "transparent",
    color: "#ffffff",
    padding: "9px 15px",
    borderRadius: "7px",
    cursor: "pointer",
  },
};

export default Alerts;
