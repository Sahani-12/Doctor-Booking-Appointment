import { Link } from "react-router";
import { useEffect, useState } from "react";
import { LogOut, UserCircle } from "lucide-react";
import { resolveMediaUrl, doctorAvatarUrl } from "../utils/mediaUrl";
import { API_BASE } from "../constants/api";

export default function SidebarWidget() {
  const [doctor, setDoctor] = useState<{
    fullname?: string;
    email?: string;
    profileImage?: string;
  } | null>(null);

  useEffect(() => {
    const loadUser = (event?: any) => {
      try {
        const raw =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (event?.detail?.profileImage) {
            parsed.profileImage = event.detail.profileImage;
          }
          setDoctor(parsed);
        } else if (event?.detail?.profileImage) {
          setDoctor((prev) => ({
            ...prev,
            profileImage: event.detail.profileImage,
          }));
        }
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    };

    loadUser();
    window.addEventListener("profileUpdated", loadUser);
    window.addEventListener("storage", loadUser);

    // Fetch latest profile to ensure updated image is available
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("doctorToken") ||
      sessionStorage.getItem("token");

    if (token) {
      fetch(`${API_BASE}/doctors/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) {
            const doc = json.data;
            setDoctor((prev) => ({
              ...prev,
              fullname: doc.fullname || doc.name || prev?.fullname,
              email: doc.email || prev?.email,
              profileImage: doc.profileImage || prev?.profileImage,
            }));
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("profileUpdated", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  const imageSrc = doctor?.profileImage
    ? resolveMediaUrl(doctor.profileImage)
    : doctorAvatarUrl({ fullname: doctor?.fullname });

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-slate-50 px-4 py-5 text-center dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
      <Link to="/profile" className="block group">
        <div className="mx-auto mb-3 h-14 w-14 rounded-full overflow-hidden border-2 border-brand-500 shadow-sm relative group-hover:ring-2 group-hover:ring-brand-400 transition-all bg-white dark:bg-slate-900">
          <img
            src={imageSrc}
            alt={doctor?.fullname || "Doctor Profile"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = doctorAvatarUrl({
                fullname: doctor?.fullname,
              });
            }}
          />
        </div>
        <h3 className="mb-0.5 text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
          {doctor?.fullname || "Doctor Profile"}
        </h3>
      </Link>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-1">
        {doctor?.email || "Manage your account"}
      </p>

      <Link
        to="/"
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:from-rose-600 hover:to-rose-700"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Link>
    </div>
  );
}
