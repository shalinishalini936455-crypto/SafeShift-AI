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
              <strong>Description</strong>

              <p>
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
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}


/* STYLES */

const styles = {

  page: {
    padding: "30px",
    background: "#f8fafc",
    minHeight: "calc(100vh - 90px)",
    color: "#172033",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  eyebrow: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#64748b",
  },

  title: {
    fontSize: "32px",
    margin: "6px 0",
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  live: {
    padding: "10px 16px",
    borderRadius: "20px",
    background: "#ecfdf5",
    color: "#047857",
    fontSize: "12px",
    fontWeight: "800",
  },

  liveDot: {
    marginRight: "6px",
  },

  demo: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "#fff7ed",
    color: "#c2410c",
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
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 3px 12px rgba(15,23,42,0.04)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: "#64748b",
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
    background: "#fef2f2",
    color: "#dc2626",
  },

  highIcon: {
    background: "#fff7ed",
    color: "#ea580c",
  },

  activeIcon: {
    background: "#eff6ff",
    color: "#2563eb",
  },

  peopleIcon: {
    background: "#f5f3ff",
    color: "#7c3aed",
  },

  cardValue: {
    fontSize: "30px",
    margin: "16px 0 5px",
  },

  cardText: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: 0,
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "25px",
    marginBottom: "25px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  alertCount: {
    background: "#f1f5f9",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  alertRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "18px 0",
    borderTop: "1px solid #e2e8f0",
  },

  alertIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "#fef2f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  alertInfo: {
    flex: 1,
  },

  locationRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  location: {
    margin: 0,
    fontSize: "15px",
  },

  severity: {
    padding: "4px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  criticalBadge: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  highBadge: {
    background: "#ffedd5",
    color: "#c2410c",
  },

  warningBadge: {
    background: "#fef9c3",
    color: "#a16207",
  },

  alertDetails: {
    margin: "5px 0",
    color: "#64748b",
    fontSize: "12px",
  },

  alertId: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  status: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  activeStatus: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  ackStatus: {
    background: "#dcfce7",
    color: "#15803d",
  },

  viewButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    padding: "8px 13px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  ackButton: {
    border: "none",
    background: "#172033",
    color: "#ffffff",
    padding: "9px 14px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
  },

  workflow: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "25px",
  },

  workflowTitle: {
    margin: "6px 0 0",
    fontSize: "20px",
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
    background: "#f8fafc",
    borderRadius: "10px",
  },

  stepNumber: {
    fontSize: "12px",
    fontWeight: "900",
    color: "#2563eb",
  },

  stepTitle: {
    fontSize: "12px",
  },

  stepText: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#64748b",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modal: {
    width: "600px",
    maxWidth: "90%",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
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
  },

  closeButton: {
    border: "none",
    background: "#f1f5f9",
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    fontSize: "22px",
    cursor: "pointer",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },

  detail: {
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "9px",
  },

  descriptionBox: {
    marginTop: "18px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "10px",
    fontSize: "13px",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  closeAction: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: "9px 15px",
    borderRadius: "7px",
    cursor: "pointer",
  },
};

export default Alerts;