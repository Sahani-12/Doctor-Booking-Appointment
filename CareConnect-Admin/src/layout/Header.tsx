import { useAuth } from "../hooks/useAuth";
import { LogOut, Moon, Sun, Bell, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { admin, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 shadow-xl border-b border-slate-700/50 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Welcome, {admin?.name || "Admin"}
            </h2>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-white text-sm placeholder-slate-500 outline-none w-40"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition border border-red-600/30 hover:border-red-600/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
