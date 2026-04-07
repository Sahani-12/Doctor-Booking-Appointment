/** Backend API root — always includes `/api`. Set VITE_API_URL to e.g. http://localhost:3001/api */
const raw = import.meta.env.VITE_API_URL || "http://localhost:3001";
const trimmed = raw.replace(/\/$/, "");
const BASE_URL = trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;

export default BASE_URL;
