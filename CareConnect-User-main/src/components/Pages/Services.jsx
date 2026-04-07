import Navbar from "../Navbar";
import Footer from "../Footer";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Outpatient booking",
    body: "Browse doctors, compare fees, and reserve a time that fits your day.",
  },
  {
    title: "Health records",
    body: "Upload reports and scans so your care team has context for each visit.",
  },
  {
    title: "Video-ready visits",
    body: "After booking, join from your dashboard when your doctor starts the session.",
  },
  {
    title: "Help & FAQs",
    body: "Get answers on billing, privacy, and using CareConnect on mobile.",
  },
];

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Services
        </h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Everything in one place so you spend less time coordinating care and more
          time feeling better.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {s.title}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/help"
            className="inline-flex rounded-lg border border-orange-500 text-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-50"
          >
            Help center
          </Link>
          <Link
            to="/doctor-search"
            className="inline-flex rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-medium hover:bg-orange-600"
          >
            Book now
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
