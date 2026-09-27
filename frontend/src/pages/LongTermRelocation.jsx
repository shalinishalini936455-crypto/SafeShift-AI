import { useEffect, useMemo, useState } from "react";
import { getHabitations, getSafeSites } from "../services/api";
import Icon from "../components/Icons";

/* ============================================================
   FLEXIBLE FIELD READERS
   Backend field names can vary slightly, so each getter tries
   a few likely names before falling back to a placeholder.
   If these don't match your actual API response, tell me the
   real field names and I'll swap them in directly.
============================================================ */

const hId = (h) => h.id ?? h._id ?? h.habitation_id;
const hName = (h) =>
  h.name || h.habitation_name || h.village_name || h.village || `Habitation ${hId(h) ?? ""}`;
const hDistrict = (h) => h.district || h.block || h.taluk || "";
const hRisk = (h) => String(h.risk_level || h.risk || "").toLowerCase();
const hPopulation = (h) =>
  Number(h.population ?? h.total_population ?? h.people ?? 0);
const hLat = (h) => h.latitude ?? h.lat ?? null;
const hLng = (h) => h.longitude ?? h.lng ?? h.lon ?? null;
const hRiskScore = (h) => h.risk_score ?? h.score ?? null;

const sId = (s) => s.id ?? s._id ?? s.site_id;
const sName = (s) => s.name || s.site_name || `Site ${sId(s) ?? ""}`;
const sCapacity = (s) =>
  Number(s.available_capacity ?? s.capacity ?? s.total_capacity ?? 0);
const sRisk = (s) => String(s.risk_level || s.risk || "").toLowerCase();
const sLat = (s) => s.latitude ?? s.lat ?? null;
const sLng = (s) => s.longitude ?? s.lng ?? s.lon ?? null;
const sStatus = (s) => s.availability || s.status || "Available";

/* Haversine distance in km, used only when both points have coordinates */
function distanceKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null)) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* Risk -> relocation tier. Adjust this mapping if your backend
   already has an explicit "urgency" or "timeline" field. */
function tierOf(habitation) {
  const risk = hRisk(habitation);
  if (risk === "critical") return "immediate";
  if (risk === "high") return "short";
  if (risk === "medium") return "medium";
  return "long"; // low / unknown risk -> long-term monitoring
}

const TIERS = [
  { key: "immediate", label: "Immediate", window: "0–72 hours", color: "#ef4444" },
  { key: "short", label: "Short-Term", window: "1–4 weeks", color: "#f59e0b" },
  { key: "medium", label: "Medium-Term", window: "1–6 months", color: "#facc15" },
  { key: "long", label: "Long-Term", window: "6+ months", color: "#22c55e" },
];

/* Find the best safe site for a habitation: enough capacity,
   preferring lower risk and shorter distance when coordinates exist. */
function bestSiteFor(habitation, sites) {
  const pop = hPopulation(habitation);
  const candidates = sites.filter((s) => sCapacity(s) >= pop || pop === 0);
  const pool = candidates.length > 0 ? candidates : sites;
  if (pool.length === 0) return null;

  const hLatV = hLat(habitation);
  const hLngV = hLng(habitation);
  const riskOrder = { low: 0, medium: 1, high: 2, critical: 3, "": 1 };

  return [...pool].sort((a, b) => {
    const distA = distanceKm(hLatV, hLngV, sLat(a), sLng(a));
    const distB = distanceKm(hLatV, hLngV, sLat(b), sLng(b));
    if (distA != null && distB != null && distA !== distB) return distA - distB;

    const riskA = riskOrder[sRisk(a)] ?? 1;
    const riskB = riskOrder[sRisk(b)] ?? 1;
    if (riskA !== riskB) return riskA - riskB;

    return sCapacity(b) - sCapacity(a);
  })[0];
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

function LongTermRelocation() {
  const [habitations, setHabitations] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTier, setActiveTier] = useState("immediate");
  const [selectedHabitationId, setSelectedHabitationId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const [hRes, sRes] = await Promise.all([getHabitations(), getSafeSites()]);
        const hList = hRes?.data?.data || hRes?.data || [];
        const sList = sRes?.data?.data || sRes?.data || [];

        setHabitations(Array.isArray(hList) ? hList : []);
        setSites(Array.isArray(sList) ? sList : []);
      } catch (err) {
        console.error("Relocation plan load error:", err);
        setError("Unable to load habitations and safe sites from the backend.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* group habitations by tier */
  const grouped = useMemo(() => {
    const map = { immediate: [], short: [], medium: [], long: [] };
    for (const h of habitations) {
      map[tierOf(h)].push(h);
    }
    // most critical first within each tier, by risk score if present
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => (hRiskScore(b) ?? 0) - (hRiskScore(a) ?? 0));
    }
    return map;
  }, [habitations]);

  const selectedHabitation = useMemo(
    () => habitations.find((h) => hId(h) === selectedHabitationId) || null,
    [habitations, selectedHabitationId]
  );

  const recommendedSite = useMemo(
    () => (selectedHabitation ? bestSiteFor(selectedHabitation, sites) : null),
    [selectedHabitation, sites]
  );

  if (loading) {
    return (
      <div className="relocation-page">
        <div className="rp-card">
          <h1>Relocation Plan</h1>
          <p>Loading habitations and safe sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relocation-page">

      {/* PAGE HEADER */}
      <div className="rp-card">
        <h1>Relocation Plan</h1>
        <p>
          Immediate, short-term, medium-term and long-term relocation
          recommendations, generated from live habitation risk and safe-site
          capacity data.
        </p>
      </div>

      {/* PROTOTYPE NOTICE */}
      <div className="rp-notice">
        <strong><Icon name="alert" size={15} /> Decision Support Prototype</strong>
        <p>
          The system generates recommendations for authority review. Final
          relocation decisions remain with the responsible authority.
        </p>
      </div>

      {error && (
        <div className="rp-notice rp-notice-error">
          <strong><Icon name="alert" size={15} /> Data issue</strong>
          <p>{error}</p>
        </div>
      )}

      {/* TIER SUMMARY STRIP */}
      <div className="rp-tier-strip">
        {TIERS.map((tier) => (
          <button
            key={tier.key}
            className={`rp-tier-pill ${activeTier === tier.key ? "active" : ""}`}
            style={{ "--tier-color": tier.color }}
            onClick={() => setActiveTier(tier.key)}
          >
            <span className="rp-tier-count">{grouped[tier.key].length}</span>
            <span className="rp-tier-name">{tier.label}</span>
            <span className="rp-tier-window">{tier.window}</span>
          </button>
        ))}
      </div>

      {/* IMMEDIATE / SHORT / MEDIUM: habitation lists */}
      {activeTier !== "long" && (
        <div className="rp-card">
          <h2>
            {TIERS.find((t) => t.key === activeTier).label} Relocation
            <span className="rp-tier-subtitle">
              {" "}— {TIERS.find((t) => t.key === activeTier).window}
            </span>
          </h2>

          {grouped[activeTier].length === 0 ? (
            <p className="rp-body-text">
              No habitations currently fall in this tier.
            </p>
          ) : (
            <div className="rp-habitation-list">
              {grouped[activeTier].map((h) => {
                const site = bestSiteFor(h, sites);
                const dist =
                  site && distanceKm(hLat(h), hLng(h), sLat(site), sLng(site));

                return (
                  <div className="rp-hab-row" key={hId(h)}>
                    <div className="rp-hab-main">
                      <div className="rp-hab-name">
                        <Icon name="home" size={16} /> {hName(h)}
                      </div>
                      <div className="rp-hab-meta">
                        {hDistrict(h) && <span>{hDistrict(h)}</span>}
                        {hPopulation(h) > 0 && (
                          <span>{hPopulation(h).toLocaleString("en-IN")} people</span>
                        )}
                        <span className={`rp-risk-badge ${hRisk(h)}`}>
                          {hRisk(h) || "unknown"} risk
                        </span>
                      </div>
                    </div>

                    <div className="rp-hab-site">
                      {site ? (
                        <>
                          <div className="rp-hab-site-name">
                            <Icon name="pin" size={14} /> {sName(site)}
                          </div>
                          <div className="rp-hab-site-meta">
                            {sCapacity(site) > 0 &&
                              `Capacity ${sCapacity(site).toLocaleString("en-IN")}`}
                            {dist != null && ` • ${dist.toFixed(1)} km`}
                          </div>
                        </>
                      ) : (
                        <div className="rp-hab-site-meta">No matching safe site found</div>
                      )}
                    </div>

                    <button
                      className="rp-btn-outline"
                      onClick={() => {
                        setSelectedHabitationId(hId(h));
                        setActiveTier("long");
                      }}
                    >
                      View Full Plan
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LONG-TERM: detailed generator */}
      {activeTier === "long" && (
        <>
          <div className="rp-card">
            <h2>Long-Term Resettlement Plan</h2>

            <label className="rp-label">Habitation</label>

            <select
              value={selectedHabitationId ?? ""}
              onChange={(e) =>
                setSelectedHabitationId(
                  e.target.value ? Number(e.target.value) || e.target.value : null
                )
              }
              className="rp-select"
            >
              <option value="">Select a habitation…</option>
              {habitations.map((h) => (
                <option key={hId(h)} value={hId(h)}>
                  {hName(h)} — {hRisk(h) || "unknown"} risk
                  {hDistrict(h) ? ` (${hDistrict(h)})` : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedHabitation && (
            <>
              {/* PLAN SUMMARY */}
              <div className="rp-card">
                <div className="rp-summary-head">
                  <div>
                    <h2>Recommended Long-Term Relocation Plan</h2>
                    <p>AI-assisted recommendation for authority verification</p>
                  </div>
                  <span className="rp-pending-badge">PENDING VERIFICATION</span>
                </div>
              </div>

              {/* SUMMARY CARDS */}
              <div className="rp-info-grid">
                <InfoCard
                  title="Habitation"
                  value={hName(selectedHabitation)}
                  description={`${hRisk(selectedHabitation) || "unknown"} risk area`}
                />
                <InfoCard
                  title="Population"
                  value={
                    hPopulation(selectedHabitation) > 0
                      ? hPopulation(selectedHabitation).toLocaleString("en-IN")
                      : "Not provided"
                  }
                  description="People requiring long-term planning"
                />
                <InfoCard
                  title="Risk Score"
                  value={
                    hRiskScore(selectedHabitation) != null
                      ? `${hRiskScore(selectedHabitation)} / 100`
                      : hRisk(selectedHabitation) || "Unknown"
                  }
                  description="Habitation risk assessment"
                />
                <InfoCard
                  title="Priority"
                  value={TIERS.find((t) => t.key === tierOf(selectedHabitation)).label}
                  description="Recommended relocation window"
                />
              </div>

              {/* RECOMMENDED SITE */}
              <div className="rp-card">
                <h2>Recommended Resettlement Site</h2>

                {recommendedSite ? (
                  <div className="rp-detail-grid">
                    <Detail title="Site" value={sName(recommendedSite)} />
                    <Detail
                      title="Distance"
                      value={
                        distanceKm(
                          hLat(selectedHabitation),
                          hLng(selectedHabitation),
                          sLat(recommendedSite),
                          sLng(recommendedSite)
                        ) != null
                          ? `${distanceKm(
                              hLat(selectedHabitation),
                              hLng(selectedHabitation),
                              sLat(recommendedSite),
                              sLng(recommendedSite)
                            ).toFixed(1)} km`
                          : "Not available"
                      }
                    />
                    <Detail
                      title="Capacity"
                      value={
                        sCapacity(recommendedSite) > 0
                          ? `${sCapacity(recommendedSite).toLocaleString("en-IN")} people`
                          : "Not provided"
                      }
                    />
                    <Detail title="Site Risk" value={sRisk(recommendedSite) || "Unknown"} />
                    <Detail title="Availability" value={sStatus(recommendedSite)} />
                  </div>
                ) : (
                  <p className="rp-body-text">
                    No safe site data is available to recommend a site for this
                    habitation.
                  </p>
                )}
              </div>

              {/* WHY THIS SITE */}
              <div className="rp-card">
                <h2>Why This Site Was Recommended</h2>
                <ul className="rp-list">
                  <li>Lower disaster risk compared with the current habitation.</li>
                  <li>Sufficient capacity for the affected population, where data is available.</li>
                  <li>Shortest available distance from the existing habitation.</li>
                  <li>Suitable location for long-term settlement.</li>
                </ul>
              </div>

              {/* PROCESS */}
              <div className="rp-card">
                <h2>Long-Term Resettlement Process</h2>

                <ProcessStep number="1" title="Authority Verification"
                  text="Verify hazard assessment, population information and relocation requirement." />
                <ProcessStep number="2" title="Site Verification"
                  text="Verify land availability, ownership, accessibility and site suitability." />
                <ProcessStep number="3" title="Community Consultation"
                  text="Consult affected households and identify their relocation requirements." />
                <ProcessStep number="4" title="Infrastructure Preparation"
                  text="Prepare housing, roads, water, electricity, sanitation and essential facilities." />
                <ProcessStep number="5" title="Household Allocation"
                  text="Map affected households to available housing or plots in the resettlement site." />
                <ProcessStep number="6" title="Phased Relocation"
                  text="Relocate households in planned phases while maintaining essential services." />
                <ProcessStep number="7" title="Post-Settlement Monitoring"
                  text="Monitor the new settlement and identify issues after relocation." />
              </div>

              {/* AUTHORITY ACTION */}
              <div className="rp-card">
                <h2>Authority Verification</h2>

                <p className="rp-body-text">
                  This recommendation is not an automatic relocation decision.
                  The responsible authority must verify the recommendation
                  before implementation.
                </p>

                <div className="rp-actions">
                  <button
                    className="rp-btn-approve"
                    onClick={() => alert("Plan marked for authority approval.")}
                  >
                    Approve Recommendation
                  </button>

                  <button
                    className="rp-btn-revise"
                    onClick={() => alert("Plan sent for revision.")}
                  >
                    Request Revision
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}


/* INFORMATION CARD */
function InfoCard({ title, value, description }) {
  return (
    <div className="rp-info-card">
      <p className="rp-info-title">{title}</p>
      <h2>{value}</h2>
      <p className="rp-info-desc">{description}</p>
    </div>
  );
}

/* DETAIL */
function Detail({ title, value }) {
  return (
    <div className="rp-detail">
      <strong>{title}</strong>
      <p>{value}</p>
    </div>
  );
}

/* PROCESS STEP */
function ProcessStep({ number, title, text }) {
  return (
    <div className="rp-step">
      <div className="rp-step-number">{number}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default LongTermRelocation;
