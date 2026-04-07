import Navbar from "../Navbar";
import Footer from "../Footer";
import DocterCard from "../../ui/Cards/DoctorsList";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import BASE_URL from "@/constants/api";
import Loader1 from "../../ui/DoctorsPageLoader";
import BottomLoader from "../../ui/DoctorsPageLoader2";

const DoctorSearch = () => {
  const location = useLocation();
  const searchTermFromRoute = location.state?.searchTerm || "";

  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchTermFromRoute);
  const [cityFilter, setcityFilter] = useState("");
  const [specialization, setspecialization] = useState("");
  const [language, setLanguage] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  // 🔥 Fetch API
  const fetchDoctors = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);

      const params = { page: pageNum, limit: 15 };

      if (searchTerm?.trim()) params.search = searchTerm.trim();
      if (cityFilter?.trim()) params.city = cityFilter.trim();
      if (specialization?.trim()) params.specialization = specialization.trim();
      if (language?.trim()) params.language = language.trim();

      const response = await axios.get(`${BASE_URL}/doctors`, {
        params,
      });

      const newDoctors = response.data.data || [];

      setDoctors((prev) => (append ? [...prev, ...newDoctors] : newDoctors));

      setHasMore(pageNum < response.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Filters change
  useEffect(() => {
    setPage(1);
    fetchDoctors(1, false);
  }, [searchTerm, cityFilter, specialization, language]);

  // 🔄 Pagination
  useEffect(() => {
    if (page > 1) {
      fetchDoctors(page, true);
    }
  }, [page]);

  // 🔥 Infinite Scroll
  const lastDoctorRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const filteredDoctors = doctors;

  return (
    <div className="bg-[#f4f4f4] min-h-screen">
      <Navbar initialsearchTerm={searchTermFromRoute} />

      <div className="max-w-7xl mx-auto pt-24 px-4">
        {/* 🔍 Search Bar */}
        <div className="bg-white shadow-md p-4 rounded-xl flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="📍 City..."
            value={cityFilter}
            onChange={(e) => setcityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border w-full sm:w-[200px] focus:outline-none"
          />

          <input
            type="text"
            placeholder="Search doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border focus:outline-none"
          />

          <input
            type="text"
            placeholder="Language..."
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 rounded-lg border w-full sm:w-[200px] focus:outline-none"
          />
        </div>

        {/* 🧠 Specialization */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {["Cardiologist", "Neurologist", "Dermatologist", "Pediatrician"].map(
            (spec) => (
              <button
                key={spec}
                onClick={() =>
                  setspecialization(specialization === spec ? "" : spec)
                }
                className={`px-4 py-1 rounded-full text-sm transition ${
                  specialization === spec
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {spec}
              </button>
            ),
          )}
        </div>

        {/* 📋 Doctor List */}
        <div className="pt-6">
          <h1 className="text-blue-600 text-lg mb-4">
            Showing results for{" "}
            <span className="font-bold">{searchTerm || "All Doctors"}</span>,
            city: <span className="font-bold">{cityFilter || "India"}</span>
          </h1>

          {/* 🔥 GRID FIXED */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredDoctors.length === 0 && !loading ? (
              <div className="col-span-full text-center text-gray-500 py-16">
                No doctors found. Try changing filters.
              </div>
            ) : (
              filteredDoctors.map((doctor, index) => {
                if (filteredDoctors.length === index + 1) {
                  return (
                    <div key={doctor._id} ref={lastDoctorRef}>
                      <DocterCard doctor={doctor} />
                    </div>
                  );
                } else {
                  return (
                    <div key={doctor._id}>
                      <DocterCard doctor={doctor} />
                    </div>
                  );
                }
              })
            )}

            {/* Loader */}
            {loading &&
              Array(6)
                .fill()
                .map((_, i) => <Loader1 key={i} />)}
          </div>

          {/* Bottom Loader */}
          {loading && <BottomLoader />}

          {/* End Message */}
          {!loading && !hasMore && (
            <div className="text-center text-gray-500 py-6">
              <hr className="mb-2" />
              <p>No more results to show</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorSearch;
