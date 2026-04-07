import { API_BASE } from "../constants/api";

export function getApiOrigin(): string {
  return API_BASE.replace(/\/api\/?$/i, "");
}

export function resolveMediaUrl(url?: string | null): string {
  if (url == null || typeof url !== "string") return "";
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const origin = getApiOrigin();
  return u.startsWith("/") ? `${origin}${u}` : `${origin}/${u}`;
}

export function doctorAvatarUrl(doctor: {
  fullname?: string;
  profileImage?: string;
}): string {
  const resolved = resolveMediaUrl(doctor?.profileImage);
  if (resolved) return resolved;
  const name = encodeURIComponent(doctor?.fullname?.trim() || "Doctor");
  return `https://ui-avatars.com/api/?name=${name}&background=0d9488&color=fff&size=256`;
}
