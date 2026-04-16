import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, User, ChevronDown } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const location = useLocation();

  const portalPages = [
    "/appointments",
    "/medical-records",
    "/departments",
    "/hospital-bills",
    "/lab-reports",
    "/admission-history",
    "/active-admission",
  ];

  const [userName, setUserName] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).fullname : null;
  });

  const [userImage, setUserImage] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser
      ? JSON.parse(storedUser).image || JSON.parse(storedUser).avatar
      : null;
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

  // Update navbar instantly when profile image changes
  useEffect(() => {
    const handleUserUpdate = () => {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.fullname);
        setUserImage(parsed.image || parsed.avatar);
      }
    };
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navLinks = [
    { name: "Hospital Portal", path: "/appointments" },
    { name: "Find Doctor", path: "/doctor-search" },
    { name: "Consult", path: "/consult" },
    { name: "AI Checker", path: "/symptom-checker" },
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
            {navLinks.map((link) =>
              link.name === "Hospital Portal" ? (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => setPortalDropdownOpen(true)}
                  onMouseLeave={() => setPortalDropdownOpen(false)}
                >
                  <button
                    onClick={() => navigate(link.path)} // Defaults to /profile
                    className={`flex items-center gap-1 transition-colors py-2 ${
                      portalPages.some((p) => location.pathname.startsWith(p))
                        ? "text-orange-600 font-semibold"
                        : "text-gray-800 dark:text-gray-200 hover:text-orange-600"
                    }`}
                  >
                    {link.name}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${portalDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute top-full left-0 w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top ${
                      portalDropdownOpen
                        ? "opacity-100 visible scale-y-100"
                        : "opacity-0 invisible scale-y-95"
                    }`}
                  >
                    <div className="py-2 flex flex-col">
                      <button
                        onClick={() => {
                          navigate("/appointments");
                          setPortalDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      >
                        Upcoming Appointments
                      </button>
                      <button
                        onClick={() => {
                          navigate("/active-admission");
                          setPortalDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      >
                        Active Admission
                      </button>
                      <button
                        onClick={() => {
                          navigate("/medical-records");
                          setPortalDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      >
                        Recent Medical Records
                      </button>
                      <button
                        onClick={() => {
                          navigate("/lab-reports");
                          setPortalDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      >
                        Lab Orders & Reports
                      </button>
                      <button
                        onClick={() => {
                          navigate("/admission-history");
                          setPortalDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      >
                        Admission History
                      </button>
                      <button
                        onClick={() => {
                          navigate("/hospital-bills");
                          setPortalDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      >
                        Hospital Bills
                      </button>
                      <button
                        onClick={() => {
                          navigate("/departments");
                          setPortalDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      >
                        Departments
                      </button>
                      <div className="my-1 border-t border-gray-100 dark:border-gray-700 mx-2"></div>
                      <Link
                        to="/help"
                        onClick={() => setPortalDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      >
                        Get Help
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `transition-colors py-2 ${
                      isActive
                        ? "text-orange-600 font-semibold"
                        : "text-gray-800 dark:text-gray-200 hover:text-orange-600"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ),
            )}
          </div>

          {/* Right Section */}
          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* Greeting */}
            <span
              className="text-gray-600 dark:text-gray-300 hidden lg:block cursor-pointer"
              onClick={() => {
                if (userName) {
                  navigate("/profile");
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
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border-2 border-orange-500 overflow-hidden hover:scale-105 transition shadow-sm bg-orange-50 dark:bg-gray-800"
                  title="Edit Profile"
                >
                  {userImage ? (
                    <img
                      src={userImage}
                      alt="User Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-orange-500 w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem("user");
                    sessionStorage.removeItem("token");
                    setUserName(null);
                    setUserImage(null);
                    navigate("/");
                  }}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors hidden lg:inline-block"
                >
                  Logout
                </button>
              </>
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
              {navLinks.map((link) =>
                link.name === "Hospital Portal" ? (
                  <li key={link.name} className="w-full">
                    <button
                      onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                      className="flex items-center justify-between w-full py-3 text-gray-600 dark:text-gray-300 hover:text-orange-600 font-medium"
                    >
                      {link.name}
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${portalDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {portalDropdownOpen && (
                      <div className="flex flex-col pl-4 border-l-2 border-orange-200 dark:border-gray-700 ml-2 space-y-1 mb-2 mt-1">
                        <button
                          onClick={() => {
                            navigate("/appointments");
                            toggleNavbar();
                          }}
                          className="w-full text-left block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                        >
                          Upcoming Appointments
                        </button>
                        <button
                          onClick={() => {
                            navigate("/active-admission");
                            toggleNavbar();
                          }}
                          className="w-full text-left block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                        >
                          Active Admission
                        </button>
                        <button
                          onClick={() => {
                            navigate("/medical-records");
                            toggleNavbar();
                          }}
                          className="w-full text-left block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                        >
                          Recent Medical Records
                        </button>
                        <button
                          onClick={() => {
                            navigate("/lab-reports");
                            toggleNavbar();
                          }}
                          className="w-full text-left block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                        >
                          Lab Orders & Reports
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admission-history");
                            toggleNavbar();
                          }}
                          className="w-full text-left block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                        >
                          Admission History
                        </button>
                        <button
                          onClick={() => {
                            navigate("/hospital-bills");
                            toggleNavbar();
                          }}
                          className="w-full text-left block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                        >
                          Hospital Bills
                        </button>
                        <button
                          onClick={() => {
                            navigate("/departments");
                            toggleNavbar();
                          }}
                          className="w-full text-left block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                        >
                          Departments
                        </button>
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                        <Link
                          to="/help"
                          onClick={toggleNavbar}
                          className="w-full text-left block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600"
                        >
                          Get Help
                        </Link>
                      </div>
                    )}
                  </li>
                ) : (
                  <li key={link.name} className="w-full">
                    <Link
                      to={link.path}
                      className="block py-3 text-gray-600 dark:text-gray-300 hover:text-orange-600 font-medium"
                      onClick={toggleNavbar}
                    >
                      {link.name}
                    </Link>
                  </li>
                ),
              )}
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
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    toggleNavbar();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 mb-4 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50"
                >
                  {userImage ? (
                    <img
                      src={userImage}
                      alt="User Logo"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
                  My Profile
                </button>
                <button
                  onClick={() => {
                    sessionStorage.removeItem("user");
                    sessionStorage.removeItem("token");
                    setUserName(null);
                    setUserImage(null);
                    toggleNavbar();
                    navigate("/");
                  }}
                  className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
