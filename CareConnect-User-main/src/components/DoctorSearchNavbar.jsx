import { Menu, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { navItems } from "../constants";
import SearchBox from "../ui/Search2";
import DropDown from "../ui/Buttons/DropDown";
import DarkMode from "../ui/Buttons/NotificationsOnOff";
import ProfilePopUp from "../ui/Cards/UserProfilePopUp";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [userName, setUserName] = useState(null);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserName(parsedUser.fullname);
    }
  }, []);

  // Close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUserName(null);
    navigate("/login"); // ✅ redirect
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b">
      <div className="container mx-auto px-4 flex justify-between items-center py-3">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} className="w-10 h-10" />
          <span className="text-xl font-semibold">CareConnect</span>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-6">
          <SearchBox />
          <DropDown />
          <DarkMode />

          {userName ? (
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsVisible(!isVisible)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                {userName}
              </button>

              {isVisible && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg"
                >
                  <ProfilePopUp />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-orange-500 to-orange-800 text-white px-4 py-2 rounded-md"
            >
              Sign Up
            </button>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="lg:hidden"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        >
          {mobileDrawerOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-black text-white transform ${
          mobileDrawerOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 z-40`}
      >
        <div className="p-4 flex flex-col gap-4 mt-10">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                navigate(item.href);
                setMobileDrawerOpen(false); // ✅ auto close
              }}
              className="text-left"
            >
              {item.label}
            </button>
          ))}

          <hr />

          {userName ? (
            <button onClick={handleLogout} className="bg-red-500 py-2 rounded">
              Logout
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button
                onClick={() => navigate("/signup")}
                className="bg-orange-500 py-2 rounded"
              >
                Signup
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
