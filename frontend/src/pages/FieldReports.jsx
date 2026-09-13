import { useState } from "react";

function FieldReports() {
  const [reports, setReports] = useState([
    {
      id: "FR-001",
      habitation: "Village A, Salem",
      hazard: "Flood",
      severity: "Critical",
      population: 1240,
      verification: "Completed",
      condition:
        "Flood risk confirmed near the habitation. Immediate assessment required.",
      recommendation:
        "Move vulnerable population to a suitable medium-term relocation site.",
      officer: "Field Officer - Salem",
      date: "11 Sep 2026",
    },
    {
      id: "FR-002",
      habitation: "Village B, Salem",
      hazard: "Landslide",
      severity: "High",
      population: 850,
      verification: "Pending",
      condition:
        "Ground verification is pending for the identified landslide risk.",
      recommendation:
        "Conduct field inspection before finalizing relocation priority.",
      officer: "Field Officer - Salem",
      date: "11 Sep 2026",
    },
    {
      id: "FR-003",
      habitation: "Village C, Erode",
      hazard: "Flood",
      severity: "High",
      population: 620,
      verification: "Completed",
      condition:
        "Flood-prone condition verified around the habitation.",
      recommendation:
        "Include habitation in relocation planning and identify a medium-term site.",
      officer: "Field Officer - Erode",
      date: "11 Sep 2026",
    },
  ]);

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

  const verifyReport = (id) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === id
          ? {
              ...report,
              verification: "Completed",
              condition:
                "Ground verification completed. Risk condition confirmed.",
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
          <p style={styles.label}>DISASTER MONITORING</p>

          <h1 style={styles.title}>Field Reports</h1>

          <p style={styles.subtitle}>
            Ground verification reports submitted by field officers.
          </p>
        </div>

        <div style={styles.live}>
          <span>●</span> FIELD MONITORING
        </div>
      </div>

      {/* DEMO DATA */}
      <div style={styles.demo}>
        DEMO DATA
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
          <p style={styles.cardLabel}>Verified Reports</p>

          <h2 style={styles.cardNumber}>
            {verifiedReports}
          </h2>

          <p style={styles.cardText}>
            Ground condition verified
          </p>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Pending Verification</p>

          <h2 style={styles.cardNumber}>
            {pendingReports}
          </h2>

          <p style={styles.cardText}>
            Awaiting field inspection
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
              Ground Verification Reports
            </h2>

            <p style={styles.sectionSubtitle}>
              Field observations used to validate disaster risk before relocation decisions.
            </p>
          </div>

          <div style={styles.reportCount}>
            {reports.length} Reports
          </div>
        </div>

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
                        ? "#fee2e2"
                        : "#ffedd5",
                    color:
                      report.severity === "Critical"
                        ? "#b91c1c"
                        : "#c2410c",
                  }}
                >
                  {report.severity}
                </span>

              </div>

              <p style={styles.details}>
                {report.hazard} •{" "}
                {report.population.toLocaleString()} people
              </p>

              <p style={styles.condition}>
                <strong>Field observation:</strong>{" "}
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
                    ? "#15803d"
                    : "#b45309",
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
                  FIELD VERIFICATION REPORT
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
                  {selectedReport.population.toLocaleString()}
                </strong>
              </div>

              <div style={styles.detailBox}>
                <span>Risk Level</span>
                <strong>{selectedReport.severity}</strong>
              </div>

            </div>

            <div style={styles.modalSection}>

              <h3>Ground Observation</h3>

              <p>
                {selectedReport.condition}
              </p>

            </div>

            <div style={styles.modalSection}>

              <h3>Officer Recommendation</h3>

              <p>
                {selectedReport.recommendation}
              </p>

            </div>

            <div style={styles.modalSection}>

              <h3>Verification Status</h3>

              <p>
                {selectedReport.verification}
              </p>

            </div>

            {selectedReport.verification === "Pending" && (

              <button
                style={styles.verifyButton}
                onClick={() => {
                  verifyReport(selectedReport.id);
                  setSelectedReport({
                    ...selectedReport,
                    verification: "Completed",
                    condition:
                      "Ground verification completed. Risk condition confirmed.",
                  });
                }}
              >
                Mark as Verified
              </button>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

const styles = {

  page: {
    padding: "30px",
    color: "#172033",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
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
    fontWeight: "700",
  },

  subtitle: {
    color: "#64748b",
    margin: 0,
    fontSize: "14px",
  },

  live: {
    padding: "10px 16px",
    borderRadius: "20px",
    background: "#eff6ff",
    color: "#1d4ed8",
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
    padding: "20px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
  },

  cardLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    margin: 0,
  },

  cardNumber: {
    fontSize: "30px",
    margin: "12px 0 4px",
  },

  cardText: {
    color: "#94a3b8",
    fontSize: "12px",
    margin: 0,
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "25px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: "#64748b",
    margin: "6px 0 0",
    fontSize: "13px",
  },

  reportCount: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },

  report: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "20px 0",
    borderTop: "1px solid #e5e7eb",
  },

  reportIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#eff6ff",
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
  },

  habitation: {
    margin: 0,
    fontSize: "16px",
  },

  severity: {
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "11px",
    fontWeight: "700",
  },

  details: {
    color: "#475569",
    fontSize: "13px",
    margin: "6px 0",
  },

  condition: {
    color: "#64748b",
    fontSize: "12px",
    margin: "7px 0",
    lineHeight: "1.5",
  },

  meta: {
    display: "flex",
    gap: "18px",
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "8px",
  },

  status: {
    minWidth: "100px",
    fontSize: "12px",
    fontWeight: "700",
  },

  viewButton: {
    border: "1px solid #cbd5e1",
    padding: "9px 14px",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#172033",
    cursor: "pointer",
    fontWeight: "600",
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

  step: {
    display: "flex",
    gap: "12px",
    padding: "15px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#f8fafc",
  },

  stepNumber: {
    width: "35px",
    height: "35px",
    borderRadius: "8px",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    flexShrink: 0,
  },

  stepTitle: {
    margin: "2px 0 5px",
    fontSize: "13px",
  },

  stepText: {
    margin: 0,
    color: "#64748b",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modal: {
    width: "700px",
    maxWidth: "100%",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "18px",
  },

  modalLabel: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "700",
    letterSpacing: "1px",
    margin: 0,
  },

  modalTitle: {
    margin: "5px 0 0",
    fontSize: "24px",
  },

  closeButton: {
    border: "none",
    background: "#f1f5f9",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    fontSize: "22px",
    cursor: "pointer",
  },

  modalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "20px",
  },

  detailBox: {
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "9px",
  },

  modalSection: {
    marginTop: "20px",
  },

  verifyButton: {
    marginTop: "20px",
    border: "none",
    padding: "11px 18px",
    borderRadius: "8px",
    background: "#172033",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default FieldReports;