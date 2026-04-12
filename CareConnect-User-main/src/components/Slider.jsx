import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Qrcodeimg from "./QrCodeGenerator";
import Appointment from "./AppointmentsSection";
import Documents from "./DocumentsSection";
import BASE_URL from "@/constants/api";
import { doctorAvatarUrl, formatSpecialization } from "@/utils/mediaUrl";
import PatientProfileEditModal from "./PatientProfileEditModal";
import {
  User,
  FileText,
  Calendar,
  Stethoscope,
  QrCode,
  Pencil,
} from "lucide-react";

const Slider = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userInfo, setUserInfo] = useState(null);
  const [recDoctors, setRecDoctors] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  // Fetch recommended doctors
  useEffect(() => {
    fetch(`${BASE_URL}/doctors?limit=6`)
      .then((r) => r.json())
      .then((d) => setRecDoctors(d.data || []))
      .catch(() => setRecDoctors([]));
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const u = data.data ?? data;
        setUserInfo(u);

        sessionStorage.setItem("user", JSON.stringify(u));
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const tabs = [
    { id: "profile", label: "Profile Info", icon: <User size={16} /> },
    { id: "documents", label: "Documents", icon: <FileText size={16} /> },
    { id: "appointments", label: "Appointments", icon: <Calendar size={16} /> },
    {
      id: "recommendation",
      label: "Recommendations",
      icon: <Stethoscope size={16} />,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-card border border-border rounded-xl p-4 shadow">
                <QrCode className="mx-auto mb-2 text-primary" />
                <Qrcodeimg />
              </div>
            </div>

            {/* Patient Info */}
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary">
                  Patient Information
                </h2>
                {userInfo && (
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                )}
              </div>

              {userInfo ? (
                <ul className="space-y-2 text-muted-foreground">
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
                    <strong>Age:</strong> {userInfo.age || "—"}
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
                <p className="text-muted-foreground">Loading...</p>
              )}
            </div>
          </div>
        );

      case "documents":
        return <Documents />;

      case "appointments":
        return <Appointment />;

      case "recommendation":
        return (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">
              Recommended Doctors
            </h2>

            {recDoctors.length === 0 ? (
              <p className="text-muted-foreground">
                No suggestions yet.{" "}
                <Link to="/doctor-search" className="text-primary underline">
                  Find a doctor
                </Link>
                .
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recDoctors.map((doc) => (
                  <Link
                    key={doc._id}
                    to={`/doctors-page/${doc._id}`}
                    className="flex gap-3 items-start p-4 rounded-xl border border-border bg-card hover:shadow-lg transition"
                  >
                    <img
                      src={doctorAvatarUrl(doc)}
                      alt={doc.fullname}
                      className="w-14 h-14 rounded-full object-cover border"
                    />
                    <div>
                      <h3 className="font-semibold">Dr. {doc.fullname}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatSpecialization(doc.specialization)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {doc.experience || "—"} yrs
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
      {/* Edit Modal */}
      <PatientProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialUser={userInfo}
        onSaved={(u) => setUserInfo(u)}
      />

      {/* Tabs */}
      <div className="flex flex-wrap bg-muted rounded-lg overflow-hidden mb-6 shadow">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-orange-500 text-white"
                : "text-foreground hover:bg-orange-100 dark:hover:bg-orange-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-md min-h-[300px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default Slider;
