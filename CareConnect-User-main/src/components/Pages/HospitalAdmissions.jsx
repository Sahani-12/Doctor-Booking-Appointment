import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
  User,
  Stethoscope,
  FileText,
  Phone,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { hospitalAPI } from "@/services/api";
import BASE_URL from "@/constants/api";
import { useRealTimePolling } from "@/hooks/useRealTime";
import Navbar from "../Navbar";
import Footer from "../Footer";
import HospitalPortalNav from "../HospitalPortalNav";

const AdmissionCard = ({ admission }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-blue-700";
      case "discharged":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "readmitted":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const admissionDate = new Date(admission.admissionDate);
  const dischargeDate = admission.dischargeDate
    ? new Date(admission.dischargeDate)
    : null;
  const dayCount = dischargeDate
    ? Math.ceil((dischargeDate - admissionDate) / (1000 * 60 * 60 * 24))
    : Math.ceil((new Date() - admissionDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {admission.wardType || "General Ward"}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Room #{admission.roomNumber || "Assigned"}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
              admission.status,
            )}`}
          >
            {admission.status
              ? admission.status.charAt(0).toUpperCase() +
                admission.status.slice(1)
              : "Active"}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Key Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <Calendar className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Admitted
              </p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {admissionDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Clock className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Duration
              </p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {dayCount} day{dayCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {admission.doctorName && (
            <div className="flex gap-3">
              <Stethoscope className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Doctor
                </p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {admission.doctorName}
                </p>
              </div>
            </div>
          )}

          {admission.wardLocation && (
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Location
                </p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {admission.wardLocation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Expandable Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-6 flex w-full items-center justify-between border-t border-gray-200 pt-6 text-left transition hover:text-green-600 dark:border-gray-800 dark:hover:text-green-400"
        >
          <span className="font-semibold text-gray-900 dark:text-white">
            Medical Details
          </span>
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {expanded && (
          <div className="mt-6 space-y-4 border-t border-gray-200 pt-6 dark:border-gray-800">
            {admission.primaryDiagnosis && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Primary Diagnosis
                </p>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {admission.primaryDiagnosis}
                </p>
              </div>
            )}

            {admission.secondaryDiagnosis && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Secondary Diagnosis
                </p>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {admission.secondaryDiagnosis}
                </p>
              </div>
            )}

            {admission.treatmentPlan && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Treatment Plan
                </p>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {admission.treatmentPlan}
                </p>
              </div>
            )}

            {admission.medications && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Medications
                </p>
                <div className="mt-2 space-y-1">
                  {typeof admission.medications === "object" ? (
                    Object.entries(admission.medications).map(
                      ([med, dosage]) => (
                        <p
                          key={med}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          • {med} - {dosage}
                        </p>
                      ),
                    )
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {admission.medications}
                    </p>
                  )}
                </div>
              </div>
            )}

            {admission.dischargeSummary && (
              <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                  Discharge Summary
                </p>
                <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">
                  {admission.dischargeSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            <FileText className="h-4 w-4" />
            Reports
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            <Phone className="h-4 w-4" />
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HospitalAdmissionsPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time polling for admissions
  useRealTimePolling(
    // Workaround for a bug in hospitalAPI that was causing a
    // "/api/api/..." double path error. This fetch call constructs the correct URL.
    async () => {
      const res = await fetch(`${BASE_URL}/hospital/admissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Request failed: ${res.status} ${errorBody}`);
      }
      return res.json();
    },
    (response) => {
      let data = response.data || [];

      if (filter !== "all") {
        data = data.filter((admission) => admission.status === filter);
      }

      setAdmissions(data);
      setLoading(false);
    },
    (error) => {
      setError(error?.message || "Failed to load admissions");
      setLoading(false);
      console.error("Error fetching admissions:", error);
    },
    10000, // Poll every 10 seconds
    !!token, // Enable when token exists
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  const activeAdmissions = admissions.filter((a) => a.status === "active");
  const dischargedAdmissions = admissions.filter(
    (a) => a.status === "discharged",
  );

  return (
    <>
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar Navigation */}
        <HospitalPortalNav
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={window.innerWidth < 1024}
        />

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Hospital Admissions
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View your admission history and current status
              </p>
            </div>

            {/* Summary */}
            {!loading && admissions.length > 0 && (
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Admissions
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {admissions.length}
                  </p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-950/20">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Active Admissions
                  </p>
                  <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {activeAdmissions.length}
                  </p>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Discharged
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                    {dischargedAdmissions.length}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Days
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {admissions.reduce((sum, a) => {
                      const start = new Date(a.admissionDate);
                      const end = a.dischargeDate
                        ? new Date(a.dischargeDate)
                        : new Date();
                      const days = Math.ceil(
                        (end - start) / (1000 * 60 * 60 * 24),
                      );
                      return sum + days;
                    }, 0)}
                  </p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
              {["all", "active", "discharged", "pending", "readmitted"].map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-6 py-2 font-semibold transition ${
                      filter === f
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ),
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex min-h-96 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading admissions...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-300">
                      Error Loading Admissions
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : admissions.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No admissions found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Your admission history will appear here
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {admissions.map((admission) => (
                  <AdmissionCard key={admission._id} admission={admission} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
