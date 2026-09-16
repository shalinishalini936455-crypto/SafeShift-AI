import axios from "axios";

const API = axios.create({
  baseURL: "https://safeshift-ai-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const healthCheck = () =>
  API.get("/api/health");

export const getDashboard = () =>
  API.get("/api/dashboard/");

export const getHabitations = () =>
  API.get("/api/habitations/");

export const getRedZones = () =>
  API.get("/api/red-zones/");

export const getSafeSites = () =>
  API.get("/api/safe-sites/");

export const getRelocationPlans = () =>
  API.get("/api/relocation/plans");

export const getNotifications = () =>
  API.get("/api/notifications/");

export const getReportDashboard = () =>
  API.get("/api/reports/dashboard");

export const getRiskReport = () =>
  API.get("/api/reports/risk");

export const getRelocationReport = () =>
  API.get("/api/reports/relocation");

/* Real-time weather from Open-Meteo */
export const getWeather = () =>
  API.get("/api/weather");

export default API;