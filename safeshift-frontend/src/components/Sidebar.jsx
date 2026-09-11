function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: "🏠" },
    { name: "Live Hazard Map", icon: "🗺️" },
    { name: "Red Zone Management", icon: "🔴" },
    { name: "AI Change Detection", icon: "🤖" },
    { name: "Habitations & Risk", icon: "🏘️" },
    { name: "Safe Site Finder", icon: "📍" },
    { name: "Carrying Capacity", icon: "📊" },
    { name: "Relocation Simulator", icon: "🔄" },
    { name: "Relocation Priority", icon: "🚨" },
    { name: "Action Plans", icon: "📋" },
    { name: "Field Reports", icon: "📢" },
    { name: "Alerts", icon: "🔔" },
    { name: "Reports & Analytics", icon: "📈" },
    { name: "AI Assistant", icon: "💬" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">🛡️</div>

        <div>
          <h2>SafeShift</h2>
          <span>AI</span>
        </div>
      </div>

      <div className="system-status">
        <span className="status-dot"></span>
        System Monitoring
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`menu-item ${
              activePage === item.name ? "active" : ""
            }`}
            onClick={() => setActivePage(item.name.trim())}
          >
            <span className="menu-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="menu-item">
          <span className="menu-icon">⚙️</span>
          Settings
        </button>

        <div className="user-box">
          <div className="user-avatar">DO</div>

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