import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Qrcodeimg from "./QrCodeGenerator";
import Appointment from "./AppointmentsSection";
import Documents from "./DocumentsSection"; // Assuming you have a Documents component
import BASE_URL from "@/constants/api";
import { doctorAvatarUrl, formatSpecialization } from "@/utils/mediaUrl";
import PatientProfileEditModal from "./PatientProfileEditModal";

const Slider = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userInfo, setUserInfo] = useState(null);
  const [recDoctors, setRecDoctors] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/doctors?limit=6`)
      .then((r) => r.json())
      .then((d) => setRecDoctors(d.data || []))
      .catch(() => setRecDoctors([]));
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = sessionStorage.getItem("token"); // token is stored in sessionStorage by Login
        const res = await fetch(`${BASE_URL}/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const data = await res.json();
        const u = data.data ?? data;
        setUserInfo(u);
        try {
          const prev = JSON.parse(sessionStorage.getItem("user") || "{}");
          sessionStorage.setItem("user", JSON.stringify({ ...prev, ...u }));
        } catch {
          sessionStorage.setItem("user", JSON.stringify(u));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* QR Code Section */}
            <div className="flex justify-center">
              <div className="bg-white rounded-xl p-4 ">
                <Qrcodeimg />
              </div>
            </div>

            {/* Patient Info Section */}
            <div className="md:col-span-2 bg-white rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-bold text-orange-600">
                  Patient Information
                </h2>
                {userInfo && (
                  <button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-medium hover:bg-orange-600"
                  >
                    Edit profile
                  </button>
                )}
              </div>
              {userInfo ? (
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong>Name:</strong> {userInfo.fullname}
                  </li>
                  <li>
                    <strong>City:</strong> {userInfo.city || "—"}
                  </li>
                  <li>
                    <strong>DOB:</strong> {userInfo.DOB || "—"}
                  </li>
                  <li>
                    <strong>Age:</strong>{" "}
                    {userInfo.age != null && userInfo.age !== ""
                      ? userInfo.age
                      : "—"}
                  </li>
                  <li>
                    <strong>Gender:</strong> {userInfo.gender || "—"}
                  </li>
                  <li>
                    <strong>Contact:</strong>{" "}
                    {userInfo.phone ? `+91-${userInfo.phone}` : "—"}
                  </li>
                </ul>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </div>
        );

      case "documents":
        return <Documents />; // Render your Documents component here

      case "appointments":
        return <Appointment />;

      case "recommendation":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-orange-600">
              Recommended doctors
            </h2>
            {recDoctors.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No suggestions yet. Try{" "}
                <Link to="/doctor-search" className="text-orange-600 underline">
                  finding a doctor
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recDoctors.map((doc) => (
                  <Link
                    key={doc._id}
                    to={`/doctors-page/${doc._id}`}
                    className="border border-orange-100 rounded-lg p-4 bg-orange-50 hover:bg-orange-100 transition-colors text-left block flex gap-3 items-start"
                  >
                    <img
                      src={doctorAvatarUrl(doc)}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover border border-white shadow shrink-0"
                    />
                    <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Dr. {doc.fullname}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatSpecialization(doc.specialization)}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      {doc.experience || "—"} experience
                      {doc.city ? ` · ${doc.city}` : ""}
                    </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <PatientProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialUser={userInfo}
        onSaved={(u) => setUserInfo(u)}
      />
      {/* Tabs */}
      <div className="flex flex-wrap bg-gray-100 rounded-lg overflow-hidden mb-6 shadow gap-px">
        {["profile", "documents", "appointments", "recommendation"].map(
          (tab) => (
            <button
              key={tab}
              className={`flex-1 min-w-[120px] py-3 px-2 text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-orange-100"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "profile"
                ? "Profile Info"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ),
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl p-6 shadow-md min-h-[300px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Slider;
