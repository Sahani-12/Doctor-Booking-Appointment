import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userName, setUserName] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).fullname : null;
  });
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navLinks = [
    { name: "Find Doctor", path: "/doctor-search" },
    { name: "Consult", path: "/consult" },
    { name: "Get Help", path: "/help" },
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 py-3 backdrop-blur-sm bg-white/10 border-b border-[#f4f4f4]">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex items-center">
          <div
            className="cursor-pointer flex items-center flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
            <span className="text-xl tracking-tight">CareConnect</span>
          </div>

          {/* Desktop nav links - hidden on small screens */}
          <div className="hidden lg:flex space-x-6 ml-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-l text-gray-800 hover:text-orange-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* <span className="text-gray-600 hidden lg:block cursor-pointer" onClick={() => navigate("/user-dashboard/:username")}>
            {userName ? `Hi, ` + userName : "Welcome!"}
            </span> */}
            <span
              className="text-gray-600 hidden lg:block cursor-pointer"
              onClick={() => {
                if (userName)
                  navigate(`/user-dashboard/${encodeURIComponent(userName)}`);
              }}
            >
              {userName ? `Hi, ${userName}` : "Welcome!"}
            </span>

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

            {/* Hamburger button - visible on small screens, right corner */}
            <div className="lg:hidden ml-4">
              <button
                onClick={toggleNavbar}
                aria-label="Toggle navigation menu"
                className="text-gray-800 hover:text-orange-600 focus:outline-none"
              >
                {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileDrawerOpen && (
          <div className="fixed right-0 z-20 bg-white w-full p-8 flex flex-col justify-center items-start lg:hidden shadow-lg">
            <ul className="w-full space-y-4 mb-6">
              {navLinks.map((link) => (
                <li key={link.name} className="w-full">
                  <Link
                    to={link.path}
                    className="block py-3 text-gray-600 hover:text-orange-600 transition-colors"
                    onClick={toggleNavbar}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="w-full flex flex-col space-y-4">
              <div className="text-left py-2 text-gray-600 w-full">
                {userName ? `Hi, ` + userName : "Welcome!"}
              </div>
              {!userName ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      toggleNavbar();
                    }}
                    className="w-full py-3 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/signup");
                      toggleNavbar();
                    }}
                    className="w-full bg-gradient-to-r text-white from-orange-500 to-orange-700 py-3 rounded-md hover:from-orange-600 hover:to-orange-800 transition-colors"
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
                  className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Menu, X } from "lucide-react";
// import logo from "../assets/logo1.png";
// import { navItems } from "../constants/index";

// const Navbar = () => {
//   const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
//   const [userName, setUserName] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser).fullname : null;
//   });
//   const navigate = useNavigate();

//   const toggleNavbar = () => {
//     setMobileDrawerOpen(!mobileDrawerOpen);
//   };

//   return (
//     <nav className="sticky top-0 z-50 py-3 backdrop-blur-sm border-b border-[#f4f4f4]">
//       <div className="container px-4 mx-auto relative lg:text-sm">
//         <div className="flex justify-between items-center">
//           <div className="cursor-pointer flex items-center flex-shrink-0"
//           onClick={() => navigate("/")}>
//             <img className="h-10 w-10 mr-2" src={logo} alt="Logo" />
//             <span className="text-xl tracking-tight">Medconnect</span>
//           </div>

//           <ul className="hidden lg:flex ml-2 space-x-6">
//             {navItems.map((item, index) => (
//               <li key={index}>
//                 <a href={item.href}>{item.label}</a>
//               </li>
//             ))}
//           </ul>

//           <div className="hidden lg:flex justify-center space-x-12 items-center">
//             <div className="hidden lg:flex justify-center space-x-4 items-center">
//               <ul onClick={() => navigate("/user-dashboard/:username")} className="cursor-pointer">
//                 {userName ? userName : "Research"}
//               </ul>
//               {!userName ? (
//                 <button
//                   onClick={() => navigate("/signup")}
//                   className="bg-gradient-to-r text-white from-orange-500 to-orange-800 py-2 px-3 rounded-md"
//                 >
//                   Create an account
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => {

//                     localStorage.removeItem("user");
//                     setUserName(null);

//                   }}
//                   className="bg-red-500 text-white py-2 px-3 rounded-md"
//                 >
//                   Logout
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="lg:hidden md:flex flex-col justify-end">
//             <button onClick={toggleNavbar}>
//               {mobileDrawerOpen ? <X /> : <Menu />}
//             </button>
//           </div>
//         </div>

//         {mobileDrawerOpen && (
//           <div className="fixed right-0 z-20 bg-white w-full p-12 flex flex-col justify-center items-center lg:hidden">
//             <ul>
//               {navItems.map((item, index) => (
//                 <li key={index} className="py-4">
//                   <a href={item.href}>{item.label}</a>
//                 </li>
//               ))}

//               <li>Hello</li>
//             </ul>
//             <div className="flex space-x-6">
//               {!userName ? (
//                 <>
//                   <button
//                     onClick={() => navigate("/login")}
//                     className="py-2 px-3 border rounded-md"
//                   >
//                     Sign In
//                   </button>
//                   <button
//                     onClick={() => navigate("/signup")}
//                     className="bg-gradient-to-r text-white from-orange-500 to-orange-800 py-2 px-3 rounded-md"
//                   >
//                     Create an account
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={() => {
//                     localStorage.removeItem("user");
//                     setUserName(null);
//                     navigate("/login");
//                   }}
//                   className="bg-gradient-to-r text-white from-orange-500 to-orange-800 py-2 px-3 rounded-md"
//                 >
//                   Logout
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
