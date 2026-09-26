function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: "📊" },
    { name: "Live Hazard Map", icon: "🗺️" },
    { name: "Red Zone Management", icon: "⚠️" },
    { name: "Habitations & Risk", icon: "🏘️" },
    { name: "Safe Site Finder", icon: "📍" },
    { name: "Carrying Capacity", icon: "🗄️" },
    { name: "Relocation Plan", icon: "📄" },
    { name: "Relocation Priority", icon: "👥" },
    { name: "Action Plans", icon: "📋" },
    { name: "Field Data Collection", icon: "📝" },
    { name: "Reports & Analytics", icon: "📈" },
    { name: "AI Assistant", icon: "🤖" },
  ];

  return (
    <aside className="gl-sidebar glass">
      {/* BRAND */}
      <div className="gl-brand">
        <div className="gl-logo">🛡️</div>
        <div>
          <h2>SafeShift <span>AI</span></h2>
          <small>Safer Today · Resilient Tomorrow</small>
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
            <span className="gl-icon">{item.icon}</span>
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
          <span className="gl-icon">⚙️</span>
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
