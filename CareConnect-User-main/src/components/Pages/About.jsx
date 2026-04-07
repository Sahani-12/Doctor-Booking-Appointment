import Navbar from "../Navbar";
import Footer from "../Footer";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          About CareConnect
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          CareConnect connects patients and doctors for scheduling, video-ready
          visits, and clear health records—built for modern clinics and home care.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-8">
          <li>Search verified doctors by city and specialty</li>
          <li>Book slots that sync to your dashboard</li>
          <li>Store documents securely for consultations</li>
        </ul>
        <Link
          to="/doctor-search"
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-orange-600"
        >
          Find a doctor
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default About;
