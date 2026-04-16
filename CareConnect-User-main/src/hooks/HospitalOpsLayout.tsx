import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Building2, FlaskConical, FileText, CreditCard } from "lucide-react";

const navItems = [
  { name: "Admissions", href: "/hospital-ops/admissions", icon: Building2 },
  {
    name: "Lab Reports",
    href: "/hospital-ops/lab-reports",
    icon: FlaskConical,
  },
  {
    name: "Medical Records",
    href: "/hospital-ops/medical-records",
    icon: FileText,
  },
  { name: "Bills & Payments", href: "/hospital-ops/bills", icon: CreditCard },
];

const HospitalOpsLayout: React.FC = () => {
  return (
    <div className="flex h-full bg-gray-50">
      <aside className="w-64 flex-shrink-0 border-r bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Hospital Operations
        </h2>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default HospitalOpsLayout;
