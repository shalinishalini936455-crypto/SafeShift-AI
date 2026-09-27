import Sidebar from "./Sidebar";

/* Page title row: title on the left, Live Monitoring + date on the right */
export function PageHeader({ title, subtitle }) {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="gl-page-head">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="gl-page-meta">
        <span className="gl-live">● Live Monitoring</span>
        <span className="gl-date glass">{date} • {time}</span>
      </div>
    </div>
  );
}

/* Sidebar + top bar shell. Usage:
   <GlassLayout activePage={..} setActivePage={..} alertCount={n}>{page}</GlassLayout> */
export default function GlassLayout({
  children,
  activePage,
  setActivePage,
  alertCount = 0,
}) {
  return (
    <div className="gl-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="gl-main">
        <header className="gl-topbar glass">
          <input
            className="gl-search"
            placeholder="Search location, hazard, or village..."
          />
          <span className="gl-spacer" />

          <button
            className="gl-iconbtn"
            onClick={() => setActivePage("Alerts")}
            aria-label="Open alerts"
            title="Alerts"
          >
            🔔
            {alertCount > 0 && <b>{alertCount}</b>}
          </button>

          <div className="gl-profile">
            <div className="gl-avatar">DO</div>
            <div>
              <strong>District Officer</strong>
              <small>Disaster Management</small>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
