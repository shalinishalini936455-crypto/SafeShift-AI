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
                style={styles.cancelButtonLight}
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
   STYLES — glassmorphism, matches
   RelocationPriority / RedZone / Habitations
========================= */

const glassCard = {
  background: "rgba(255, 255, 255, 0.12)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "12px",
  backdropFilter: "blur(24px) saturate(150%)",
  WebkitBackdropFilter: "blur(24px) saturate(150%)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
};

const styles = {
  page: {
    padding: "30px",
    minHeight: "calc(100vh - 82px)",
    color: "#ffffff",
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

  overline: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#a8b3c4",
    marginBottom: "6px",
  },

  title: {
    margin: "0",
    fontSize: "30px",
    fontWeight: "800",
    color: "#ffffff",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#d7dee6",
    fontSize: "14px",
  },

  createButton: {
    border: "1px solid rgba(255, 255, 255, 0.25)",
    background: "rgba(22, 163, 74, 0.85)",
    color: "white",
    padding: "13px 20px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "14px",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  summaryCard: {
    ...glassCard,
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "rgba(255, 255, 255, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  summaryLabel: {
    color: "#b9c2cf",
    fontSize: "13px",
  },

  summaryValue: {
    fontSize: "27px",
    fontWeight: "800",
    margin: "4px 0",
    color: "#ffffff",
  },

  summaryDescription: {
    fontSize: "12px",
    color: "#a8b3c4",
  },

  formCard: {
    ...glassCard,
    padding: "22px",
    marginBottom: "22px",
  },

  plansCard: {
    ...glassCard,
    marginBottom: "22px",
    overflow: "hidden",
  },

  sectionHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: "0",
    fontSize: "19px",
    fontWeight: "800",
    color: "#ffffff",
  },

  sectionDescription: {
    margin: "5px 0 0",
    color: "#b9c2cf",
    fontSize: "13px",
  },

  demoBadge: {
    background: "rgba(255, 176, 64, 0.18)",
    color: "#ffd699",
    border: "1px solid rgba(255, 176, 64, 0.35)",
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "800",
  },

  backendBadge: {
    background: "rgba(34, 197, 94, 0.18)",
    color: "#a8f0c6",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "800",
  },

  emptyMessage: {
    padding: "35px 24px",
    textAlign: "center",
    color: "#b9c2cf",
    fontSize: "13px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    padding: "24px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#e8ecf1",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "8px",
    padding: "11px 12px",
    fontSize: "13px",
    outline: "none",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "18px 24px 0",
  },

  cancelButton: {
    border: "1px solid rgba(255, 255, 255, 0.4)",
    background: "transparent",
    color: "#ffffff",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  cancelButtonLight: {
    border: "1px solid rgba(255, 255, 255, 0.4)",
    background: "transparent",
    color: "#e8ecf1",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveButton: {
    border: "none",
    background: "rgba(22, 163, 74, 0.85)",
    color: "white",
    padding: "10px 18px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  activeCount: {
    background: "rgba(34, 197, 94, 0.18)",
    color: "#a8f0c6",
    border: "1px solid rgba(34, 197, 94, 0.35)",
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
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
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
    background: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  planId: {
    fontSize: "10px",
    color: "#a8b3c4",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },

  planTitle: {
    fontSize: "14px",
    margin: "2px 0 5px",
    fontWeight: "800",
    color: "#ffffff",
  },

  planMeta: {
    fontSize: "11px",
    color: "#b9c2cf",
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
    background: "rgba(239, 68, 68, 0.22)",
    color: "#ff9c9c",
  },

  highBadge: {
    background: "rgba(245, 158, 11, 0.22)",
    color: "#ffcf9e",
  },

  mediumBadge: {
    background: "rgba(250, 204, 21, 0.2)",
    color: "#ffe49e",
  },

  progressBox: {
    minWidth: "100px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#b9c2cf",
    marginBottom: "6px",
  },

  progressBackground: {
    width: "100%",
    height: "7px",
    background: "rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #4ade80)",
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
    background: "rgba(34, 197, 94, 0.2)",
    color: "#a8f0c6",
  },

  progressStatus: {
    background: "rgba(59, 130, 246, 0.2)",
    color: "#93c5fd",
  },

  completedStatus: {
    background: "rgba(45, 212, 191, 0.2)",
    color: "#8fe9dd",
  },

  pendingStatus: {
    background: "rgba(245, 158, 11, 0.22)",
    color: "#ffcf9e",
  },

  actions: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  },

  viewButton: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "#e8ecf1",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    padding: "8px 11px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "11px",
  },

  approveButton: {
    background: "rgba(34, 197, 94, 0.25)",
    color: "#a8f0c6",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    padding: "8px 11px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "11px",
  },

  startButton: {
    background: "rgba(59, 130, 246, 0.25)",
    color: "#bcdcff",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    padding: "8px 11px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "11px",
  },

  completeButton: {
    background: "rgba(45, 212, 191, 0.25)",
    color: "#8fe9dd",
    border: "1px solid rgba(45, 212, 191, 0.4)",
    padding: "8px 11px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "11px",
  },

  workflowCard: {
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(96, 165, 250, 0.3)",
    borderRadius: "12px",
    padding: "23px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    marginBottom: "22px",
  },

  workflowTitle: {
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
    marginBottom: "18px",
  },

  aiIcon: {
    width: "48px",
    height: "48px",
    flexShrink: 0,
    borderRadius: "10px",
    background: "linear-gradient(135deg, #2f6df6, #60a5fa)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  workflowGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "12px",
  },

  workflowStep: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
  },

  stepNumber: {
    fontSize: "12px",
    fontWeight: "900",
    color: "#93c5fd",
  },

  stepTitle: {
    margin: "0 0 4px",
    fontSize: "14px",
    color: "#ffffff",
  },

  stepText: {
    margin: "0",
    color: "#d7dee6",
    fontSize: "11px",
    lineHeight: "1.5",
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
    width: "100%",
    maxWidth: "650px",
    background: "rgba(20, 28, 45, 0.85)",
    overflow: "hidden",
    color: "#ffffff",
  },

  modalHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  modalTitle: {
    margin: "0",
    fontSize: "20px",
    fontWeight: "800",
    color: "#ffffff",
  },

  modalId: {
    margin: "4px 0 0",
    color: "#a8b3c4",
    fontSize: "11px",
    fontWeight: "700",
  },

  closeButton: {
    width: "32px",
    height: "32px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "7px",
    fontSize: "21px",
    cursor: "pointer",
    color: "#ffffff",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    margin: "20px 24px",
  },

  detailItem: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  detailLabel: {
    color: "#a8b3c4",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  detailValue: {
    fontSize: "13px",
    color: "#ffffff",
  },

  modalProgress: {
    padding: "0 24px 20px",
  },

  modalProgressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "12px",
    color: "#ffffff",
  },

  modalActions: {
    padding: "18px 24px",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
  },

  approveButtonLarge: {
    border: "1px solid rgba(34, 197, 94, 0.4)",
    background: "rgba(34, 197, 94, 0.25)",
    color: "#a8f0c6",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  startButtonLarge: {
    border: "1px solid rgba(59, 130, 246, 0.4)",
    background: "rgba(59, 130, 246, 0.25)",
    color: "#bcdcff",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },

  completeButtonLarge: {
    border: "1px solid rgba(45, 212, 191, 0.4)",
    background: "rgba(45, 212, 191, 0.25)",
    color: "#8fe9dd",
    padding: "10px 16px",
    borderRadius: "7px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default ActionPlans;
