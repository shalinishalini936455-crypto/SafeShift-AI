import axios from "axios";

const API = axios.create({
  baseURL:  "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Health
export const healthCheck = () =>
  API.get("/api/health");

// Dashboard
export const getDashboard = () =>
  API.get("/api/dashboard/");

// Habitations
export const getHabitations = () =>
  API.get("/api/habitations/");

// Red Zones
export const getRedZones = () =>
  API.get("/api/red-zones/");

// Trigger the AI sync against live SACHET hazard data.
// This is what re-detects red zones from current + historical
// occurrences rather than just reading whatever's already stored.
export const refreshRedZones = () =>
  API.post("/api/red-zones/refresh");

// Safe Sites
export const getSafeSites = () =>
  API.get("/api/safe-sites/");

// Relocation Plans
export const getRelocationPlans = () =>
  API.get("/api/relocation/plans");

// Notifications
export const getNotifications = () =>
  API.get("/api/notifications/");

// Reports
export const getReportDashboard = () =>
  API.get("/api/reports/dashboard");

export const getRiskReport = () =>
  API.get("/api/reports/risk");

export const getRelocationReport = () =>
  API.get("/api/reports/relocation");

// Weather
export const getWeather = () =>
  API.get("/api/weather");


/* Real-time NDMA SACHET hazards */
export const getLiveHazards = () =>
  API.get("/api/live-hazards");

export default API;
