import Navbar from "../Navbar";
import Footer from "../Footer";
import DocterCard from "../../ui/Cards/DoctorsList";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import BASE_URL from "@/constants/api";
import Loader1 from "../../ui/DoctorsPageLoader";
import BottomLoader from "../../ui/DoctorsPageLoader2";

const DoctorSearch = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 🔍 AI Symptom Checker se aane wala specialization
  const specializationFromURL = searchParams.get("specialization") || "";

  const searchTermFromRoute = location.state?.searchTerm || "";

  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchTermFromRoute);
  const [cityFilter, setCityFilter] = useState("");
  const [specialization, setSpecialization] = useState(specializationFromURL);
  const [language, setLanguage] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  // 🔥 Fetch Doctors API
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

      const newDoctors = response.data?.data || [];

      setDoctors((prev) => (append ? [...prev, ...newDoctors] : newDoctors));

      setHasMore(pageNum < (response.data?.pagination?.totalPages || 1));
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 AI se specialization aane par filter update kare
  useEffect(() => {
    if (specializationFromURL) {
      setSpecialization(specializationFromURL);
    }
  }, [specializationFromURL]);

  // 🔄 Filters change hone par data reload kare
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

  // 🧠 Specialization List
  const specializationsList = [
    "General Physician",
    "Cardiologist",
    "Neurologist",
    "Dermatologist",
    "Pediatrician",
    "Orthopedic",
    "Gynecologist",
    "Pulmonologist",
    "ENT Specialist",
    "Psychiatrist",
    "Urologist",
  ];

  return (
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      <Navbar initialsearchTerm={searchTermFromRoute} />

      <div className="max-w-7xl mx-auto pt-24 px-4">
        {/* 🔍 Search Bar */}
        <div className="bg-card text-card-foreground shadow-md p-4 rounded-xl flex flex-wrap gap-3 border border-border">
          <input
            type="text"
            placeholder="📍 City..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground w-full sm:w-[200px] focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="text"
            placeholder="Search doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <input
            type="text"
            placeholder="Language..."
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground w-full sm:w-[200px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* 🧠 Specialization Filters */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {specializationsList.map((spec) => (
            <button
              key={spec}
              onClick={() =>
                setSpecialization(specialization === spec ? "" : spec)
              }
              className={`px-4 py-1 rounded-full text-sm transition ${
                specialization === spec
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* 📋 Doctor List */}
        <div className="pt-6">
          <h1 className="text-primary text-lg mb-4">
            Showing results for{" "}
            <span className="font-bold">{searchTerm || "All Doctors"}</span>,
            city: <span className="font-bold">{cityFilter || "India"}</span>
            {specialization && (
              <>
                , specialization:{" "}
                <span className="font-bold text-green-600">
                  {specialization}
                </span>
              </>
            )}
          </h1>

          {/* 🔥 Doctors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {doctors.length === 0 && !loading ? (
              <div className="col-span-full text-center text-muted-foreground py-16">
                No doctors found. Try changing filters.
              </div>
            ) : (
              doctors.map((doctor, index) => {
                if (doctors.length === index + 1) {
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
            <div className="text-center text-muted-foreground py-6">
              <hr className="mb-2 border-border" />
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
