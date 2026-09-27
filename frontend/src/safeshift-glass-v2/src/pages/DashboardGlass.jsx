import { useState, useEffect } from "react";

import {
  getDashboard,
  getHabitations,
  getNotifications,
} from "../services/api";

import HazardMap from "./HazardMap";
import { PageHeader } from "../components/GlassLayout";

const EMPTY = {
  total_habitations: 0,
  high_risk_habitations: 0,
  total_red_zones: 0,
  total_safe_sites: 0,
  available_safe_capacity: 0,
  total_relocation_plans: 0,
  unread_notifications: 0,
};

const RISK_ORDER = ["critical", "high", "medium", "low"];
const RISK_COLORS = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#facc15",
  low: "#22c55e",
};

const riskOf = (item) =>
  String(item.risk_level || item.risk || "").toLowerCase();

const fmt = (n) => Number(n ?? 0).toLocaleString("en-IN");

const alertTone = (n) => {
  const level = String(
    n.severity || n.level || n.risk_level || n.priority || ""
  ).toLowerCase();
  if (["critical", "high", "severe"].includes(level)) return "red";
  if (["medium", "moderate"].includes(level)) return "orange";
  return "blue";
};

const timeLabel = (n) => {
  const raw = n.created_at || n.timestamp || n.time;
  if (!raw) return "Live";
  const d = new Date(raw);
  if (isNaN(d)) return "Live";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DashboardGlass({ setActivePage }) {
  const [dashboard, setDashboard] = useState(EMPTY);
  const [habitations, setHabitations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [d, h, n] = await Promise.all([
        getDashboard(),
        getHabitations(),
        getNotifications(),
      ]);

      setDashboard(d?.data || d || EMPTY);
      setHabitations(h?.data || h || []);
      setNotifications(n?.data || n || []);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError("Unable to load dashboard data from backend.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- risk numbers ---------- */
  const riskRows = RISK_ORDER.map((key) => ({
    key,
    label: key[0].toUpperCase() + key.slice(1),
    color: RISK_COLORS[key],
    count: habitations.filter((i) => riskOf(i) === key).length,
  }));
  const totalRisk = riskRows.reduce((sum, r) => sum + r.count, 0);
  const pct = (v) => (totalRisk ? ((v / totalRisk) * 100).toFixed(1) : "0.0");

  /* donut geometry */
  const R = 54;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segments = riskRows.map((r) => {
    const len = totalRisk ? (r.count / totalRisk) * C : 0;
    const seg = { ...r, len, offset: acc };
    acc += len;
    return seg;
  });

  /* most urgent habitations */
  const priorityList = [...habitations]
    .filter((h) => RISK_ORDER.includes(riskOf(h)))
    .sort((a, b) => RISK_ORDER.indexOf(riskOf(a)) - RISK_ORDER.indexOf(riskOf(b)))
    .slice(0, 5);

  const header = (
    <PageHeader
      title="Welcome back, District Officer"
      subtitle="Here's what's happening with disaster risk and relocation today."
    />
  );

  if (loading) {
    return (
      <div className="gd-root">
        {header}
        <div className="gd-loading glass">
          <h3>Loading SafeShift AI</h3>
          <p className="gd-sub">
            Connecting to live disaster monitoring services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gd-root">
      {header}

      {error && (
        <div className="gd-error glass">
          <div>
            <strong>Backend connection issue</strong>
            <p>{error}</p>
          </div>
          <button className="gd-btn" onClick={loadDashboard}>Retry</button>
        </div>
      )}

      {/* ---------- KPI CARDS ---------- */}
      <section className="gd-kpis">
        <div className="gd-kpi glass">
          <div className="gd-kpi-icon gd-tone-red">🏠</div>
          <div>
            <div className="gd-kpi-label">Total Habitations</div>
            <div className="gd-kpi-value">{fmt(dashboard.total_habitations)}</div>
            <div className="gd-kpi-sub">
              High Risk: {fmt(dashboard.high_risk_habitations)}
            </div>
          </div>
        </div>

        <div className="gd-kpi glass">
          <div className="gd-kpi-icon gd-tone-orange">⚠️</div>
          <div>
            <div className="gd-kpi-label">Active Red Zones</div>
            <div className="gd-kpi-value">{fmt(dashboard.total_red_zones)}</div>
            <div className="gd-kpi-sub">Hazard-Affected Zones</div>
          </div>
        </div>

        <div className="gd-kpi glass">
          <div className="gd-kpi-icon gd-tone-green">🛡️</div>
          <div>
            <div className="gd-kpi-label">Safe Sites</div>
            <div className="gd-kpi-value">{fmt(dashboard.total_safe_sites)}</div>
            <div className="gd-kpi-sub">Available Relocation Sites</div>
          </div>
        </div>

        <div className="gd-kpi glass">
          <div className="gd-kpi-icon gd-tone-purple">👥</div>
          <div>
            <div className="gd-kpi-label">Relocation Plans</div>
            <div className="gd-kpi-value">{fmt(dashboard.total_relocation_plans)}</div>
            <div className="gd-kpi-sub">Active decision plans</div>
          </div>
        </div>
      </section>

      {/* ---------- MAIN GRID ---------- */}
      <section className="gd-grid">

        {/* MAP */}
        <div className="gd-panel gd-map glass">
          <div className="gd-panel-head">
            <div>
              <h3 className="gd-title">Hazard Map</h3>
              <p className="gd-sub">Real-time hazard visualization</p>
            </div>
            <button
              className="gd-ghost"
              onClick={() => setActivePage("Live Hazard Map")}
            >
              Open full map
            </button>
          </div>
          <div className="gd-map-box">
            <HazardMap />
          </div>
        </div>

        {/* RISK DISTRIBUTION */}
        <div className="gd-panel gd-risk glass">
          <div className="gd-panel-head">
            <div>
              <h3 className="gd-title">Risk Distribution</h3>
              <p className="gd-sub">Current habitation risk levels</p>
            </div>
          </div>

          <div className="gd-risk-body">
            <div className="gd-donut">
              <svg viewBox="0 0 140 140">
                <circle
                  cx="70" cy="70" r={R} fill="none"
                  stroke="rgba(255,255,255,0.12)" strokeWidth="16"
                />
                {segments.map((s) =>
                  s.len > 0 ? (
                    <circle
                      key={s.key}
                      cx="70" cy="70" r={R} fill="none"
                      stroke={s.color} strokeWidth="16"
                      strokeDasharray={`${s.len} ${C - s.len}`}
                      strokeDashoffset={-s.offset}
                      transform="rotate(-90 70 70)"
                    />
                  ) : null
                )}
              </svg>
              <div className="gd-donut-center">
                <strong>{fmt(totalRisk)}</strong>
                <span>Classified</span>
              </div>
            </div>

            <div className="gd-legend">
              {riskRows.map((r) => (
                <div className="gd-legend-row" key={r.key}>
                  <span className="dot" style={{ background: r.color }} />
                  <span className="name">{r.label}</span>
                  <strong>{fmt(r.count)}</strong>
                  <span className="pct">{pct(r.count)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="gd-panel gd-quick glass">
          <div className="gd-panel-head">
            <h3 className="gd-title">Quick Stats</h3>
          </div>

          <div className="gd-quick-grid">
            <div className="gd-qcard">
              <div className="gd-qicon gd-tone-blue">🗄️</div>
              <div>
                <div className="gd-qlabel">Available Capacity</div>
                <div className="gd-qvalue">{fmt(dashboard.available_safe_capacity)}</div>
                <div className="gd-qsub">People can be accommodated</div>
              </div>
            </div>

            <div className="gd-qcard">
              <div className="gd-qicon gd-tone-purple">📄</div>
              <div>
                <div className="gd-qlabel">Active Relocation Plans</div>
                <div className="gd-qvalue">{fmt(dashboard.total_relocation_plans)}</div>
                <div className="gd-qsub">Plans in progress</div>
              </div>
            </div>

            <div className="gd-qcard">
              <div className="gd-qicon gd-tone-red">⚠️</div>
              <div>
                <div className="gd-qlabel">High Risk Areas</div>
                <div className="gd-qvalue">{fmt(dashboard.high_risk_habitations)}</div>
                <div className="gd-qsub">Habitations</div>
              </div>
            </div>

            <div className="gd-qcard">
              <div className="gd-qicon gd-tone-green">🛡️</div>
              <div>
                <div className="gd-qlabel">Total Safe Sites</div>
                <div className="gd-qvalue">{fmt(dashboard.total_safe_sites)}</div>
                <div className="gd-qsub">Relocation facilities</div>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ALERTS */}
        <div className="gd-panel gd-alerts glass">
          <div className="gd-panel-head">
            <div>
              <h3 className="gd-title">Recent Alerts</h3>
              <p className="gd-sub">{fmt(dashboard.unread_notifications)} unread</p>
            </div>
            <button className="gd-ghost" onClick={() => setActivePage("Alerts")}>
              View All
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="gd-empty">
              <strong>No recent alerts</strong>
              The monitoring system has no new notifications.
            </div>
          ) : (
            notifications.slice(0, 6).map((n, i) => {
              const tone = alertTone(n);
              return (
                <div className="gd-row" key={n.id || n._id || i}>
                  <div className={`gd-row-icon gd-tone-${tone}`}>
                    {tone === "blue" ? "i" : "!"}
                  </div>
                  <div className="gd-row-body">
                    <strong>{n.title || n.message || "Hazard Alert"}</strong>
                    <span>{n.message || n.description || "New notification"}</span>
                  </div>
                  <div className="gd-row-time">{timeLabel(n)}</div>
                </div>
              );
            })
          )}
        </div>

        {/* PRIORITY HABITATIONS */}
        <div className="gd-panel gd-list glass">
          <div className="gd-panel-head">
            <h3 className="gd-title">Priority Habitations</h3>
            <button
              className="gd-ghost"
              onClick={() => setActivePage("Relocation Priority")}
            >
              View All
            </button>
          </div>

          {priorityList.length === 0 ? (
            <div className="gd-empty">No classified habitations yet.</div>
          ) : (
            priorityList.map((h, i) => (
              <div className="gd-row" key={h.id || h._id || i}>
                <div className="gd-row-body">
                  <strong>
                    {h.name || h.habitation_name || h.village_name || h.village || `Habitation ${i + 1}`}
                  </strong>
                  <span>{h.district || h.block || ""}</span>
                </div>
                <span className={`gd-pill ${riskOf(h)}`}>{riskOf(h)}</span>
              </div>
            ))
          )}
        </div>

        {/* PROMO */}
        <div className="gd-promo glass">
          <h3>Building a Safer, More Resilient Tomorrow</h3>
          <p>AI + GIS for smarter disaster management and safer communities.</p>
          <button
            className="gd-btn"
            onClick={() => setActivePage("Reports & Analytics")}
          >
            Learn More
          </button>
        </div>

      </section>
    </div>
  );
}
