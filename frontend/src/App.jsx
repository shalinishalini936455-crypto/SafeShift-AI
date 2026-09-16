import { useState, useEffect } from "react";
import { getDashboard, getHabitations } from "./services/api";
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

      });


    /* Habitations API */

    getHabitations()
      .then((response) => {

        console.log("Habitations API:", response.data);

        const totalPeople = response.data.reduce(
          (total, habitation) =>
            total + habitation.population,
          0
        );

        setPeopleAtRisk(totalPeople);

      })
      .catch((error) => {

        console.error("Habitations API Error:", error);

      });

  }, []);


  return (

    <div className="dashboard">


      {/* =====================================================
          DEMO BANNER
      ===================================================== */}

      <div className="demo-banner">

        <span>⚠️</span>

        <div>

          <strong>Prototype Monitoring Mode</strong>

          <p>
            Dashboard currently displays demo/simulated data.
            Connect the backend to display live system data.
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
            <strong>7</strong> marked for relocation
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
            7
          </div>

          <p>
            Habitations requiring immediate assessment
          </p>

          <div className="progress">

            <div
              style={{
                width: "72%"
              }}
            ></div>

          </div>

          <small>
            72% priority score
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
            11
          </div>

          <p>
            Habitations requiring action planning
          </p>

          <div className="progress">

            <div
              style={{
                width: "54%"
              }}
            ></div>

          </div>

          <small>
            54% priority score
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
            6
          </div>

          <p>
            AI detections awaiting field verification
          </p>

          <div className="progress">

            <div
              style={{
                width: "38%"
              }}
            ></div>

          </div>

          <small>
            Field verification required
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


          <div className="alert-row">

            <div className="alert-icon critical">
              !
            </div>

            <div>

              <strong>
                New structure detected
              </strong>

              <p>
                Red Zone RZ-024 · AI confidence 94%
              </p>

            </div>

            <span>
              5 min ago
            </span>

          </div>


          <div className="alert-row">

            <div className="alert-icon warning">
              !
            </div>

            <div>

              <strong>
                High habitation risk
              </strong>

              <p>
                Village A · Risk score 91/100
              </p>

            </div>

            <span>
              18 min ago
            </span>

          </div>


          <div className="alert-row">

            <div className="alert-icon info">
              i
            </div>

            <div>

              <strong>
                Field verification pending
              </strong>

              <p>
                3 detections awaiting review
              </p>

            </div>

            <span>
              32 min ago
            </span>

          </div>

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
              7
            </strong>

            <div className="risk-bar">

              <div
                style={{
                  width: "25%"
                }}
              ></div>

            </div>

          </div>


          <div className="risk-item">

            <span>
              High
            </span>

            <strong>
              11
            </strong>

            <div className="risk-bar">

              <div
                style={{
                  width: "45%"
                }}
              ></div>

            </div>

          </div>


          <div className="risk-item">

            <span>
              Medium
            </span>

            <strong>
              18
            </strong>

            <div className="risk-bar">

              <div
                style={{
                  width: "65%"
                }}
              ></div>

            </div>

          </div>


          <div className="risk-item">

            <span>
              Low
            </span>

            <strong>
              26
            </strong>

            <div className="risk-bar">

              <div
                style={{
                  width: "85%"
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