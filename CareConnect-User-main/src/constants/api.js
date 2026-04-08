/** Backend API root — always includes `/api`. Set VITE_API_URL to e.g. https://doctor-booking-appointment-i137.onrender.com/api */
const raw =
  import.meta.env.VITE_API_URL ||
  "https://doctor-booking-appointment-i137.onrender.com";
const trimmed = raw.replace(/\/$/, "");
const BASE_URL = trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;

export default BASE_URL;
