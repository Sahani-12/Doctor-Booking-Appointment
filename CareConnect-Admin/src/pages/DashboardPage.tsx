import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Calendar,
  CreditCard,
  AlertCircle,
  Loader,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../constants/api";

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  pendingDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data.data || stats);
    } catch (err: any) {
      setError(err.message || "Error loading dashboard");
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
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome to CareConnect Admin Panel
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 hover:border-blue-400/80 dark:hover:border-blue-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Users size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6 hover:border-green-400/80 dark:hover:border-green-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Total Doctors
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalDoctors}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <FileText
                  size={28}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 dark:from-amber-900/30 dark:to-amber-800/30 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-2xl p-6 hover:border-amber-400/80 dark:hover:border-amber-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Pending Approvals
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.pendingDoctors}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                <AlertCircle
                  size={28}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-2xl p-6 hover:border-purple-400/80 dark:hover:border-purple-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Total Appointments
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalAppointments}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <Calendar
                  size={28}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 dark:from-slate-900/30 dark:to-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 hover:border-slate-400/80 dark:hover:border-slate-600 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-900/40 rounded-lg">
                <CreditCard
                  size={28}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/doctor-approvals"
              className="p-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 rounded-lg text-amber-700 dark:text-amber-300 font-medium transition border border-amber-200 dark:border-amber-800"
            >
              Review Doctor Approvals
            </a>
            <a
              href="/users"
              className="p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg text-blue-700 dark:text-blue-300 font-medium transition border border-blue-200 dark:border-blue-800"
            >
              Manage Users
            </a>
            <a
              href="/doctors"
              className="p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-lg text-green-700 dark:text-green-300 font-medium transition border border-green-200 dark:border-green-800"
            >
              Manage Doctors
            </a>
            <a
              href="/payments"
              className="p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 rounded-lg text-purple-700 dark:text-purple-300 font-medium transition border border-purple-200 dark:border-purple-800"
            >
              View Payments
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
