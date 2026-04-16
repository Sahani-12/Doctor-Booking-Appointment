import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Activity,
  FlaskConical,
  History,
  Receipt,
  Building,
} from "lucide-react";

const Slider = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userInfo, setUserInfo] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "profile", label: "Profile Info", icon: <User size={18} /> },
    {
      id: "upcoming-appointments",
      label: "Upcoming Appointments",
      icon: <Calendar size={18} />,
    },
    {
      id: "active-admission",
      label: "Active Admission",
      icon: <Activity size={18} />,
    },
    {
      id: "medical-records",
      label: "Recent Medical Records",
      icon: <FileText size={18} />,
    },
    {
      id: "lab-reports",
      label: "Lab Orders & Reports",
      icon: <FlaskConical size={18} />,
    },
    {
      id: "admission-history",
      label: "Admission History",
      icon: <History size={18} />,
    },
    {
      id: "hospital-bills",
      label: "Hospital Bills",
      icon: <Receipt size={18} />,
    },
    {
      id: "departments",
      label: "Departments",
      icon: <Building size={18} />,
    },
  ];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Fetch all doctors to extract departments and show recommendations
  useEffect(() => {
    setLoadingDepartments(true);
    fetch(`${BASE_URL}/doctors`)
      .then((r) => r.json())
      .then((d) => {
        const doctors = d.data || [];
        setAllDoctors(doctors);

        // Process specializations for departments
        const specializations = doctors.flatMap((doc) => doc.specialization);
        const uniqueSpecializations = [...new Set(specializations)];

        const departmentData = uniqueSpecializations.map((spec) => ({
          name: formatSpecialization(spec),
          id: spec,
          desc: `Find top doctors in ${formatSpecialization(spec)}.`,
        }));
        setDepartments(departmentData);
      })
      .catch(() => setAllDoctors([]))
      .finally(() => setLoadingDepartments(false));
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
                    onClick={() => navigate("/profile")}
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

          {/* Recommended Doctors Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Stethoscope />
              Recommended Doctors
            </h2>
            {allDoctors.length === 0 ? (
              <p className="text-muted-foreground">Loading doctors...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allDoctors.slice(0, 4).map((doc) => (
                  <Link
                    key={doc._id}
                    to={`/doctors-page/${doc._id}`}
                    className="flex gap-4 items-start p-4 rounded-xl border border-border bg-background hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <img
                      src={doctorAvatarUrl(doc)}
                      alt={doc.fullname}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    />
                    <div>
                      <h3 className="font-bold text-foreground">
                        Dr. {doc.fullname}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {formatSpecialization(doc.specialization)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.experience || "—"} yrs exp · {doc.city}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );

      case "medical-records":
        return <Documents />;

      case "upcoming-appointments":
        return <Appointment />;

      case "active-admission":
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-500/20">
              <Activity size={40} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Active Admission
            </h3>
            <p className="text-muted-foreground max-w-md">
              You are not currently admitted to the hospital. Any ongoing
              inpatient care details will appear here.
            </p>
          </div>
        );

      case "lab-reports":
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-4 border border-purple-100 dark:border-purple-500/20">
              <FlaskConical size={40} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Lab Reports
            </h3>
            <p className="text-muted-foreground max-w-md">
              You have no recent laboratory orders or test reports available at
              the moment.
            </p>
          </div>
        );

      case "admission-history":
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-500/10 text-slate-500 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-500/20">
              <History size={40} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Admission History
            </h3>
            <p className="text-muted-foreground max-w-md">
              Your past hospital admissions, treatments, and discharge summaries
              will be recorded here.
            </p>
          </div>
        );

      case "hospital-bills":
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-100 dark:border-green-500/20">
              <Receipt size={40} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Hospital Bills
            </h3>
            <p className="text-muted-foreground max-w-md">
              You have no pending or recent hospital bills to display.
            </p>
            <div className="mt-6 px-6 py-3 bg-muted rounded-xl inline-block font-semibold text-lg text-foreground border border-border">
              Current Balance: ₹0.00
            </div>
          </div>
        );

      case "departments":
        if (loadingDepartments) {
          return (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                Hospital Departments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="p-5 border border-border rounded-xl bg-background animate-pulse"
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg mb-4"></div>
                    <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-full bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">
              Hospital Departments
            </h2>
            <p className="text-muted-foreground mb-6">
              Click on a department to find and consult with our expert doctors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {departments.map((d, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/doctor-search?specialization=${d.id}`)}
                  className="p-5 border border-border rounded-xl bg-background hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Building size={24} />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{d.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 lg:p-6 lg:mt-4 mb-10">
      {/* Edit Modal */}
      <PatientProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialUser={userInfo}
        onSaved={(u) => setUserInfo(u)}
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar / Sub Drawer Menu */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border bg-muted/30 hidden md:block">
              <h3 className="font-bold text-lg text-foreground">
                Hospital Portal
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your healthcare
              </p>
            </div>
            <div className="flex flex-row md:flex-col p-2 md:p-3 gap-1.5 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/hospital-portal?tab=${tab.id}`, {
                      replace: true,
                    });
                  }}
                  className={`flex shrink-0 items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-orange-500 text-white shadow-md md:scale-[1.02]"
                      : "text-foreground hover:bg-orange-100 dark:hover:bg-orange-900"
                  }`}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full min-w-0">
          <div className="bg-card border border-border rounded-2xl p-5 md:p-8 shadow-sm min-h-[500px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
