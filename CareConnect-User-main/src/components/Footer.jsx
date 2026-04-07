import { resourcesLinks, platformLinks, communityLinks } from "../constants";
import Search from "../ui/Search3";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      {/* Top Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-400">
        <button onClick={() => navigate("/")} className="hover:underline">
          Home
        </button>
        <span className="mx-2">›</span>
        <button
          onClick={() => navigate("/doctor-search")}
          className="hover:underline"
        >
          Find doctors
        </button>
        <span className="mx-2">›</span>
        <button onClick={() => navigate("/services")} className="hover:underline">
          Services
        </button>
      </div>

      {/* CTA Section */}
      <div className="text-center py-12 border-t border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-3">
          Your Health, Our Priority
        </h2>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Access your medical data, book appointments, and manage your health
          seamlessly.
        </p>

        <div className="flex justify-center">
          <Search />
        </div>
      </div>

      {/* Links Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-white font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            {resourcesLinks.map((link, i) => (
              <li key={i}>
                <a href={link.href} className="hover:text-white transition">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Platform</h3>
          <ul className="space-y-2">
            {platformLinks.map((link, i) => (
              <li key={i}>
                <a href={link.href} className="hover:text-white transition">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Community</h3>
          <ul className="space-y-2">
            {communityLinks.map((link, i) => (
              <li key={i}>
                <a href={link.href} className="hover:text-white transition">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700 py-6 text-center text-sm text-gray-500">
        <p>🇮🇳 India</p>
        <p className="mt-1">© 2026 CareConnect. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
