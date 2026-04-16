import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Building2,
  CreditCard,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const HospitalPortalNav = ({ isOpen, onClose, isMobile = false }) => {
  const location = useLocation();

  const menuItems = [
    {
      label: "Appointments",
      icon: CalendarDays,
      path: "/hospital/appointments",
      description: "View and manage your appointments",
    },
    {
      label: "Medical Records",
      icon: ClipboardList,
      path: "/hospital/medical-records",
      description: "View your medical history and records",
    },
    {
      label: "Lab Reports",
      icon: FlaskConical,
      path: "/hospital/lab-reports",
      description: "Check lab test results and orders",
    },
    {
      label: "Admissions",
      icon: Building2,
      path: "/hospital/admissions",
      description: "View admission history and active admissions",
    },
    {
      label: "Bills & Payments",
      icon: CreditCard,
      path: "/hospital/bills",
      description: "View and pay hospital bills",
    },
  ];

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ item }) => (
    <Link
      to={item.path}
      onClick={() => isMobile && onClose()}
      className={`
        group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all
        ${
          isActive(item.path)
            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
            : "text-gray-700 hover:bg-orange-50 dark:text-gray-300 dark:hover:bg-gray-800"
        }
      `}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{item.label}</p>
        <p
          className={`text-xs transition-colors ${
            isActive(item.path)
              ? "text-orange-100"
              : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
          }`}
        >
          {item.description}
        </p>
      </div>
    </Link>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950 shadow-2xl
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hospital Hub
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1 p-4">
            {menuItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside className="sticky top-0 h-screen w-80 overflow-y-auto bg-gradient-to-b from-orange-50 to-white p-6 shadow-sm dark:from-gray-900 dark:to-gray-950">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Hospital Hub
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your health records
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Quick Links */}
      <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Quick Actions
        </p>
        <button className="w-full rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50 dark:border-orange-900/30 dark:bg-gray-900 dark:text-orange-300">
          Download Records
        </button>
        <button className="mt-2 w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg">
          Book Appointment
        </button>
      </div>
    </aside>
  );
};

export default HospitalPortalNav;
