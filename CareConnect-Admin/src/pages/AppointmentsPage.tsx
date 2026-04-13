import { useState, useEffect } from "react";
import {
  Loader,
  AlertCircle,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import { API_BASE } from "../constants/api";

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    fullname: string;
    email: string;
    city?: string;
  } | null;
  doctor: {
    _id: string;
    fullname: string;
    email: string;
    specialization?: string[];
  } | null;
  date: string;
  slot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

export default function AppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const debouncedSearch = useDebounce(search, 300);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments.filter(
      (a) =>
        a.patient?.fullname
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        a.doctor?.fullname
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        false,
    );

    if (filterStatus !== "all") {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    setFilteredAppointments(filtered);
  }, [debouncedSearch, appointments, filterStatus]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE}/admin/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();
      setAppointments(data.data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <RefreshCw size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading appointments...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Calculate stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📅 Appointment Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review and manage all patient appointments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 hover:border-blue-400/80 dark:hover:border-blue-600 transition">
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

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6 hover:border-green-400/80 dark:hover:border-green-600 transition">
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

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6 hover:border-green-400/80 dark:hover:border-green-600 transition">
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

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-2xl p-6 hover:border-purple-400/80 dark:hover:border-purple-600 transition">
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
                <CheckCircle
                  size={28}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300 animate-in">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto">
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
              placeholder="Search by patient or doctor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Calendar
                        size={56}
                        className="mx-auto mb-4 text-slate-300 dark:text-slate-600"
                      />
                      <p className="text-slate-600 dark:text-slate-400 text-lg">
                        No appointments found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr
                      key={apt._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {apt.patient?.fullname || "Unknown Patient"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {apt.patient?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {apt.doctor?.fullname || "Unknown Doctor"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-700 dark:text-slate-300">
                          {new Date(apt.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {apt.slot}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            apt.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : apt.status === "confirmed"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : apt.status === "cancelled"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}
                        >
                          {apt.status.charAt(0).toUpperCase() +
                            apt.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
