import { useState, useEffect } from "react";
import {
  Trash2,
  Loader,
  AlertCircle,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  CheckSquare,
  Award,
  Clock,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import DoctorDetailsModal from "../components/Modals/DoctorDetailsModal";
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from "../components/Table/AdminTable";

interface Doctor {
  _id: string;
  fullname: string;
  email: string;
  specialization: string[];
  fee?: number;
  experience?: string;
  isApproved: boolean;
  isVerified?: boolean;
  createdAt: string;
  phone?: string;
  city?: string;
}

export default function DoctorsPage() {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [deleting, setDeleting] = useState<string>("");
  const [approving, setApproving] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending"
  >("all");

  // ✅ Remove 5-second auto-refresh - Only fetch on mount
  useEffect(() => {
    console.log("👨‍⚕️ DoctorsPage: Initial load");
    fetchDoctors();
  }, [token]);

  // ✅ Update filtered doctors when search or filter changes (with debounce)
  useEffect(() => {
    let filtered = doctors.filter(
      (d) =>
        d.fullname.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        d.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (Array.isArray(d.specialization) &&
          d.specialization.some((s) =>
            s.toLowerCase().includes(debouncedSearch.toLowerCase()),
          )),
    );

    if (filterStatus === "approved") {
      filtered = filtered.filter((d) => d.isApproved);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter((d) => !d.isApproved);
    }

    setFilteredDoctors(filtered);
  }, [debouncedSearch, doctors, filterStatus]);

  const fetchDoctors = async () => {
    try {
      console.log("📡 Fetching doctors from API...");
      setRefreshing(true);
      setError(""); // Clear previous errors

      const response = await fetch("http://localhost:3001/api/admin/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Fetched doctors:", data.data.length);
      setDoctors(data.data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("❌ Fetch error:", err.message);
      setError(err.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (doctorId: string, currentStatus: boolean) => {
    try {
      setApproving(doctorId);
      setError(""); // Clear previous errors

      const response = await fetch(
        `http://localhost:3001/api/admin/doctors/${doctorId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isApproved: !currentStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update approval status");
      }

      // ✅ Optimistic update
      const updatedDoctors = doctors.map((d) =>
        d._id === doctorId ? { ...d, isApproved: !currentStatus } : d,
      );
      setDoctors(updatedDoctors);

      if (selectedDoctor?._id === doctorId) {
        setSelectedDoctor({ ...selectedDoctor, isApproved: !currentStatus });
      }

      console.log("✅ Doctor approval status updated");

      // ✅ Refetch after 500ms to verify persistence
      setTimeout(() => {
        fetchDoctors();
      }, 500);
    } catch (err: any) {
      console.error("❌ Approve error:", err.message);
      setError(err.message);
      // Refetch to restore actual state from server
      setTimeout(() => {
        fetchDoctors();
      }, 500);
    } finally {
      setApproving("");
    }
  };

  const handleDelete = async (doctorId: string) => {
    try {
      setDeleting(doctorId);
      setError(""); // Clear previous errors

      const response = await fetch(
        `http://localhost:3001/api/admin/doctors/${doctorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }

      console.log("✅ Doctor deleted");
      setDoctors(doctors.filter((d) => d._id !== doctorId));
      setSelectedDoctor(null);
    } catch (err: any) {
      console.error("❌ Delete error:", err.message);
      setError(err.message);
    } finally {
      setDeleting("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-slate-400">Loading doctors...</p>
        </div>
      </div>
    );
  }

  // ✅ Calculate counts for filters
  const approvedCount = doctors.filter((d) => d.isApproved).length;
  const pendingCount = doctors.filter((d) => !d.isApproved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl">
            <div className="text-3xl">👨‍⚕️</div>
          </div>
          <div>
            <h1 className="text-5xl  font-bold bg-gradient-to-r from-green-600 to-green-700 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent font-poppins">
              Manage Doctors
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-inter mt-1">
              Review and manage all medical professionals
            </p>
          </div>
        </div>
        <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6"></div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="primary"
            size="lg"
            isLoading={refreshing}
            onClick={fetchDoctors}
          >
            <RefreshCw className="w-5 h-5" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 hover:border-blue-400/80 dark:hover:border-blue-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  Total Doctors
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {doctors.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6 hover:border-green-400/80 dark:hover:border-green-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  Approved
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {approvedCount}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-900/30 dark:to-orange-800/30 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 rounded-2xl p-6 hover:border-orange-400/80 dark:hover:border-orange-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  Pending
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                  {pendingCount}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-2xl p-6 hover:border-purple-400/80 dark:hover:border-purple-600 transition">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Avg. Fee
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                ₹
                {doctors.length > 0
                  ? Math.round(
                      doctors.reduce((sum, d) => sum + (d.fee || 0), 0) /
                        doctors.length,
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-300">Error</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Search Doctors
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                filterStatus === "all"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              All ({doctors.length})
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                filterStatus === "approved"
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                  : "bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                filterStatus === "pending"
                  ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg"
                  : "bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <AdminTable
        headers={[
          "Name",
          "Email",
          "Specialization",
          "Experience",
          "Status",
          "Actions",
        ]}
      >
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <AdminTableRow key={doctor._id}>
              <AdminTableCell className="font-semibold">
                {doctor.fullname}
              </AdminTableCell>
              <AdminTableCell className="text-xs break-all">
                {doctor.email}
              </AdminTableCell>
              <AdminTableCell className="text-xs">
                {Array.isArray(doctor.specialization)
                  ? doctor.specialization.join(", ")
                  : doctor.specialization}
              </AdminTableCell>
              <AdminTableCell>{doctor.experience || "-"}</AdminTableCell>
              <AdminTableCell>
                <Badge
                  variant={doctor.isApproved ? "success" : "warning"}
                  size="sm"
                  icon={
                    doctor.isApproved ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )
                  }
                >
                  {doctor.isApproved ? "Approved" : "Pending"}
                </Badge>
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="p-2 text-blue-400 hover:bg-slate-700/50 rounded-lg transition"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApprove(doctor._id, doctor.isApproved)}
                    disabled={approving === doctor._id}
                    className={`p-2 rounded-lg transition disabled:opacity-50 ${
                      doctor.isApproved
                        ? "text-red-400 hover:bg-red-500/20"
                        : "text-green-400 hover:bg-green-500/20"
                    }`}
                    title={
                      doctor.isApproved ? "Reject doctor" : "Approve doctor"
                    }
                  >
                    {approving === doctor._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : doctor.isApproved ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    disabled={deleting === doctor._id}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                    title="Delete doctor"
                  >
                    {deleting === doctor._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </AdminTableCell>
            </AdminTableRow>
          ))
        ) : (
          <AdminTableRow>
            <AdminTableCell colSpan={6} className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No doctors found
              </p>
            </AdminTableCell>
          </AdminTableRow>
        )}
      </AdminTable>

      {/* Doctor Details Modal */}
      <DoctorDetailsModal
        doctor={selectedDoctor}
        isOpen={selectedDoctor !== null}
        onClose={() => setSelectedDoctor(null)}
        onApprove={handleApprove}
        onDelete={handleDelete}
        isApproving={approving === selectedDoctor?._id}
        isDeleting={deleting === selectedDoctor?._id}
      />
    </div>
  );
}
