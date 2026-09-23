import { useState, useEffect } from "react";
import { getDashboard, getHabitations, getNotifications } from "./services/api";
import Sidebar from "./components/Sidebar";
import HazardMap from "./pages/HazardMap";
import RedZoneManagement from "./pages/RedZoneManagement";
import ChangeDetection from "./pages/ChangeDetection";
import Habitations from "./pages/Habitations";
import SafeSites from "./pages/SafeSites";
import RelocationPriority from "./pages/RelocationPriority";
import CarryingCapacity from "./pages/CarryingCapacity";
import RelocationSimulator from "./pages/RelocationSimulator";
import ActionPlans from "./pages/ActionPlans";
import FieldReports from "./pages/FieldReports";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Login from "./pages/Login";
import LongTermRelocation from "./pages/LongTermRelocation";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>
            <p>
              Disaster Risk & Relocation Decision Support System
            </p>
          </div>

          <div className="topbar-right">

            <div className="live-status">
              <span></span>
              LIVE MONITORING
            </div>

            <button className="notification-btn">
              🔔
              <b>3</b>
            </button>

            <div className="profile">
              <div className="profile-avatar">DO</div>

              <div>
                <strong>District Officer</strong>
                <small>Disaster Management</small>
              </div>
            </div>

          </div>
        </header>

        {/* PAGES */}

        {activePage === "Dashboard" ? (
          <Dashboard />

        ) : activePage === "Live Hazard Map" ? (
          <HazardMap />

        ) : activePage === "Red Zone Management" ? (
          <RedZoneManagement />

        ) : activePage === "AI Change Detection" ? (
          <ChangeDetection />

        ) : activePage === "Habitations & Risk" ? (
          <Habitations />

        ) : activePage === "Safe Site Finder" ? (
          <SafeSites />

        ) : activePage.trim() === "Carrying Capacity" ? (
          <CarryingCapacity />

        ) : activePage === "Relocation Simulator" ? (
          <RelocationSimulator />

        ) : activePage.trim() === "Long-Term Relocation Plan" ? (
          <LongTermRelocation />

        ) : activePage === "Relocation Priority" ? (
          <RelocationPriority />

        ) : activePage === "Action Plans" ? (
          <ActionPlans />

        ) : activePage === "Field Reports" ? (
          <FieldReports />

        ) : activePage === "Alerts" ? (
          <Alerts />

        ) : activePage === "Reports & Analytics" ? (
          <Reports />

        ) : activePage === "AI Assistant" ? (
          <AIAssistant />

        ) : (
          <ComingSoon page={activePage} />
        )}

      </main>
    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {

  const [dashboardData, setDashboardData] = useState(null);
  const [peopleAtRisk, setPeopleAtRisk] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [habitationsData, setHabitationsData] = useState([]);

  /* GET BACKEND DATA */

  useEffect(() => {
    /* Dashboard API */
    getDashboard()
      .then((response) => {
        console.log("Dashboard API:", response.data);
        setDashboardData(response.data);
      })
      .catch((error) => {
        console.error("Dashboard API Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    /* Habitations API */
    getHabitations()
      .then((response) => {
        console.log("Habitations API:", response.data);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.habitations || [];

        setHabitationsData(data);

        const totalPeople = data.reduce(
          (total, habitation) =>
            total + (Number(habitation.population) || 0),
          0
        );

        setPeopleAtRisk(totalPeople);
      })
      .catch((error) => {
        console.error("Habitations API Error:", error);
        setHabitationsData([]);
        setPeopleAtRisk(0);
      });

    /* Notifications API */
    getNotifications()
      .then((response) => {
        console.log("Notifications API:", response.data);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.notifications || [];

        setNotifications(data);
      })
      .catch((error) => {
        console.error("Notifications API Error:", error);
        setNotifications([]);
      });
  }, []);

  /* LIVE RISK COUNTS */
  const getRiskCount = (level) => {
    return habitationsData.filter((habitation) => {
      const risk = String(
        habitation.risk_level ??
          habitation.risk ??
          habitation.riskLevel ??
          ""
      ).toLowerCase();

      return risk === level.toLowerCase();
    }).length;
  };

  const criticalCount = getRiskCount("Critical");
  const highCount = getRiskCount("High");
  const mediumCount = getRiskCount("Medium");
  const lowCount = getRiskCount("Low");

  const totalHabitations = habitationsData.length;

  const getPercentage = (count) => {
    if (totalHabitations === 0) return 0;
    return Math.round((count / totalHabitations) * 100);
  };

  /* NOTIFICATION HELPERS */
  const getNotificationTitle = (notification) =>
    notification.title ||
    notification.notification_title ||
    notification.type ||
    "System Notification";

  const getNotificationMessage = (notification) =>
    notification.message ||
    notification.description ||
    notification.details ||
    "SafeShift AI system notification";

  const getNotificationTime = (notification) => {
    const value =
      notification.created_at ||
      notification.timestamp ||
      notification.time ||
      notification.date;

    if (!value) return "Recently";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const seconds = Math.max(
      0,
      Math.floor((Date.now() - date.getTime()) / 1000)
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const getNotificationClass = (notification) => {
    const value = String(
      notification.severity ||
        notification.priority ||
        notification.type ||
        ""
    ).toLowerCase();

    if (value.includes("critical")) return "critical";
    if (value.includes("high") || value.includes("warning")) return "warning";

    return "info";
  };


  return (

    <div className="dashboard">


      {/* =====================================================
          DEMO BANNER
      ===================================================== */}

      <div className="demo-banner">
  <span>🟢</span>

  <div>
    <strong>Live Monitoring Mode</strong>

    <p>
      Dashboard data is connected to the SafeShift AI backend.
    </p>
  </div>
</div>


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="stats-grid">


        {/* RED ZONES */}

        <div className="stat-card red">

          <div className="stat-top">

            <span>Red Zones</span>

            <div className="stat-icon">
              🔴
            </div>

          </div>

          <h2>
            {dashboardData
              ? dashboardData.total_red_zones
              : "..."}
          </h2>

          <p>
  <strong>
    {dashboardData
      ? dashboardData.red_zones_requiring_attention
      : "..."}
  </strong>{" "}
  require immediate attention
</p>
        </div>


        {/* HIGH RISK HABITATIONS */}

        <div className="stat-card orange">

          <div className="stat-top">

            <span>High Risk Habitations</span>

            <div className="stat-icon">
              🏘️
            </div>

          </div>

          <h2>
            {dashboardData
              ? dashboardData.high_risk_habitations
              : "..."}
          </h2>

          <p>
  <strong>
    {dashboardData
      ? dashboardData.total_relocation_plans
      : "..."}
  </strong>{" "}
  relocation plans
</p>

        </div>


        {/* PEOPLE AT RISK */}

        <div className="stat-card purple">

          <div className="stat-top">

            <span>People at Risk</span>

            <div className="stat-icon">
              👥
            </div>

          </div>

          <h2>
            {peopleAtRisk !== null
              ? peopleAtRisk.toLocaleString()
              : "..."}
          </h2>

          <p>
            Across monitored habitations
          </p>

        </div>


        {/* SAFE SITES */}

        <div className="stat-card green">

          <div className="stat-top">

            <span>Safe Sites</span>

            <div className="stat-icon">
              📍
            </div>

          </div>

          <h2>
            {dashboardData
              ? dashboardData.total_safe_sites
              : "..."}
          </h2>

          <p>
            <strong>
              {dashboardData
                ? dashboardData.available_safe_capacity.toLocaleString()
                : "..."}
            </strong>{" "}
            available capacity
          </p>

        </div>

      </div>


      {/* =====================================================
          RELOCATION OVERVIEW
      ===================================================== */}

      <div className="section-heading">

        <div>

          <h2>
            Relocation Overview
          </h2>

          <p>
            Current priority status across monitored areas
          </p>

        </div>

      </div>


      <div className="overview-grid">


        {/* IMMEDIATE RELOCATION */}

        <div className="overview-card">

          <div className="overview-header">

            <h3>
              Immediate Relocation
            </h3>

            <span className="danger-badge">
              CRITICAL
            </span>

          </div>

          <div className="big-number">
  {loading ? "..." : criticalCount}
</div>

          <p>
            Habitations requiring immediate assessment
          </p>

          <div className="progress">

            <div
              style={{
                width: `${getPercentage(criticalCount)}%`
              }}
            ></div>

          </div>

          <small>
  {getPercentage(criticalCount)}% of monitored habitations
</small>

        </div>


        {/* SHORT TERM RELOCATION */}

        <div className="overview-card">

          <div className="overview-header">

            <h3>
              Short-Term Relocation
            </h3>

            <span className="warning-badge">
              HIGH
            </span>

          </div>

         <div className="big-number">
  {loading ? "..." : highCount}
</div>

          <p>
            Habitations requiring action planning
          </p>

          <div className="progress">

            <div
              style={{
               width: `${getPercentage(highCount)}%`
              }}
            ></div>

          </div>

         <small>
  {getPercentage(highCount)}% of monitored habitations
</small>

        </div>


        {/* PENDING VERIFICATION */}

        <div className="overview-card">

          <div className="overview-header">

            <h3>
              Pending Verification
            </h3>

            <span className="info-badge">
              AI
            </span>

          </div>

          <div className="big-number">
            {loading
              ? "..."
              : dashboardData?.ai_detections_pending ?? 0}
          </div>

          <p>
            AI detections awaiting field verification
          </p>

          <div className="progress">

            <div
              style={{
                width: "0%"
              }}
            ></div>

          </div>

         <small>
  No pending AI detections
</small>

        </div>

      </div>


      {/* =====================================================
          LOWER SECTION
      ===================================================== */}

      <div className="lower-grid">


        {/* RECENT ALERTS */}

        <div className="activity-card">

          <div className="card-heading">

            <div>

              <h3>
                Recent Alerts
              </h3>

              <p>
                Latest system notifications
              </p>

            </div>

            <button>
              View all
            </button>

          </div>


          {notifications.length === 0 ? (
            <div className="alert-row">
              <div className="alert-icon info">i</div>

              <div>
                <strong>No recent notifications</strong>
                <p>No system notifications are currently available.</p>
              </div>

              <span>Now</span>
            </div>
          ) : (
            notifications.slice(0, 3).map((notification, index) => {
              const iconClass = getNotificationClass(notification);

              return (
                <div
                  className="alert-row"
                  key={notification.id || index}
                >
                  <div className={`alert-icon ${iconClass}`}>
                    {iconClass === "info" ? "i" : "!"}
                  </div>

                  <div>
                    <strong>
                      {getNotificationTitle(notification)}
                    </strong>

                    <p>
                      {getNotificationMessage(notification)}
                    </p>
                  </div>

                  <span>
                    {getNotificationTime(notification)}
                  </span>
                </div>
              );
            })
          )}

        </div>


        {/* RISK DISTRIBUTION */}

        <div className="risk-card">

          <div className="card-heading">

            <div>

              <h3>
                Risk Distribution
              </h3>

              <p>
                Monitored habitation status
              </p>

            </div>

          </div>


          <div className="risk-item">

            <span>
              Critical
            </span>

            <strong>
  {criticalCount}
</strong>

            <div className="risk-bar">

              <div
                style={{
                 width: `${getPercentage(criticalCount)}%`
                }}
              ></div>

            </div>

          </div>


          <div className="risk-item">

            <span>
              High
            </span>

            <strong>
  {highCount}
</strong>

            <div className="risk-bar">

              <div
                style={{
               width: `${getPercentage(highCount)}%`
                }}
              ></div>

            </div>

          </div>


          <div className="risk-item">

            <span>
              Medium
            </span>

           <strong>
  {mediumCount}
</strong>
            <div className="risk-bar">

              <div
                style={{
                 width: `${getPercentage(mediumCount)}%`
                }}
              ></div>

            </div>

          </div>


          <div className="risk-item">

            <span>
              Low
            </span>

           <strong>
  {lowCount}
</strong>
            <div className="risk-bar">

              <div
                style={{
                 width: `${getPercentage(lowCount)}%`
                }}
              ></div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}


/* =========================================================
   COMING SOON
========================================================= */

function ComingSoon({ page }) {

  return (

    <div className="coming-soon">

      <div className="coming-icon">
        🚧
      </div>

      <h2>
        {page}
      </h2>

      <p>
        This module is ready to be connected
        to the SafeShift AI workflow.
      </p>

      <span>
        Frontend module — development in progress
      </span>

    </div>

  );
}


export default App;