export const API_BASE = (() => {
  const raw =
    import.meta.env.VITE_API_URL ||
    "https://doctor-booking-appointment-i137.onrender.com";
  const trimmed = raw.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
})();
