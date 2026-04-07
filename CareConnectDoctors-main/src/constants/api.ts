/** Normalizes to `http://host:port/api` */
export const API_BASE = (() => {
  const raw = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const t = raw.replace(/\/$/, "");
  return t.endsWith("/api") ? t : `${t}/api`;
})();
