import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Loader2,
  AlertCircle,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Pill,
  Activity,
} from "lucide-react";
import { hospitalAPI } from "@/services/api";
import BASE_URL from "@/constants/api";
import { useRealTimePolling } from "@/hooks/useRealTime";
import Navbar from "../Navbar";
import Footer from "../Footer";
import HospitalPortalNav from "../HospitalPortalNav";

const RecordCard = ({ record }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {record.diagnosis || "Medical Record"}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              By Dr. {record.doctor?.fullname || "Doctor"}
            </p>
          </div>
          <span className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {record.visitType || "Consultation"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {/* Date */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(record.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Chief Complaint */}
        {record.chiefComplaint && (
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Chief Complaint
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {record.chiefComplaint}
            </p>
          </div>
        )}

        {/* Symptoms */}
        {record.symptoms && record.symptoms.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Symptoms
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {record.symptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {record.medications && record.medications.length > 0 && (
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              <Pill className="h-4 w-4" />
              Medications
            </p>
            <div className="mt-2 space-y-2">
              {record.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
                >
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    {med.name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    {med.dosage} - {med.frequency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vitals */}
        {record.vitals && Object.keys(record.vitals).length > 0 && (
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              <Activity className="h-4 w-4" />
              Vitals
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.entries(record.vitals).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20"
                >
                  <p className="text-xs capitalize text-green-700 dark:text-green-400">
                    {key}
                  </p>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Notes
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {record.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            <Eye className="h-4 w-4" />
            View Details
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HospitalMedicalRecordsPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time polling for medical records
  useRealTimePolling(
    // Workaround for a bug in hospitalAPI that was causing a
    // "/api/api/..." double path error. This fetch call constructs the correct URL.
    async () => {
      const res = await fetch(`${BASE_URL}/hospital/medical-records`, {
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
      setRecords(response.data || []);
      setLoading(false);
    },
    (error) => {
      setError(error?.message || "Failed to load medical records");
      setLoading(false);
      console.error("Error fetching medical records:", error);
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

  const filteredRecords = records.filter(
    (record) =>
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor?.fullname
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.chiefComplaint?.toLowerCase().includes(searchTerm.toLowerCase()),
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
                Medical Records
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View your complete medical history and clinical notes
              </p>
            </div>

            {/* Search & Filter */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by diagnosis, doctor, or symptoms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex min-h-96 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading medical records...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-300">
                      Error Loading Records
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No medical records found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Medical records from your consultations will appear here
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredRecords.map((record) => (
                  <RecordCard key={record._id} record={record} />
                ))}
              </div>
            )}

            {/* Stats */}
            {!loading && filteredRecords.length > 0 && (
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Total Records", value: records.length },
                  {
                    label: "This Month",
                    value: records.filter(
                      (r) =>
                        new Date(r.createdAt).getMonth() ===
                        new Date().getMonth(),
                    ).length,
                  },
                  {
                    label: "Medications Tracked",
                    value: records.filter((r) => r.medications?.length).length,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
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
