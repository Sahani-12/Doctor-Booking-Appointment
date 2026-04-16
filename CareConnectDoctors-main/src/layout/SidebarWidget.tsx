import { Link } from "react-router";
import { useEffect, useState } from "react";
import { LogOut, UserCircle } from "lucide-react";

export default function SidebarWidget() {
  const [doctor, setDoctor] = useState<{
    fullname?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setDoctor(JSON.parse(userData));
      }
    } catch (err) {
      console.error("Failed to parse user data");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-slate-50 px-4 py-5 text-center dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
        <UserCircle className="h-7 w-7" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
        {doctor?.fullname || "Doctor Profile"}
      </h3>
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
