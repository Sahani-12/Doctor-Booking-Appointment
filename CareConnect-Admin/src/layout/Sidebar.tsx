import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  CreditCard,
  Settings,
  CheckCircle,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: CheckCircle, label: "Doctor Approvals", path: "/doctor-approvals" },
    { icon: FileText, label: "Manage Doctors", path: "/doctors" },
    { icon: Users, label: "Manage Users", path: "/users" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: CreditCard, label: "Payments", path: "/payments" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 ${
          isOpen ? "w-64" : "w-0"
        } lg:w-64 z-40 overflow-hidden flex flex-col`}
      >
        {/* Logo Section */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-6 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                CC
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                CareConnect
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 mb-4">
            Main Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }
                />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="p-4 bg-white dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              System Version
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Admin v1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
