import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";
import Search from "../ui/Search";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useEffect, useState } from "react";

const HeroSection = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("token");
      setUserLoggedIn(Boolean(storedUser && storedToken));
    };

    checkLogin();
    window.addEventListener("userUpdated", checkLogin);
    return () => window.removeEventListener("userUpdated", checkLogin);
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
      <div className="flex mt-10 justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="rounded-lg w-1/2 border border-orange-700 shadow-sm shadow-orange-400 mx-2 my-4"
        >
          <source src={video1} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="rounded-lg w-1/2 border border-orange-700 shadow-sm shadow-orange-400 mx-2 my-4"
        >
          <source src={video2} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default HeroSection;
