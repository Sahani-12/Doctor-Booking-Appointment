import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [userName, setUserName] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).fullname : null;
  });

  // 🌙 Theme State
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const navigate = useNavigate();

  // Apply theme on load/change
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navLinks = [
    { name: "Find Doctor", path: "/doctor-search" },
    { name: "Consult", path: "/consult" },
    { name: "AI Checker", path: "/symptom-checker" },
    { name: "Get Help", path: "/help" },
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 py-3 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 transition-all">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex items-center">
          {/* Logo */}
          <div
            className="cursor-pointer flex items-center flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
            <span className="text-xl tracking-tight font-semibold dark:text-white">
              CareConnect
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex space-x-6 ml-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive
                      ? "text-orange-600 font-semibold"
                      : "text-gray-800 dark:text-gray-200 hover:text-orange-600"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* Greeting */}
            <span
              className="text-gray-600 dark:text-gray-300 hidden lg:block cursor-pointer"
              onClick={() => {
                if (userName) {
                  navigate(`/user-dashboard/${encodeURIComponent(userName)}`);
                }
              }}
            >
              {userName ? `Hi, ${userName}` : "Welcome!"}
            </span>

            {/* 🌙 Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:scale-110 transition"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-gray-700" />
              )}
            </button>

            {/* Auth Buttons */}
            {!userName ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="py-2 px-4 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors hidden lg:inline-block"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r text-white from-orange-500 to-orange-700 py-2 px-4 rounded-md hover:from-orange-600 hover:to-orange-800 transition-colors hidden lg:inline-block"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  sessionStorage.removeItem("user");
                  sessionStorage.removeItem("token");
                  setUserName(null);
                  navigate("/");
                }}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors hidden lg:inline-block"
              >
                Logout
              </button>
            )}

            {/* Mobile Menu Button */}
            <div className="lg:hidden ml-4">
              <button
                onClick={toggleNavbar}
                aria-label="Toggle navigation menu"
                className="text-gray-800 dark:text-gray-200 hover:text-orange-600"
              >
                {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* 📱 Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed right-0 z-20 bg-white dark:bg-gray-900 w-full p-8 flex flex-col justify-center items-start lg:hidden shadow-lg">
            <ul className="w-full space-y-4 mb-6">
              {navLinks.map((link) => (
                <li key={link.name} className="w-full">
                  <Link
                    to={link.path}
                    className="block py-3 text-gray-600 dark:text-gray-300 hover:text-orange-600"
                    onClick={toggleNavbar}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              Toggle Theme
            </button>

            {!userName ? (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    toggleNavbar();
                  }}
                  className="w-full py-3 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    toggleNavbar();
                  }}
                  className="w-full bg-gradient-to-r text-white from-orange-500 to-orange-700 py-3 rounded-md"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  sessionStorage.removeItem("user");
                  sessionStorage.removeItem("token");
                  setUserName(null);
                  toggleNavbar();
                  navigate("/");
                }}
                className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
