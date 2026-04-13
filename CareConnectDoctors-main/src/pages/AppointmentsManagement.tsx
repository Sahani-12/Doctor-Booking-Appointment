import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Clock,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  CheckCheck,
  XCircle,
  MessageSquare,
  Mail,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router";

import { Badge } from "../components/ui/modern/Badge";
import { Modal } from "../components/ui/modern/Modal";

import { useDebounce } from "../hooks/useDebounce";
import { API_BASE } from "../constants/api";

interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason: string;
  createdAt: string;
}

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState("");
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/appointments/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data.data || []);
      setLastUpdated(new Date());
      console.log("✅ Fetched appointments:", data.data?.length);
    } catch (err: any) {
      console.error("❌ Fetch error:", err.message);
      setError(err.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointmentId: string) => {
    try {
      setConfirming(appointmentId);
      setError("");

      const response = await fetch(
        `${API_BASE}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "confirmed" }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to confirm appointment");
      }

      const updatedAppointments = appointments.map((a) =>
        a._id === appointmentId ? { ...a, status: "confirmed" } : a,
      );
      setAppointments(updatedAppointments);
      // here

      if (selectedAppointment?._id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: "confirmed" });
      }

      setSuccess("Appointment confirmed successfully!");
      console.log("✅ Appointment confirmed");

      setTimeout(() => {
        fetchAppointments();
      }, 500);
    } catch (err: any) {
      console.error("❌ Confirm error:", err.message);
      setError(err.message);
      setTimeout(() => {
        fetchAppointments();
      }, 500);
    } finally {
      setConfirming("");
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      setDeleting(appointmentId);
      setError("");

      const response = await fetch(
        `${API_BASE}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "cancelled" }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      setAppointments(appointments.filter((a) => a._id !== appointmentId));
      if (selectedAppointment?._id === appointmentId) {
        setSelectedAppointment(null);
      }
      setSuccess("Appointment cancelled successfully!");
      console.log("✅ Appointment cancelled");
    } catch (err: any) {
      console.error("❌ Cancel error:", err.message);
      setError(err.message);
    } finally {
      setDeleting("");
    }
  };

  const openConsultation = (appointment: Appointment) => {
    navigate("/consult", { state: { appointment } });
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      debouncedSearch === "" ||
      a.patientName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      a.patientEmail.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus = filterStatus === "all" || a.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Please login to view appointments</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📅 Appointment Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review, confirm, and manage patient appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg dark:hover:bg-slate-800 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Total
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar
                  size={28}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg dark:hover:bg-slate-800 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Pending
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock
                  size={28}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg dark:hover:bg-slate-800 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Confirmed
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.confirmed}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle
                  size={28}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg dark:hover:bg-slate-800 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.completed}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users
                  size={28}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300 animate-in">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-300 animate-in">
            <CheckCircle size={20} className="flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="ml-auto">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by patient name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={fetchAppointments}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin mb-4">
                <RefreshCw
                  size={40}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Loading appointments...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar
                size={56}
                className="mx-auto mb-4 text-slate-300 dark:text-slate-600"
              />
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No appointments found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Patient
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {appointment.patientName}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <Mail size={14} />
                            {appointment.patientEmail}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {new Date(
                              appointment.appointmentDate,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <Clock size={14} />
                            {appointment.appointmentTime}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            appointment.status === "confirmed"
                              ? "success"
                              : appointment.status === "pending"
                                ? "warning"
                                : appointment.status === "completed"
                                  ? "info"
                                  : "danger"
                          }
                          size="sm"
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(appointment);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {appointment.status === "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirm(appointment._id);
                              }}
                              disabled={confirming === appointment._id}
                              className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 disabled:opacity-50"
                              title="Confirm Appointment"
                            >
                              <CheckCheck size={18} />
                            </button>
                          )}
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openConsultation(appointment);
                              }}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              title="Start Consultation"
                            >
                              <Video size={18} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(appointment._id);
                            }}
                            disabled={deleting === appointment._id}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                            title="Cancel Appointment"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {lastUpdated && (
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title={
          selectedAppointment
            ? `📋 ${selectedAppointment.patientName}'s Appointment`
            : ""
        }
        size="md"
      >
        {selectedAppointment && (
          <div className="space-y-5">
            {/* Patient Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Users size={16} />
                Patient Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Name
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedAppointment.patientName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Mail size={12} /> Email
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedAppointment.patientEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Info Card */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar size={16} />
                Appointment Details
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Date & Time
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(
                      selectedAppointment.appointmentDate,
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    <span className="text-purple-600 dark:text-purple-400">
                      {selectedAppointment.appointmentTime}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                    <MessageSquare size={12} /> Reason for Visit
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedAppointment.reason || "No reason specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Status
              </h3>
              <Badge
                variant={
                  selectedAppointment.status === "confirmed"
                    ? "success"
                    : selectedAppointment.status === "pending"
                      ? "warning"
                      : selectedAppointment.status === "completed"
                        ? "info"
                        : "danger"
                }
                size="lg"
              >
                {selectedAppointment.status.charAt(0).toUpperCase() +
                  selectedAppointment.status.slice(1)}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              {selectedAppointment.status === "pending" && (
                <button
                  onClick={() => {
                    handleConfirm(selectedAppointment._id);
                    setTimeout(() => setSelectedAppointment(null), 500);
                  }}
                  disabled={confirming === selectedAppointment._id}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck size={18} />
                  {confirming === selectedAppointment._id
                    ? "Confirming..."
                    : "Confirm Appointment"}
                </button>
              )}
              {selectedAppointment.status === "confirmed" && (
                <button
                  onClick={() => openConsultation(selectedAppointment)}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Video size={18} />
                  Start Consult
                </button>
              )}
              <button
                onClick={() => setSelectedAppointment(null)}
                className="flex-1 px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-all"
              >
                Close
              </button>
              {selectedAppointment.status !== "cancelled" &&
                selectedAppointment.status !== "completed" && (
                  <button
                    onClick={() => {
                      handleCancel(selectedAppointment._id);
                      setTimeout(() => setSelectedAppointment(null), 500);
                    }}
                    disabled={deleting === selectedAppointment._id}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={18} />
                    {deleting === selectedAppointment._id
                      ? "Cancelling..."
                      : "Cancel"}
                  </button>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
