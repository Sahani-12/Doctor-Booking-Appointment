/** Backend API root: always includes `/api`. Uses localhost in local dev. */
const LOCAL_API_ORIGIN = "http://localhost:4000";
const REMOTE_API_ORIGIN = "https://doctor-booking-appointment-i137.onrender.com";

const isLocalFrontend =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const normalizeApiBase = (value) => {
  const trimmed = value.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const configured = import.meta.env.VITE_API_URL?.trim();
const shouldUseLocalBackend =
  isLocalFrontend &&
  (!configured || configured.includes("doctor-booking-appointment-i137.onrender.com"));

const BASE_URL = normalizeApiBase(
  shouldUseLocalBackend ? LOCAL_API_ORIGIN : configured || REMOTE_API_ORIGIN,
);

export default BASE_URL;
