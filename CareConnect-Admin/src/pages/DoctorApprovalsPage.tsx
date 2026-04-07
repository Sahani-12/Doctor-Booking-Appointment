import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Stethoscope,
  Clock,
  Award,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface PendingDoctor {
  _id: string;
  fullname: string;
  email: string;
  specialization: string[];
  experience?: string;
  fee?: number;
  isApproved: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export default function DoctorApprovalsPage() {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState<string>("");

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3001/api/admin/doctors/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch doctors");

      const data = await response.json();
      setDoctors(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId: string) => {
    try {
      setApproving(doctorId);
      const response = await fetch(
        `http://localhost:3001/api/admin/doctors/${doctorId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isApproved: true }),
        },
      );

      if (!response.ok) throw new Error("Failed to approve doctor");

      setDoctors(
        doctors.map((d) =>
          d._id === doctorId ? { ...d, isApproved: true } : d,
        ),
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApproving("");
    }
  };

  const handleReject = async (doctorId: string) => {
    try {
      setApproving(doctorId);
      const response = await fetch(
        `http://localhost:3001/api/admin/doctors/${doctorId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isApproved: false }),
        },
      );

      if (!response.ok) throw new Error("Failed to reject doctor");

      setDoctors(
        doctors.map((d) =>
          d._id === doctorId ? { ...d, isApproved: false } : d,
        ),
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApproving("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading pending approvals...
          </p>
        </div>
      </div>
    );
  }

  const pendingDoctors = doctors.filter((d) => !d.isApproved);
  const approvedDoctors = doctors.filter((d) => d.isApproved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Doctor Approvals
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review and manage doctor registration requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg dark:hover:bg-slate-800 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Pending Approvals
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {pendingDoctors.length}
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
                  Approved Doctors
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {approvedDoctors.length}
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
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Pending Doctors List */}
        {pendingDoctors.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              All Caught Up!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              There are no pending doctor approvals at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg dark:hover:bg-slate-800/80 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {doctor.fullname}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {doctor.email}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                    Pending Review
                  </span>
                </div>

                {/* Doctor Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        Specialization
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {Array.isArray(doctor.specialization)
                        ? doctor.specialization.join(", ")
                        : doctor.specialization || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        Experience
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {doctor.experience || "Not specified"}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                        Consultation Fee
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      ₹{doctor.fee || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(doctor._id)}
                    disabled={approving === doctor._id}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
                  >
                    {approving === doctor._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {approving === doctor._id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(doctor._id)}
                    disabled={approving === doctor._id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
                  >
                    {approving === doctor._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {approving === doctor._id ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
