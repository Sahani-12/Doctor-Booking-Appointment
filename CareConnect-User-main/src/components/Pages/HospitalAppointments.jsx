import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  MessageSquare,
  Video,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { hospitalAPI, videoAPI } from "@/services/api";
import BASE_URL from "@/constants/api";
import { useRealTimePolling } from "@/hooks/useRealTime";
import Navbar from "../Navbar";
import Footer from "../Footer";
import HospitalPortalNav from "../HospitalPortalNav";

const getStatusColor = (status) => {
  const statusMap = {
    confirmed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    completed:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    no_show: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  };
  return statusMap[status?.toLowerCase()] || statusMap.pending;
};

const AppointmentCard = ({ appointment, onJoinVideo }) => {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const canJoinVideo =
    appointment.status === "confirmed" &&
    new Date(appointment.date) >= new Date();

  const handleJoinVideo = () => {
    setIsJoining(true);
    // Grab the ID whether backend sends _id, id, or appointmentId
    const roomId = appointment._id || appointment.id || appointment.appointmentId;
    navigate(`/video?roomID=${roomId}`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 p-6 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Dr. {appointment.doctor?.fullname || "Doctor"}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {(appointment.doctor?.specialization || []).join(", ") ||
                "General Consultation"}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
              appointment.status,
            )}`}
          >
            {appointment.status
              ? appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)
              : "Pending"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-6">
        {/* Date & Time */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Date & Time
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(appointment.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              at {appointment.slot}
            </p>
          </div>
        </div>

        {/* Consultation Type */}
        {appointment.consultationType && (
          <div className="flex items-center gap-3">
            {appointment.consultationType === "video" ? (
              <Video className="h-5 w-5 text-blue-500" />
            ) : (
              <MapPin className="h-5 w-5 text-green-500" />
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consultation Type
              </p>
              <p className="font-semibold capitalize text-gray-900 dark:text-white">
                {appointment.consultationType}
              </p>
            </div>
          </div>
        )}

        {/* Doctor Contact */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            Doctor Contact
          </p>
          <div className="space-y-2">
            {appointment.doctor?.phone && (
              <a
                href={`tel:${appointment.doctor.phone}`}
                className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm transition hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {appointment.doctor.phone}
                </span>
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {canJoinVideo && (
            <button
              onClick={handleJoinVideo}
              disabled={isJoining}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3 font-semibold text-white transition disabled:opacity-50 hover:shadow-lg"
            >
              {isJoining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              {isJoining ? "Joining..." : "Join Video Call"}
            </button>
          )}
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            <MessageSquare className="h-4 w-4" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HospitalAppointmentsPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, completed, cancelled
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time polling for appointments
  useRealTimePolling(
    // Workaround for a bug in hospitalAPI.getMyAppointments() that was causing a
    // "/api/api/..." double path error. This fetch call constructs the correct URL.
    async () => {
      const res = await fetch(`${BASE_URL}/appointments/my`, {
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

      // Filter appointments
      if (filter !== "all") {
        data = data.filter((apt) => apt.status === filter);
      }

      // Sort by date descending (newest first)
      data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAppointments(data);
      setLoading(false);
    },
    (error) => {
      setError(error?.message || "Failed to load appointments");
      setLoading(false);
      console.error("Error fetching appointments:", error);
    },
    5000, // Poll every 5 seconds
    !!token, // Enable when token exists
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

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
                My Appointments
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage and track your scheduled consultations
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
              {["all", "confirmed", "pending", "completed", "cancelled"].map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-6 py-2 font-semibold transition ${
                      filter === f
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
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
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading your appointments...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-300">
                      Error Loading Appointments
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No appointments found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Book your first appointment with a doctor
                </p>
                <button
                  onClick={() => navigate("/doctor-search")}
                  className="mt-6 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 font-semibold text-white hover:shadow-lg"
                >
                  Book Appointment
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    onJoinVideo={() => {}}
                  />
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
