import { useState, useEffect } from "react";

import { getDashboard } from "./services/api";

import GlassLayout, { PageHeader } from "./components/GlassLayout";
import DashboardGlass from "./pages/DashboardGlass";

import HazardMap from "./pages/HazardMap";
import RedZoneManagement from "./pages/RedZoneManagement";
import Habitations from "./pages/Habitations";
import SafeSites from "./pages/SafeSites";
import CarryingCapacity from "./pages/CarryingCapacity";
import RelocationPriority from "./pages/RelocationPriority";
import ActionPlans from "./pages/ActionPlans";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import ChangeDetection from "./pages/ChangeDetection";

import FieldDataCollection from "./pages/FieldReports";
import RelocationPlan from "./pages/LongTermRelocation";

import Login from "./pages/Login";

import "./App.css";
import "./glass.css"; // keep AFTER App.css


/* ---------- COMING SOON ---------- */

function ComingSoon({ page }) {
  return (
    <div className="glass" style={{ padding: 28 }}>
      <h2>{page}</h2>
      <p>This module is available in the SafeShift decision-support platform.</p>
    </div>
  );
}


/* ---------- MAIN APP ---------- */

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [loggedIn, setLoggedIn] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  /* unread count for the bell badge */
  useEffect(() => {
    if (!loggedIn) return;
    getDashboard()
      .then((res) => {
        const d = res?.data || res;
        setAlertCount(d?.unread_notifications ?? 0);
      })
      .catch(() => {});
  }, [loggedIn]);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  const pages = {
    "Dashboard": <DashboardGlass setActivePage={setActivePage} />,
    "Live Hazard Map": <HazardMap />,
    "Red Zone Management": <RedZoneManagement />,
    "Habitations & Risk": <Habitations />,
    "Safe Site Finder": <SafeSites />,
    "Carrying Capacity": <CarryingCapacity />,
    "Relocation Plan": <RelocationPlan />,
    "Relocation Priority": <RelocationPriority />,
    "Action Plans": <ActionPlans />,
    "Field Data Collection": <FieldDataCollection />,
    "AI Change Detection": <ChangeDetection />,
    "Alerts": <Alerts />,
    "Reports & Analytics": <Reports />,
    "AI Assistant": <AIAssistant />,
  };

  return (
    <GlassLayout
      activePage={activePage}
      setActivePage={setActivePage}
      alertCount={alertCount}
    >
      {activePage !== "Dashboard" && (
        <PageHeader
          title={activePage}
          subtitle="Disaster Risk & Relocation Decision Support System"
        />
      )}

      {pages[activePage] ?? <ComingSoon page={activePage} />}
    </GlassLayout>
  );
}

export default App;
