import Navbar from "../Navbar";
import Footer from "../Footer";
import { features } from "../../constants/index";
import FeedbackStars from "../../ui/FeedBackStar";
import { Link } from "react-router-dom";
import { Video } from "lucide-react";

const AppointmentSchedule = () => {
  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto pt-20 px-6">
        <div className="relative mt-20 border-b border-neutral-300 dark:border-neutral-800 min-h-[800px]">
          {/* Heading */}
          <div className="text-center">
            <span className="bg-neutral-900 text-orange-500 rounded-full h-6 text-sm font-medium px-3 py-1 uppercase">
              Appointments
            </span>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking-wide text-gray-900 dark:text-white">
              Effortlessly Manage{" "}
              <span className="bg-gradient-to-r from-orange-500 to-orange-800 dark:from-orange-400 dark:to-yellow-400 text-transparent bg-clip-text">
                Your Health
              </span>
            </h2>
          </div>

          {/* Feedback Stars */}
          <div className="flex justify-center mt-6">
            <FeedbackStars />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-12">
            <Link
              to="/doctor-search"
              className="inline-flex rounded-lg bg-orange-500 text-white px-6 py-3 text-sm font-semibold hover:bg-orange-600 transition"
            >
              Book a Doctor Now
            </Link>

            <Link
              to="/login"
              className="inline-flex rounded-lg border border-orange-500 text-orange-600 px-6 py-3 text-sm font-semibold hover:bg-orange-50 dark:hover:bg-neutral-800 transition"
            >
              Sign in to Dashboard
            </Link>

            {/* Video Consultation Button */}
            <Link
              to={`/video?roomID=careconnect-demo`}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-6 py-3 text-sm font-semibold hover:bg-green-700 transition"
            >
              <Video size={18} />
              Start Video Consultation
            </Link>
          </div>

          {/* Features Section */}
          <div className="flex flex-wrap mt-10 lg:mt-20">
            {features.map((feature, index) => (
              <div key={index} className="w-full sm:w-1/2 lg:w-1/3">
                <div className="flex">
                  <div className="flex mx-6 h-10 w-10 p-2 bg-neutral-900 text-orange-700 justify-center items-center rounded-full">
                    {feature.icon}
                  </div>
                  <div>
                    <h5 className="mt-1 mb-4 text-xl text-gray-900 dark:text-white">
                      {feature.text}
                    </h5>
                    <p className="text-md p-2 mb-20 text-neutral-500 dark:text-neutral-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AppointmentSchedule;
