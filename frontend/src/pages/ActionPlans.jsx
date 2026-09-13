import { useEffect, useState } from "react";
import {
  getHabitations,
  getRedZones,
  getSafeSites,
} from "../services/api";

function ActionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [habitations, setHabitations] = useState([]);
  const [redZones, setRedZones] = useState([]);
  const [safeSites, setSafeSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [plans, setPlans] = useState([]);

  const [form, setForm] = useState({
    title: "",
    location: "",
    hazard: "Flood",
    priority: "High",
    people: "",
    destination: "",
  });

  useEffect(() => {
    Promise.all([
      getHabitations(),
      getRedZones(),
      getSafeSites(),
    ])
      .then(([habitationResponse, redZoneResponse, safeSiteResponse]) => {
        const habitationsData = habitationResponse.data || [];
        const redZonesData = redZoneResponse.data || [];
        const safeSitesData = safeSiteResponse.data || [];

        setHabitations(habitationsData);
        setRedZones(redZonesData);
        setSafeSites(safeSitesData);

        const generatedPlans = habitationsData
          .map((habitation) => {
            const districtZone = redZonesData.find(
              (zone) => zone.district === habitation.district
            );

            const safeSite = safeSitesData.find(
              (site) =>
                Number(site.available_capacity || 0) >=
                Number(habitation.population || 0)
            );

            let priority = "Medium";

            if (habitation.risk_level === "Critical") {
              priority = "Immediate";
            } else if (habitation.risk_level === "High") {
              priority = "High";
            } else if (habitation.risk_level === "Medium") {
              priority = "Medium";
            } else {
              priority = "Low";
            }

            let status = "Pending Approval";

            if (priority === "Immediate") {
              status = "Approved";
            }

            return {
              id: `ACT-${String(habitation.id).padStart(3, "0")}`,
              title:
                priority === "Immediate"
                  ? `Emergency Relocation – ${habitation.name}`
                  : `Relocation Action – ${habitation.name}`,
              location: habitation.name,
              district: habitation.district,
              hazard: districtZone
                ? districtZone.hazard_type
                : "Not available",
              priority,
              people: Number(habitation.population || 0),
              destination: safeSite
                ? safeSite.site_name
                : "No suitable safe site available",
              status,
              progress: status === "Approved" ? 0 : 0,
              riskLevel: habitation.risk_level,
              severity: districtZone
                ? districtZone.severity
                : "Not available",
            };
          })
          .sort((a, b) => {
            const order = {
              Immediate: 1,
              High: 2,
              Medium: 3,
              Low: 4,
            };

            return order[a.priority] - order[b.priority];
          });

        setPlans(generatedPlans);
      })
      .catch((error) => {
        console.error("Action Plans API Error:", error);
        setApiError(
          "Unable to load backend data. Please check that the backend is running."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createPlan = (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.location ||
      !form.people ||
      !form.destination
    ) {
      alert("Please fill all fields.");
      return;
    }

    const newPlan = {
      id: `ACT-${String(plans.length + 1).padStart(3, "0")}`,
      title: form.title,
      location: form.location,
      hazard: form.hazard,
      priority: form.priority,
      people: Number(form.people),
      destination: form.destination,
      status: "Pending Approval",
      progress: 0,
      riskLevel: form.priority,
      severity: form.priority,
    };

    setPlans([...plans, newPlan]);

    setForm({
      title: "",
      location: "",
      hazard: "Flood",
      priority: "High",
      people: "",
      destination: "",
    });

    setShowForm(false);
  };

  const approvePlan = (id) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              status: "Approved",
            }
          : plan
      )
    );

    setSelectedPlan(null);
  };

  const startAction = (id) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              status: "In Progress",
              progress: 50,
            }
          : plan
      )
    );

    setSelectedPlan(null);
  };

  const completeAction = (id) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              status: "Completed",
              progress: 100,
            }
          : plan
      )
    );

    setSelectedPlan(null);
  };

  const totalPeople = plans.reduce(
    (total, plan) => total + Number(plan.people || 0),
    0
  );

  const immediatePlans = plans.filter(
    (plan) => plan.priority === "Immediate"
  ).length;

  const pendingPlans = plans.filter(
    (plan) => plan.status === "Pending Approval"
  ).length;

  const activePlans = plans.filter(
    (plan) => plan.status === "In Progress"
  ).length;

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.overline}>RELOCATION OPERATIONS</div>

          <h1 style={styles.title}>Action Plans</h1>

          <p style={styles.subtitle}>
            Create, approve and monitor disaster relocation action plans.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.createButton}
        >
          {showForm ? "✕ Close Form" : "+ Create Action Plan"}
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.summaryGrid}>

        <SummaryCard
          icon="📋"
          label="Total Plans"
          value={plans.length}
          description="Relocation plans"
        />

        <SummaryCard
          icon="🚨"
          label="Immediate"
          value={immediatePlans}
          description="Urgent action"
        />

        <SummaryCard
          icon="👥"
          label="People Covered"
          value={totalPeople.toLocaleString()}
          description="People in plans"
        />

        <SummaryCard
          icon="⏳"
          label="Pending Approval"
          value={pendingPlans}
          description="Awaiting approval"
        />

      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div style={styles.formCard}>

          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.overline}>NEW OPERATION</div>

              <h2 style={styles.sectionTitle}>
                Create Action Plan
              </h2>

              <p style={styles.sectionDescription}>
                Define relocation actions for a high-risk habitation.
              </p>
            </div>

            <span style={styles.backendBadge}>
              BACKEND DATA
            </span>
          </div>

          <form onSubmit={createPlan}>

            <div style={styles.formGrid}>

              <FormInput
                label="Plan Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Flood Evacuation Plan"
              />

              <FormInput
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Example: River Bank Area"
              />

              <FormSelect
                label="Hazard Type"
                name="hazard"
                value={form.hazard}
                onChange={handleChange}
                options={[
                  "Flood",
                  "Landslide",
                  "Coastal Erosion",
                  "Cloudburst",
                ]}
              />

              <FormSelect
                label="Priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                options={[
                  "Immediate",
                  "High",
                  "Medium",
                ]}
              />

              <FormInput
                label="People at Risk"
                name="people"
                type="number"
                value={form.people}
                onChange={handleChange}
                placeholder="Number of people"
              />

              <FormInput
                label="Safe Destination"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="Example: Government School"
              />

            </div>

            <div style={styles.formActions}>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.saveButton}
              >
                Create Plan
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ACTIVE PLANS */}
      <div style={styles.plansCard}>

        <div style={styles.sectionHeader}>

          <div>
            <div style={styles.overline}>
              RELOCATION WORKFLOW
            </div>

            <h2 style={styles.sectionTitle}>
              Active Action Plans
            </h2>

            <p style={styles.sectionDescription}>
              Monitor the current status of planned relocation operations.
            </p>
          </div>

          <div style={styles.activeCount}>
            {activePlans} Active
          </div>

        </div>

        <div style={styles.planList}>

          {loading ? (
            <div style={styles.emptyMessage}>
              Loading action plans from backend...
            </div>
          ) : apiError ? (
            <div style={styles.emptyMessage}>
              {apiError}
            </div>
          ) : plans.length === 0 ? (
            <div style={styles.emptyMessage}>
              No action plans available.
            </div>
          ) : (
            plans.map((plan) => (

            <div
              key={plan.id}
              style={styles.planRow}
            >

              {/* PLAN INFO */}
              <div style={styles.planInfo}>

                <div style={styles.planIcon}>
                  📋
                </div>

                <div>

                  <div style={styles.planId}>
                    {plan.id}
                  </div>

                  <h3 style={styles.planTitle}>
                    {plan.title}
                  </h3>

                  <div style={styles.planMeta}>
                    📍 {plan.location}
                    <span>•</span>
                    ⚠️ {plan.hazard}
                    <span>•</span>
                    👥 {plan.people.toLocaleString()} people
                  </div>

                </div>

              </div>

              {/* PRIORITY */}
              <div>
                <span
                  style={{
                    ...styles.priorityBadge,
                    ...(plan.priority === "Immediate"
                      ? styles.immediateBadge
                      : plan.priority === "High"
                      ? styles.highBadge
                      : styles.mediumBadge),
                  }}
                >
                  {plan.priority}
                </span>
              </div>

              {/* PROGRESS */}
              <div style={styles.progressBox}>

                <div style={styles.progressHeader}>
                  <span>Progress</span>
                  <strong>{plan.progress}%</strong>
                </div>

                <div style={styles.progressBackground}>

                  <div
                    style={{
                      ...styles.progressBar,
                      width: `${plan.progress}%`,
                    }}
                  />

                </div>

              </div>

              {/* STATUS */}
              <div>

                <span
                  style={{
                    ...styles.statusBadge,
                    ...(plan.status === "Approved"
                      ? styles.approvedStatus
                      : plan.status === "In Progress"
                      ? styles.progressStatus
                      : plan.status === "Completed"
                      ? styles.completedStatus
                      : styles.pendingStatus),
                  }}
                >
                  {plan.status}
                </span>

              </div>

              {/* ACTIONS */}
              <div style={styles.actions}>

                <button
                  onClick={() => setSelectedPlan(plan)}
                  style={styles.viewButton}
                >
                  View
                </button>

                {plan.status === "Pending Approval" && (
                  <button
                    onClick={() => approvePlan(plan.id)}
                    style={styles.approveButton}
                  >
                    Approve
                  </button>
                )}

                {plan.status === "Approved" && (
                  <button
                    onClick={() => startAction(plan.id)}
                    style={styles.startButton}
                  >
                    Start Action
                  </button>
                )}

                {plan.status === "In Progress" && (
                  <button
                    onClick={() => completeAction(plan.id)}
                    style={styles.completeButton}
                  >
                    Complete
                  </button>
                )}

              </div>

            </div>

            ))
          )}

        </div>
      </div>

      {/* WORKFLOW */}
      <div style={styles.workflowCard}>

        <div style={styles.workflowTitle}>
          <div style={styles.aiIcon}>
            AI
          </div>

          <div>
            <div style={styles.overline}>
              ACTION WORKFLOW
            </div>

            <h2 style={styles.sectionTitle}>
              Relocation Action Process
            </h2>

            <p style={styles.sectionDescription}>
              SafeShift AI supports the complete decision-to-action workflow.
            </p>
          </div>
        </div>

        <div style={styles.workflowGrid}>

          <WorkflowStep
            number="01"
            title="Identify"
            text="Identify high-risk habitations."
          />

          <WorkflowStep
            number="02"
            title="Plan"
            text="Create relocation action plan."
          />

          <WorkflowStep
            number="03"
            title="Approve"
            text="Authority reviews and approves."
          />

          <WorkflowStep
            number="04"
            title="Execute"
            text="Start and monitor relocation."
          />

        </div>

      </div>

      {/* DETAIL MODAL */}
      {selectedPlan && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>
                <div style={styles.overline}>
                  ACTION PLAN DETAILS
                </div>

                <h2 style={styles.modalTitle}>
                  {selectedPlan.title}
                </h2>

                <p style={styles.modalId}>
                  {selectedPlan.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                style={styles.closeButton}
              >
                ×
              </button>

            </div>

            <div style={styles.detailGrid}>

              <Detail
                label="Location"
                value={selectedPlan.location}
              />

              <Detail
                label="Hazard"
                value={selectedPlan.hazard}
              />

              <Detail
                label="Priority"
                value={selectedPlan.priority}
              />

              <Detail
                label="People at Risk"
                value={selectedPlan.people.toLocaleString()}
              />

              <Detail
                label="Safe Destination"
                value={selectedPlan.destination}
              />

              <Detail
                label="Status"
                value={selectedPlan.status}
              />

            </div>

            <div style={styles.modalProgress}>

              <div style={styles.modalProgressHeader}>
                <strong>Action Progress</strong>
                <strong>{selectedPlan.progress}%</strong>
              </div>

              <div style={styles.progressBackground}>

                <div
                  style={{
                    ...styles.progressBar,
                    width: `${selectedPlan.progress}%`,
                  }}
                />

              </div>

            </div>

            <div style={styles.modalActions}>

              {selectedPlan.status === "Pending Approval" && (
                <button
                  onClick={() => approvePlan(selectedPlan.id)}
                  style={styles.approveButtonLarge}
                >
                  ✓ Approve Plan
                </button>
              )}

              {selectedPlan.status === "Approved" && (
                <button
                  onClick={() => startAction(selectedPlan.id)}
                  style={styles.startButtonLarge}
                >
                  ▶ Start Action
                </button>
              )}

              {selectedPlan.status === "In Progress" && (
                <button
                  onClick={() => completeAction(selectedPlan.id)}
                  style={styles.completeButtonLarge}
                >
                  ✓ Mark Completed
                </button>
              )}

              <button
                onClick={() => setSelectedPlan(null)}
                style={styles.cancelButton}
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


/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div style={styles.summaryCard}>

      <div style={styles.summaryIcon}>
        {icon}
      </div>

      <div>

        <div style={styles.summaryLabel}>
          {label}
        </div>

        <div style={styles.summaryValue}>
          {value}
        </div>

        <div style={styles.summaryDescription}>
          {description}
        </div>

      </div>

    </div>
  );
}


/* =========================
   FORM INPUT
========================= */

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div style={styles.formGroup}>

      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
      />

    </div>
  );
}


/* =========================
   FORM SELECT
========================= */

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div style={styles.formGroup}>

      <label style={styles.label}>
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        style={styles.input}
      >

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}


/* =========================
   WORKFLOW STEP
========================= */

function WorkflowStep({
  number,
  title,
  text,
}) {
  return (
    <div style={styles.workflowStep}>

      <div style={styles.stepNumber}>
        {number}
      </div>

      <div>

        <h3 style={styles.stepTitle}>
          {title}
        </h3>

        <p style={styles.stepText}>
          {text}
        </p>

      </div>

    </div>
  );
}


/* =========================
   DETAIL
========================= */

function Detail({
  label,
  value,
}) {
  return (
    <div style={styles.detailItem}>

      <span style={styles.detailLabel}>
        {label}
      </span>

      <strong style={styles.detailValue}>
        {value}
      </strong>

    </div>
  );
}


/* =========================
   STYLES
========================= */

const styles = {
  page: {
    padding: "32px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
    color: "#0f172a",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
  },

  overline: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#64748b",
    marginBottom: "6px",
  },

  title: {
    margin: "0",
    fontSize: "30px",
    fontWeight: "800",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  createButton: {
    border: "none",
    background: "#0f766e",
    color: "white",
    padding: "13px 20px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    boxShadow:
      "0 5px 15px rgba(15,118,110,0.18)",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  summaryCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 3px 12px rgba(15,23,42,0.04)",
  },

  summaryIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "10px",
    background: "#f0fdfa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  summaryLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
  },

  summaryValue: {
    fontSize: "25px",
    fontWeight: "800",
    marginTop: "2px",
  },

  summaryDescription: {
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
  },

  formCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    padding: "24px",
    marginBottom: "22px",
    boxShadow:
      "0 3px 12px rgba(15,23,42,0.04)",
  },

  plansCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    marginBottom: "22px",
    overflow: "hidden",
    boxShadow:
      "0 3px 12px rgba(15,23,42,0.04)",
  },

  sectionHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  sectionTitle: {
    margin: "0",
    fontSize: "19px",
    fontWeight: "800",
  },

  sectionDescription: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  demoBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "800",
  },


  backendBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "800",
  },

  emptyMessage: {
    padding: "35px 24px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    padding: "24px 0",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "11px 12px",
    fontSize: "13px",
    outline: "none",
    background: "white",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "18px",
  },

  cancelButton: {
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#475569",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveButton: {
    border: "none",
    background: "#0f766e",
    color: "white",
    padding: "10px 18px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  activeCount: {
    background: "#ecfdf5",
    color: "#047857",
    padding: "7px 12px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "800",
  },

  planList: {
    display: "flex",
    flexDirection: "column",
  },

  planRow: {
    display: "grid",
    gridTemplateColumns:
      "2.2fr 0.8fr 1fr 1fr 1.6fr",
    alignItems: "center",
    gap: "20px",
    padding: "20px 24px",
    borderBottom: "1px solid #eef2f7",
  },

  planInfo: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    minWidth: 0,
  },

  planIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "9px",
    background: "#f0fdfa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  planId: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },

  planTitle: {
    fontSize: "14px",
    margin: "2px 0 5px",
    fontWeight: "800",
  },

  planMeta: {
    fontSize: "11px",
    color: "#64748b",
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  },

  priorityBadge: {
    display: "inline-block",
    padding: "6px 9px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "800",
  },

  immediateBadge: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  highBadge: {
    background: "#ffedd5",
    color: "#c2410c",
  },

  mediumBadge: {
    background: "#fef3c7",
    color: "#a16207",
  },

  progressBox: {
    minWidth: "100px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#64748b",
    marginBottom: "6px",
  },

  progressBackground: {
    width: "100%",
    height: "7px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "#0f766e",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },

  statusBadge: {
    display: "inline-block",
    padding: "6px 9px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  approvedStatus: {
    background: "#dcfce7",
    color: "#15803d",
  },

  progressStatus: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },

  completedStatus: {
    background: "#ccfbf1",
    color: "#0f766e",
  },

  pendingStatus: {
    background: "#fef3c7",
    color: "#92400e",
  },

  actions: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  },

  viewButton: {
    background: "#f8fafc",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "8px 11px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "11px",
  },

  approveButton: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "8px 11px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "11px",
  },

  startButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 11px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "11px",
  },

  completeButton: {
    background: "#0f766e",
    color: "white",
    border: "none",
    padding: "8px 11px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "11px",
  },

  workflowCard: {
    background: "#0f172a",
    color: "white",
    borderRadius: "13px",
    padding: "25px",
    marginBottom: "20px",
  },

  workflowTitle: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "25px",
  },

  aiIcon: {
    width: "45px",
    height: "45px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "900",
  },

  workflowGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "15px",
  },

  workflowStep: {
    display: "flex",
    gap: "12px",
    padding: "15px",
    background: "#1e293b",
    borderRadius: "9px",
    border: "1px solid #334155",
  },

  stepNumber: {
    fontSize: "11px",
    fontWeight: "900",
    color: "#5eead4",
  },

  stepTitle: {
    margin: "0 0 4px",
    fontSize: "14px",
  },

  stepText: {
    margin: "0",
    color: "#94a3b8",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modal: {
    width: "100%",
    maxWidth: "650px",
    background: "white",
    borderRadius: "14px",
    boxShadow:
      "0 25px 60px rgba(15,23,42,0.25)",
    overflow: "hidden",
  },

  modalHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  modalTitle: {
    margin: "0",
    fontSize: "20px",
    fontWeight: "800",
  },

  modalId: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "700",
  },

  closeButton: {
    width: "32px",
    height: "32px",
    border: "none",
    background: "#f1f5f9",
    borderRadius: "7px",
    fontSize: "21px",
    cursor: "pointer",
    color: "#475569",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "1px",
    background: "#e2e8f0",
    margin: "20px 24px",
    border: "1px solid #e2e8f0",
  },

  detailItem: {
    background: "white",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  detailLabel: {
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: "13px",
    color: "#1e293b",
  },

  modalProgress: {
    padding: "0 24px 20px",
  },

  modalProgressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "12px",
  },

  modalActions: {
    padding: "18px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
  },

  approveButtonLarge: {
    border: "none",
    background: "#16a34a",
    color: "white",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  startButtonLarge: {
    border: "none",
    background: "#2563eb",
    color: "white",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  completeButtonLarge: {
    border: "none",
    background: "#0f766e",
    color: "white",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default ActionPlans;