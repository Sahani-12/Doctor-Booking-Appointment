const LOCAL_API_ORIGIN = "http://localhost:4000";
const REMOTE_API_ORIGIN = "https://doctor-booking-appointment-i137.onrender.com";

const isLocalFrontend =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const normalizeApiBase = (value: string) => {
  const trimmed = value.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

/** Normalizes to `http://host:port/api` */
export const API_BASE = (() => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  const shouldUseLocalBackend =
    isLocalFrontend &&
    (!configured || configured.includes("doctor-booking-appointment-i137.onrender.com"));

  return normalizeApiBase(
    shouldUseLocalBackend
      ? LOCAL_API_ORIGIN
      : configured || REMOTE_API_ORIGIN,
  );
})();
