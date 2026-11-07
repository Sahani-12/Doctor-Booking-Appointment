import Search from "../ui/Search";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useEffect, useState } from "react";
import { Stethoscope, CalendarCheck, ShieldCheck, Activity } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUserLoggedIn(true);
    }
  }, []);

  return (
    <div className="flex flex-col items-center mt-6 lg:mt-20">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide">
        CareConnect
        <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
          {" "}
          hospital care in one connected portal
        </span>
      </h1>
      <div className="mt-10 text-lg text-center text-neutral-500 ">
        <Search />
      </div>
      <div className="flex justify-center my-10">
        {!userLoggedIn && (
          <button
            onClick={() => navigate("/signup")}
            className="bg-gradient-to-r text-white from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md hover:from-orange-600 hover:to-orange-900 transition shadow-md"
          >
            Start for free
          </button>
        )}
        <button
          onClick={() => navigate(userLoggedIn ? "/appointments" : "/services")}
          className="py-3 px-4 mx-3 rounded-md border border-orange-700 shadow-sm hover:bg-orange-50 dark:hover:bg-neutral-800 transition"
        >
          {userLoggedIn ? "Open Hospital Portal" : "Explore Services"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full px-4 mt-8">
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3 text-orange-600 dark:text-orange-400 font-semibold text-lg">
            <Stethoscope className="w-6 h-6" />
            <h3>Specialist Consultations</h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            Connect directly with verified specialists across cardiology, neurology, orthopedics, and more with instant video consultation and digital prescriptions.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3 text-blue-600 dark:text-blue-400 font-semibold text-lg">
            <Activity className="w-6 h-6" />
            <h3>Complete Health Records</h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            Track active hospital admissions, diagnostic lab reports, upcoming appointment schedules, and medical history in one unified dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
