import Icon from "./Icons";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: "dashboard" },
    { name: "Live Hazard Map", icon: "map" },
    { name: "Red Zone Management", icon: "alert" },
    { name: "Habitations & Risk", icon: "building" },
    { name: "Safe Site Finder", icon: "pin" },
    { name: "Carrying Capacity", icon: "database" },
    { name: "Relocation Plan", icon: "file" },
    { name: "Relocation Priority", icon: "users" },
    { name: "Action Plans", icon: "clipboard" },
    { name: "Field Data Collection", icon: "pen" },
    { name: "AI Change Detection", icon: "bot" },
    { name: "Reports & Analytics", icon: "chart" },
    { name: "AI Assistant", icon: "bot" },
  ];

  return (
    <aside className="gl-sidebar glass">
      {/* BRAND */}
      <div className="gl-brand">
        <div className="gl-logo"><Icon name="shield" size={24} /></div>
        <div>
          <h2>SafeShift <span>AI</span></h2>
          <small>Safer Today - Resilient Tomorrow</small>
        </div>
      </div>

      {/* SYSTEM STATUS */}
      <div className="gl-status">
        <span className="gl-dot"></span>
        System Monitoring
      </div>

      {/* MENU */}
      <nav className="gl-menu">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`gl-item ${activePage === item.name ? "active" : ""}`}
            onClick={() => setActivePage(item.name)}
          >
            <span className="gl-icon"><Icon name={item.icon} size={19} /></span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* BOTTOM */}
      <div className="gl-bottom">
        <button
          className={`gl-item ${activePage === "Settings" ? "active" : ""}`}
          onClick={() => setActivePage("Settings")}
        >
          <span className="gl-icon"><Icon name="settings" size={19} /></span>
          <span>Settings</span>
        </button>

        <div className="gl-user">
          <div className="gl-avatar">DO</div>
          <div>
            <strong>District Officer</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
