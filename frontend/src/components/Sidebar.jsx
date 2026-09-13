function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard" },
    { name: "Live Hazard Map" },
    { name: "Red Zone Management" },
    { name: "AI Change Detection" },
    { name: "Habitations & Risk" },
    { name: "Safe Site Finder" },
    { name: "Carrying Capacity" },
    { name: "Relocation Simulator" },
    { name: "Long-Term Relocation Plan" },
    { name: "Relocation Priority" },
    { name: "Action Plans" },
    { name: "Field Reports" },
    { name: "Alerts" },
    { name: "Reports & Analytics" },
    { name: "AI Assistant" },
  ];

  return (
    <aside className="sidebar">

      {/* BRAND */}

      <div className="brand">

        <div>
          <h2>SafeShift</h2>
          <span>AI</span>
        </div>

      </div>


      {/* SYSTEM STATUS */}

      <div className="system-status">

        <span className="status-dot"></span>

        System Monitoring

      </div>


      {/* MENU */}

      <nav className="sidebar-menu">

        {menuItems.map((item) => (

          <button

            key={item.name}

            className={`menu-item ${
              activePage === item.name ? "active" : ""
            }`}

            onClick={() =>
              setActivePage(item.name.trim())
            }

          >

            <span>
              {item.name}
            </span>

          </button>

        ))}

      </nav>


      {/* BOTTOM */}

      <div className="sidebar-bottom">

        <button
          className={`menu-item ${
            activePage === "Settings" ? "active" : ""
          }`}
          onClick={() =>
            setActivePage("Settings")
          }
        >

          <span>
            Settings
          </span>

        </button>


        {/* USER */}

        <div className="user-box">

          <div className="user-avatar">
            DO
          </div>

          <div>

            <strong>
              District Officer
            </strong>

            <small>
              Administrator
            </small>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;