import { useState, useEffect } from "react";

// TODO: confirm this matches the port your main FastAPI file actually
// runs on (uvicorn main:app --reload defaults to 8000, but confirm).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);

  const [dashboard, setDashboard] = useState(null);   // /api/reports/dashboard
  const [hazards, setHazards] = useState(null);       // /api/live-hazards
  const [peopleAtRisk, setPeopleAtRisk] = useState(null); // summed from /api/reports/risk
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [dashboardRes, hazardsRes, riskRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reports/dashboard`),
          fetch(`${API_BASE_URL}/api/live-hazards`),
          fetch(`${API_BASE_URL}/api/reports/risk`),
        ]);

        if (!dashboardRes.ok || !hazardsRes.ok || !riskRes.ok) {
          throw new Error("Backend returned an error response.");
        }

        const dashboardData = await dashboardRes.json();
        const hazardsData = await hazardsRes.json();
        const riskRows = await riskRes.json();

        // People at Risk = real population of habitations currently
        // classified High or Medium risk in your own database — not a
        // government estimate, your actual tracked figure.
        const atRiskTotal = riskRows
          .filter((row) => row.risk_level === "High" || row.risk_level === "Medium")
          .reduce((sum, row) => sum + (row.population || 0), 0);

        if (!cancelled) {
          setDashboard(dashboardData);
          setHazards(hazardsData);
          setPeopleAtRisk(atRiskTotal);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Couldn't load data. Is the FastAPI backend running on " + API_BASE_URL + "?"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const alerts = hazards?.alerts || [];

  // Real alerts, most recent first, standing in for "Generated Reports".
  const reports = [...alerts]
    .sort((a, b) => new Date(b.sent || 0) - new Date(a.sent || 0))
    .slice(0, 15)
    .map((alert) => ({
      id: alert.identifier || alert.cap_url,
      title: alert.headline || alert.event || alert.hazard_type,
      hazardType: alert.hazard_type,
      severity: alert.severity || "Unknown",
      urgency: alert.urgency,
      date: alert.sent,
      districts: alert.affected_districts || [],
      description: alert.description,
      instruction: alert.instruction,
      link: alert.web || alert.cap_url,
      locationNote: alert.location_resolution_note,
    }));

  // Real risk distribution from your own Habitation table — 3 bands
  // (High/Medium/Low), matching your actual schema. No invented
  // "Critical" tier.
  const riskCounts = dashboard?.risk_distribution || { high: 0, medium: 0, low: 0 };
  const maxBand = Math.max(riskCounts.high, riskCounts.medium, riskCounts.low, 1);
  const riskData = [
    { name: "High", value: riskCounts.high, width: `${Math.round((riskCounts.high / maxBand) * 100)}%` },
    { name: "Medium", value: riskCounts.medium, width: `${Math.round((riskCounts.medium / maxBand) * 100)}%` },
    { name: "Low", value: riskCounts.low, width: `${Math.round((riskCounts.low / maxBand) * 100)}%` },
  ];

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.subtitle}>Loading live data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.demo}>DATA UNAVAILABLE</div>
        <p style={styles.subtitle}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>
            DECISION SUPPORT ANALYTICS
          </div>

          <h1 style={styles.title}>
            Reports & Analytics
          </h1>

          <p style={styles.subtitle}>
            Monitor disaster risk trends and generate
            decision-support reports.
          </p>
        </div>

        <div style={styles.live}>
          ● LIVE DATA
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.cards}>

        <SummaryCard
          title="Total Reports"
          value={hazards?.count ?? "—"}
          text="Active SACHET alerts"
          icon="📄"
        />

        <SummaryCard
          title="High Risk Areas"
          value={dashboard?.total_red_zones ?? "—"}
          text="Tracked red zones"
          icon="⚠️"
        />

        <SummaryCard
          title="People at Risk"
          value={peopleAtRisk != null ? peopleAtRisk.toLocaleString() : "—"}
          text="High/Medium risk habitations"
          icon="👥"
        />

        <SummaryCard
          title="Safe Site Capacity"
          value={dashboard?.available_safe_capacity?.toLocaleString() ?? "—"}
          text="Available capacity"
          icon="📍"
        />

      </div>

      {/* ANALYTICS */}
      <div style={styles.analyticsGrid}>

        {/* RISK DISTRIBUTION */}
        <div style={styles.panel}>

          <h2 style={styles.panelTitle}>
            Risk Distribution
          </h2>

          <p style={styles.panelText}>
            Current risk classification of monitored habitations.
          </p>

          <div style={styles.chartArea}>

            {riskData.map((item) => (
              <div
                key={item.name}
                style={styles.riskItem}
              >

                <div style={styles.riskTop}>
                  <span>{item.name}</span>
                  <strong>{item.value}</strong>
                </div>

                <div style={styles.bar}>
                  <div
                    style={{
                      ...styles.barFill,
                      width: item.width,
                    }}
                  />
                </div>

              </div>
            ))}

          </div>

        </div>

        {/* SYSTEM OVERVIEW */}
        <div style={styles.panel}>

          <h2 style={styles.panelTitle}>
            System Overview
          </h2>

          <p style={styles.panelText}>
            Current SafeShift AI monitoring status.
          </p>

          <div style={styles.overviewList}>

            <OverviewItem
              label="Total Habitations"
              value={dashboard?.total_habitations ?? "—"}
            />

            <OverviewItem
              label="Red Zones"
              value={dashboard?.total_red_zones ?? "—"}
            />

            <OverviewItem
              label="Safe Sites"
              value={dashboard?.total_safe_sites ?? "—"}
            />

            <OverviewItem
              label="Relocation Plans"
              value={dashboard?.total_relocation_plans ?? "—"}
            />

            <OverviewItem
              label="Active SACHET Alerts"
              value={hazards?.count ?? "—"}
            />

          </div>

        </div>

      </div>

      {/* LIVE ALERTS (was "Generated Reports") */}
      <div style={styles.reportPanel}>

        <div style={styles.reportHeader}>

          <div>
            <h2 style={styles.panelTitle}>
              Live Disaster Alerts
            </h2>

            <p style={styles.panelText}>
              Current warnings parsed from NDMA SACHET.
            </p>
          </div>

        </div>

        {reports.length === 0 && (
          <p style={styles.panelText}>No active alerts to show right now.</p>
        )}

        {reports.map((report) => (

          <div
            key={report.id}
            style={styles.reportRow}
          >

            <div style={styles.reportIcon}>
              📄
            </div>

            <div style={styles.reportInfo}>

              <strong>{report.title}</strong>

              <span style={styles.reportType}>
                {report.hazardType} • {report.districts.join(", ") || "Area unspecified"}
              </span>

            </div>

            <div style={styles.reportDate}>
              {report.date ? new Date(report.date).toLocaleDateString() : "—"}
            </div>

            <div style={styles.status}>
              {report.severity}
            </div>

            <button
              style={styles.viewButton}
              onClick={() => setSelectedReport(report)}
            >
              View
            </button>

          </div>

        ))}

      </div>

      {/* REPORT DETAILS */}
      {selectedReport && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>
                <div style={styles.eyebrow}>
                  ALERT DETAILS
                </div>

                <h2 style={styles.modalTitle}>
                  {selectedReport.title}
                </h2>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>

            </div>

            <div style={styles.detailGrid}>

              <Detail
                label="Hazard Type"
                value={selectedReport.hazardType || "Unspecified"}
              />

              <Detail
                label="Severity"
                value={selectedReport.severity}
              />

              <Detail
                label="Urgency"
                value={selectedReport.urgency || "Unspecified"}
              />

              <Detail
                label="Published"
                value={selectedReport.date ? new Date(selectedReport.date).toLocaleString() : "—"}
              />

              <Detail
                label="Affected Districts"
                value={selectedReport.districts.join(", ") || "Unmapped"}
              />

            </div>

            <div style={styles.description}>

              <strong style={styles.descriptionHeading}>
                Alert Description
              </strong>

              <p style={styles.descriptionText}>
                {selectedReport.description || "No further description provided by SACHET."}
              </p>

              {selectedReport.instruction && (
                <>
                  <strong style={styles.descriptionHeading}>Instructions</strong>
                  <p style={styles.descriptionText}>{selectedReport.instruction}</p>
                </>
              )}

              {selectedReport.locationNote && (
                <p style={{ ...styles.descriptionText, fontSize: "11px", color: "#a8b3c4" }}>
                  {selectedReport.locationNote}
                </p>
              )}

              {selectedReport.link && (
                <a
                  href={selectedReport.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#93c5fd", fontSize: "12px" }}
                >
                  View original alert on SACHET →
                </a>
              )}

            </div>

            <button
              style={styles.closeAction}
              onClick={() => setSelectedReport(null)}
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


/* SUMMARY CARD */

function SummaryCard({ title, value, text, icon }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span>{title}</span>
        <div style={styles.cardIcon}>{icon}</div>
      </div>
      <h2 style={styles.cardValue}>{value}</h2>
      <p style={styles.cardText}>{text}</p>
    </div>
  );
}


/* OVERVIEW ITEM */

function OverviewItem({ label, value }) {
  return (
    <div style={styles.overviewItem}>
      <span>{label}</span>
      <strong>{value}</strong>
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
   RelocationPriority / RedZone / Habitations / ActionPlans / FieldReports */

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
  title: { fontSize: "32px", margin: "6px 0", color: "#ffffff" },
  subtitle: { margin: 0, color: "#d7dee6", fontSize: "14px" },
  live: {
    background: "rgba(34, 197, 94, 0.18)",
    color: "#a8f0c6",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    padding: "10px 16px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  demo: {
    display: "inline-block",
    background: "rgba(255, 99, 99, 0.18)",
    color: "#ffb3b3",
    border: "1px solid rgba(255, 99, 99, 0.35)",
    padding: "6px 10px",
    borderRadius: "6px",
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
  card: { ...glassCard, padding: "20px" },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#b9c2cf",
    fontSize: "13px",
    fontWeight: "700",
  },
  cardIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardValue: { fontSize: "30px", margin: "16px 0 5px", color: "#ffffff", fontWeight: "800" },
  cardText: { margin: 0, color: "#a8b3c4", fontSize: "12px" },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "20px",
    marginBottom: "25px",
  },
  panel: { ...glassCard, padding: "25px" },
  panelTitle: { margin: 0, fontSize: "20px", color: "#ffffff" },
  panelText: { margin: "6px 0 20px", color: "#b9c2cf", fontSize: "13px" },
  chartArea: { marginTop: "20px" },
  riskItem: { marginBottom: "18px" },
  riskTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "7px",
    fontSize: "13px",
    color: "#e8ecf1",
  },
  bar: {
    height: "9px",
    background: "rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
    borderRadius: "10px",
  },
  overviewList: { marginTop: "15px" },
  overviewItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
    fontSize: "13px",
    color: "#e8ecf1",
  },
  reportPanel: { ...glassCard, padding: "25px", marginBottom: "25px" },
  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    gap: "15px",
    flexWrap: "wrap",
  },
  reportRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "17px 0",
    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
    flexWrap: "wrap",
  },
  reportIcon: {
    width: "42px",
    height: "42px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  reportInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    color: "#ffffff",
    minWidth: "160px",
  },
  reportType: { color: "#b9c2cf", fontSize: "12px" },
  reportDate: { color: "#b9c2cf", fontSize: "12px" },
  status: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#bcdcff",
    border: "1px solid rgba(96, 165, 250, 0.35)",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  viewButton: {
    background: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(147, 197, 253, 0.5)",
    color: "#bcdcff",
    padding: "8px 13px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
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
    marginBottom: "20px",
  },
  modalTitle: { margin: "6px 0 0", fontSize: "24px", color: "#ffffff" },
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
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" },
  detail: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "14px",
    borderRadius: "9px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  detailLabel: { color: "#a8b3c4", fontSize: "11px" },
  detailValue: { color: "#ffffff", fontSize: "14px" },
  description: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "18px",
    fontSize: "13px",
  },
  descriptionHeading: { color: "#ffffff" },
  descriptionText: { margin: "8px 0 0", color: "#d7dee6", lineHeight: "1.6" },
  closeAction: {
    marginTop: "18px",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    background: "transparent",
    color: "#ffffff",
    padding: "9px 16px",
    borderRadius: "7px",
    cursor: "pointer",
  },
};

export default Reports;
