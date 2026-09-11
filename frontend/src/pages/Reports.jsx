import { useState } from "react";

function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    {
      id: "RPT-001",
      title: "Disaster Risk Summary",
      type: "Risk Analysis",
      date: "11 Sep 2026",
      status: "Generated",
    },
    {
      id: "RPT-002",
      title: "Relocation Priority Report",
      type: "Relocation",
      date: "10 Sep 2026",
      status: "Generated",
    },
    {
      id: "RPT-003",
      title: "Hazard Monitoring Report",
      type: "Hazard Analysis",
      date: "09 Sep 2026",
      status: "Generated",
    },
  ];

  const riskData = [
    { name: "Critical", value: 7, width: "25%" },
    { name: "High", value: 11, width: "45%" },
    { name: "Medium", value: 18, width: "65%" },
    { name: "Low", value: 26, width: "85%" },
  ];

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
          ● ANALYTICS ACTIVE
        </div>
      </div>

      <div style={styles.demo}>
        DEMO DATA
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.cards}>

        <SummaryCard
          title="Total Reports"
          value="24"
          text="Generated reports"
          icon="📄"
        />

        <SummaryCard
          title="High Risk Areas"
          value="18"
          text="Require monitoring"
          icon="⚠️"
        />

        <SummaryCard
          title="People at Risk"
          value="12,540"
          text="Across monitored areas"
          icon="👥"
        />

        <SummaryCard
          title="Safe Site Capacity"
          value="8,420"
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
              label="Red Zones"
              value="24"
            />

            <OverviewItem
              label="High Risk Habitations"
              value="18"
            />

            <OverviewItem
              label="Active Alerts"
              value="3"
            />

            <OverviewItem
              label="Safe Sites"
              value="12"
            />

            <OverviewItem
              label="Pending Field Reports"
              value="6"
            />

          </div>

        </div>

      </div>

      {/* GENERATED REPORTS */}
      <div style={styles.reportPanel}>

        <div style={styles.reportHeader}>

          <div>
            <h2 style={styles.panelTitle}>
              Generated Reports
            </h2>

            <p style={styles.panelText}>
              Review available disaster management reports.
            </p>
          </div>

          <button
            style={styles.generateButton}
            onClick={() =>
              alert(
                "Report generation will be connected to the backend."
              )
            }
          >
            + Generate Report
          </button>

        </div>

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
                {report.id} • {report.type}
              </span>

            </div>

            <div style={styles.reportDate}>
              {report.date}
            </div>

            <div style={styles.status}>
              {report.status}
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

      {/* WORKFLOW */}
      <div style={styles.workflow}>

        <div style={styles.eyebrow}>
          REPORTING WORKFLOW
        </div>

        <h2 style={styles.workflowTitle}>
          From monitoring data to decisions
        </h2>

        <div style={styles.steps}>

          <Step
            number="01"
            title="Collect"
            text="Hazard and habitation data"
          />

          <Step
            number="02"
            title="Analyze"
            text="Risk and relocation analysis"
          />

          <Step
            number="03"
            title="Generate"
            text="Decision-support report"
          />

          <Step
            number="04"
            title="Act"
            text="Authority decision and response"
          />

        </div>

      </div>

      {/* REPORT DETAILS */}
      {selectedReport && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>
                <div style={styles.eyebrow}>
                  REPORT DETAILS
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
                label="Report ID"
                value={selectedReport.id}
              />

              <Detail
                label="Report Type"
                value={selectedReport.type}
              />

              <Detail
                label="Generated Date"
                value={selectedReport.date}
              />

              <Detail
                label="Status"
                value={selectedReport.status}
              />

            </div>

            <div style={styles.description}>

              <strong>
                Report Summary
              </strong>

              <p>
                This demo report contains analyzed disaster
                risk, affected population, hazard information
                and relocation decision-support data.
              </p>

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

function SummaryCard({
  title,
  value,
  text,
  icon,
}) {
  return (
    <div style={styles.card}>

      <div style={styles.cardTop}>

        <span>{title}</span>

        <div style={styles.cardIcon}>
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


/* OVERVIEW ITEM */

function OverviewItem({ label, value }) {
  return (
    <div style={styles.overviewItem}>

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


/* WORKFLOW STEP */

function Step({
  number,
  title,
  text,
}) {
  return (
    <div style={styles.step}>

      <div style={styles.stepNumber}>
        {number}
      </div>

      <div>
        <strong>{title}</strong>

        <p style={styles.stepText}>
          {text}
        </p>
      </div>

    </div>
  );
}


/* DETAIL */

function Detail({
  label,
  value,
}) {
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
    background: "#eff6ff",
    color: "#2563eb",
    padding: "10px 16px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },

  demo: {
    display: "inline-block",
    background: "#fff7ed",
    color: "#c2410c",
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

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "20px",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "700",
  },

  cardIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardValue: {
    fontSize: "30px",
    margin: "16px 0 5px",
  },

  cardText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
  },

  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "20px",
    marginBottom: "25px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "25px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "20px",
  },

  panelText: {
    margin: "6px 0 20px",
    color: "#64748b",
    fontSize: "13px",
  },

  chartArea: {
    marginTop: "20px",
  },

  riskItem: {
    marginBottom: "18px",
  },

  riskTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "7px",
    fontSize: "13px",
  },

  bar: {
    height: "9px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "10px",
  },

  overviewList: {
    marginTop: "15px",
  },

  overviewItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px",
  },

  reportPanel: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "25px",
    marginBottom: "25px",
  },

  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  generateButton: {
    background: "#172033",
    color: "#ffffff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
  },

  reportRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "17px 0",
    borderTop: "1px solid #e2e8f0",
  },

  reportIcon: {
    width: "42px",
    height: "42px",
    background: "#f1f5f9",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  reportInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  reportType: {
    color: "#64748b",
    fontSize: "12px",
  },

  reportDate: {
    color: "#64748b",
    fontSize: "12px",
  },

  status: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  viewButton: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "8px 13px",
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
    margin: "6px 0 20px",
    fontSize: "20px",
  },

  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
  },

  step: {
    display: "flex",
    gap: "12px",
    background: "#f8fafc",
    padding: "15px",
    borderRadius: "10px",
  },

  stepNumber: {
    color: "#2563eb",
    fontWeight: "900",
  },

  stepText: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "11px",
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
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
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
    gap: "12px",
  },

  detail: {
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "9px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  description: {
    background: "#f8fafc",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "18px",
    fontSize: "13px",
  },

  closeAction: {
    marginTop: "18px",
    border: "none",
    background: "#172033",
    color: "#ffffff",
    padding: "9px 16px",
    borderRadius: "7px",
    cursor: "pointer",
  },
};

export default Reports;