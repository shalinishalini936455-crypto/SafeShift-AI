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
    },
    {
      id: "ALT-002",
      location: "River Bank Area",
      hazard: "Flood",
      severity: "High",
      people: 980,
      status: "Active",
    },
    {
      id: "ALT-003",
      location: "Green Valley",
      hazard: "Flood",
      severity: "Warning",
      people: 760,
      status: "Acknowledged",
    },
  ]);

  const acknowledgeAlert = (id) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id
          ? { ...alert, status: "Acknowledged" }
          : alert
      )
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.label}>DISASTER MONITORING</p>
          <h1 style={styles.title}>Alerts</h1>
          <p style={styles.subtitle}>
            Monitor and respond to active disaster risk alerts.
          </p>
        </div>

        <div style={styles.live}>
          ● LIVE ALERT MONITORING
        </div>
      </div>

      <div style={styles.demo}>DEMO DATA</div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <span>Critical Alerts</span>
          <h2>
            {alerts.filter((a) => a.severity === "Critical").length}
          </h2>
          <p>Immediate attention</p>
        </div>

        <div style={styles.card}>
          <span>High Alerts</span>
          <h2>
            {alerts.filter((a) => a.severity === "High").length}
          </h2>
          <p>Action required</p>
        </div>

        <div style={styles.card}>
          <span>Active Alerts</span>
          <h2>
            {alerts.filter((a) => a.status === "Active").length}
          </h2>
          <p>Currently active</p>
        </div>

        <div style={styles.card}>
          <span>People Affected</span>
          <h2>
            {alerts.reduce((sum, a) => sum + a.people, 0).toLocaleString()}
          </h2>
          <p>Across alert zones</p>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2>Current Alerts</h2>
            <p>Latest disaster risk notifications</p>
          </div>
        </div>

        {alerts.map((alert) => (
          <div key={alert.id} style={styles.alert}>
            <div style={styles.icon}>⚠</div>

            <div style={styles.info}>
              <h3>{alert.location}</h3>
              <p>
                {alert.hazard} • {alert.people.toLocaleString()} people
              </p>
              <small>{alert.id}</small>
            </div>

            <div style={styles.badge}>
              {alert.severity}
            </div>

            <div style={styles.status}>
              {alert.status}
            </div>

            {alert.status === "Active" && (
              <button
                style={styles.button}
                onClick={() => acknowledgeAlert(alert.id)}
              >
                Acknowledge
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={styles.workflow}>
        <h2>Alert Response Workflow</h2>

        <div style={styles.steps}>
          <div>
            <b>01</b>
            <span>Alert Detected</span>
          </div>

          <div>
            <b>02</b>
            <span>Authority Notified</span>
          </div>

          <div>
            <b>03</b>
            <span>Field Verification</span>
          </div>

          <div>
            <b>04</b>
            <span>Action Initiated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "30px",
    color: "#172033",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "1px",
    margin: 0,
  },

  title: {
    fontSize: "32px",
    margin: "6px 0",
  },

  subtitle: {
    color: "#64748b",
    margin: 0,
  },

  live: {
    padding: "10px 16px",
    borderRadius: "20px",
    background: "#ecfdf5",
    color: "#047857",
    fontWeight: "700",
    fontSize: "13px",
  },

  demo: {
    display: "inline-block",
    padding: "6px 10px",
    background: "#fff7ed",
    color: "#c2410c",
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
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "25px",
  },

  sectionHeader: {
    marginBottom: "20px",
  },

  alert: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "18px 0",
    borderTop: "1px solid #e5e7eb",
  },

  icon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#fef2f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  info: {
    flex: 1,
  },

  badge: {
    padding: "7px 12px",
    borderRadius: "20px",
    background: "#fff1f2",
    color: "#be123c",
    fontWeight: "700",
    fontSize: "12px",
  },

  status: {
    fontSize: "13px",
    fontWeight: "600",
  },

  button: {
    border: "none",
    padding: "9px 14px",
    borderRadius: "7px",
    background: "#172033",
    color: "white",
    cursor: "pointer",
  },

  workflow: {
    marginTop: "25px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "25px",
  },

  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginTop: "20px",
  },
};

export default Alerts;