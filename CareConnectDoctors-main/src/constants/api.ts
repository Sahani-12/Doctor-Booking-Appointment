/** Normalizes to `http://host:port/api` */
export const API_BASE = (() => {
  const raw =
    import.meta.env.VITE_API_URL ||
    "https://doctor-booking-appointment-i137.onrender.com";
  const t = raw.replace(/\/$/, "");
  return t.endsWith("/api") ? t : `${t}/api`;
})();
