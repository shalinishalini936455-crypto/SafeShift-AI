import { useState } from "react";

function LongTermRelocation() {
  const [planGenerated, setPlanGenerated] = useState(false);
  const [habitation, setHabitation] = useState("Village A");

  const generatePlan = () => {
    setPlanGenerated(true);
  };

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        color: "#1f2937",
      }}
    >
      {/* PAGE HEADER */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px" }}>
          Long-Term Relocation Plan
        </h1>

        <p style={{ color: "#6b7280", marginTop: "8px" }}>
          Generate a recommended long-term resettlement plan for
          authority verification and implementation.
        </p>
      </div>

      {/* PROTOTYPE NOTICE */}
      <div
        style={{
          backgroundColor: "#fff7ed",
          border: "1px solid #fed7aa",
          padding: "18px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <strong>⚠️ Decision Support Prototype</strong>

        <p style={{ marginBottom: 0 }}>
          The system generates recommendations for authority review.
          Final relocation decisions remain with the responsible
          authority.
        </p>
      </div>

      {/* SELECT HABITATION */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>1. Select Habitation</h2>

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
          }}
        >
          Habitation
        </label>

        <select
          value={habitation}
          onChange={(e) => setHabitation(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "16px",
          }}
        >
          <option value="Village A">Village A - Critical Risk</option>
          <option value="Village B">Village B - High Risk</option>
          <option value="Village C">Village C - High Risk</option>
        </select>

        <br />

        <button
          onClick={generatePlan}
          style={{
            marginTop: "20px",
            padding: "12px 22px",
            backgroundColor: "#166534",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Generate Recommended Plan
        </button>
      </div>

      {/* GENERATED PLAN */}
      {planGenerated && (
        <>
          {/* PLAN SUMMARY */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  Recommended Long-Term Relocation Plan
                </h2>

                <p style={{ color: "#6b7280" }}>
                  AI-assisted recommendation for authority verification
                </p>
              </div>

              <span
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#92400e",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                }}
              >
                PENDING VERIFICATION
              </span>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <InfoCard
              title="Habitation"
              value={habitation}
              description="Critical risk area"
            />

            <InfoCard
              title="Population"
              value="1,240"
              description="People requiring long-term planning"
            />

            <InfoCard
              title="Risk Score"
              value="91 / 100"
              description="Critical risk"
            />

            <InfoCard
              title="Priority"
              value="Immediate"
              description="Long-term relocation recommended"
            />
          </div>

          {/* RECOMMENDED SITE */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2>2. Recommended Resettlement Site</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <Detail title="Site ID" value="SITE-R04" />
              <Detail title="Distance" value="4.2 km" />
              <Detail title="Capacity" value="1,800 people" />
              <Detail title="Site Risk" value="Low" />
              <Detail title="Infrastructure" value="Suitable" />
              <Detail title="Availability" value="Available" />
            </div>
          </div>

          {/* REASON FOR RECOMMENDATION */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2>3. Why This Site Was Recommended</h2>

            <ul style={{ lineHeight: "2" }}>
              <li>Lower disaster risk compared with the current habitation.</li>
              <li>Sufficient capacity for the affected population.</li>
              <li>Reasonable distance from the existing habitation.</li>
              <li>Suitable location for long-term settlement.</li>
              <li>Basic infrastructure can be developed at the site.</li>
            </ul>
          </div>

          {/* IMPLEMENTATION PROCESS */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2>4. Long-Term Resettlement Process</h2>

            <ProcessStep
              number="1"
              title="Authority Verification"
              text="Verify hazard assessment, population information and relocation requirement."
            />

            <ProcessStep
              number="2"
              title="Site Verification"
              text="Verify land availability, ownership, accessibility and site suitability."
            />

            <ProcessStep
              number="3"
              title="Community Consultation"
              text="Consult affected households and identify their relocation requirements."
            />

            <ProcessStep
              number="4"
              title="Infrastructure Preparation"
              text="Prepare housing, roads, water, electricity, sanitation and essential facilities."
            />

            <ProcessStep
              number="5"
              title="Household Allocation"
              text="Map affected households to available housing or plots in the resettlement site."
            />

            <ProcessStep
              number="6"
              title="Phased Relocation"
              text="Relocate households in planned phases while maintaining essential services."
            />

            <ProcessStep
              number="7"
              title="Post-Settlement Monitoring"
              text="Monitor the new settlement and identify issues after relocation."
            />
          </div>

          {/* AUTHORITY ACTION */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2>5. Authority Verification</h2>

            <p>
              This recommendation is not an automatic relocation
              decision. The responsible authority must verify the
              recommendation before implementation.
            </p>

            <div style={{ marginTop: "20px" }}>
              <button
                style={{
                  padding: "12px 25px",
                  marginRight: "10px",
                  backgroundColor: "#166534",
                  color: "white",
                  border: "none",
                  borderRadius: "7px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() =>
                  alert("Plan marked for authority approval.")
                }
              >
                ✓ Approve Recommendation
              </button>

              <button
                style={{
                  padding: "12px 25px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "7px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() =>
                  alert("Plan sent for revision.")
                }
              >
                Request Revision
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


/* INFORMATION CARD */

function InfoCard({ title, value, description }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "22px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontWeight: "bold",
        }}
      >
        {title}
      </p>

      <h2 style={{ margin: "10px 0" }}>{value}</h2>

      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {description}
      </p>
    </div>
  );
}


/* DETAIL */

function Detail({ title, value }) {
  return (
    <div
      style={{
        padding: "15px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
      }}
    >
      <strong>{title}</strong>
      <p style={{ marginBottom: 0 }}>{value}</p>
    </div>
  );
}


/* PROCESS STEP */

function ProcessStep({ number, title, text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        marginBottom: "20px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          minWidth: "35px",
          height: "35px",
          borderRadius: "50%",
          backgroundColor: "#166534",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        {number}
      </div>

      <div>
        <h3 style={{ margin: "3px 0 5px" }}>{title}</h3>

        <p style={{ margin: 0, color: "#6b7280" }}>
          {text}
        </p>
      </div>
    </div>
  );
}

export default LongTermRelocation;