import BASE_URL from "@/constants/api";

/** API origin without `/api` (for `/uploads/...` static files) */
export function getApiOrigin() {
  return String(BASE_URL || "").replace(/\/api\/?$/i, "");
}

/**
 * Turn relative upload paths into absolute URLs the browser can load.
 * @param {string|null|undefined} url
 */
export function resolveMediaUrl(url) {
  if (url == null || typeof url !== "string") return "";
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const origin = getApiOrigin();
  if (!origin) return u;
  return u.startsWith("/") ? `${origin}${u}` : `${origin}/${u}`;
}

/** Doctor specialization may be string or string[] */
export function formatSpecialization(spec) {
  if (spec == null) return "";
  if (Array.isArray(spec)) return spec.filter(Boolean).join(", ");
  return String(spec);
}

/** Fallback avatar when no image in DB */
export function doctorAvatarUrl(doctor) {
  const resolved = resolveMediaUrl(doctor?.profileImage || doctor?.image);
  if (resolved) return resolved;
  const name = encodeURIComponent(doctor?.fullname?.trim() || "Doctor");
  return `https://ui-avatars.com/api/?name=${name}&background=0d9488&color=fff&size=256`;
}

/** Patient profile photo (User model uses `image`) */
export function patientAvatarUrl(user) {
  const resolved = resolveMediaUrl(user?.image || user?.avatar);
  if (resolved) return resolved;
  const name = encodeURIComponent(user?.fullname?.trim() || "User");
  return `https://ui-avatars.com/api/?name=${name}&background=ea580c&color=fff&size=256`;
}
