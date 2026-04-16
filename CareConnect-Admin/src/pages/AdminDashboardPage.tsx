import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
  Loader,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../constants/api";

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  pendingDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  departments: number;
  activeAdmissions: number;
  pendingLabOrders: number;
  grossBilling: number;
  pendingCollections: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: number;
  color: string;
}

const StatCard = ({ icon, label, value, trend, color }: StatCardProps) => (
  <div
    className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 mt-2 ${trend >= 0 ? "text-green-200" : "text-red-200"}`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span className="text-xs font-semibold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-white/20 rounded-xl">{icon}</div>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    departments: 0,
    activeAdmissions: 0,
    pendingLabOrders: 0,
    grossBilling: 0,
    pendingCollections: 0,
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
        throw new Error("Failed to fetch dashboard stats");
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-6 mb-6">
          <img
            src="/images/user/owner.jpg"
            alt="Admin profile"
            className="w-16 h-16 rounded-full object-cover border-4 border-blue-500 shadow-lg flex-shrink-0"
          />
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent font-poppins">
              Welcome, Anand
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-inter mt-1">
              Dashboard • Overview & Management
            </p>
          </div>
        </div>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-800/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 hover:border-blue-400/80 dark:hover:border-blue-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Users
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {stats.totalUsers}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-2xl p-6 hover:border-purple-400/80 dark:hover:border-purple-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Doctors
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {stats.totalDoctors}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-900/30 dark:to-orange-800/30 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 rounded-2xl p-6 hover:border-orange-400/80 dark:hover:border-orange-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Pending Approvals
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {stats.pendingDoctors}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6 hover:border-green-400/80 dark:hover:border-green-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Appointments
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.totalAppointments}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 dark:from-pink-900/30 dark:to-pink-800/30 backdrop-blur-sm border border-pink-200/50 dark:border-pink-700/50 rounded-2xl p-6 hover:border-pink-400/80 dark:hover:border-pink-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-pink-600 dark:text-pink-400 mt-2">
                ₹{(stats.totalRevenue / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/40 rounded-lg">
              <DollarSign className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 dark:from-cyan-900/30 dark:to-cyan-800/30 backdrop-blur-sm border border-cyan-200/50 dark:border-cyan-700/50 rounded-2xl p-6 hover:border-cyan-400/80 dark:hover:border-cyan-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Departments
              </p>
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">
                {stats.departments}
              </p>
            </div>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
              <Stethoscope className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 dark:from-emerald-900/30 dark:to-emerald-800/30 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl p-6 hover:border-emerald-400/80 dark:hover:border-emerald-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Active Admissions
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.activeAdmissions}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 dark:from-amber-900/30 dark:to-amber-800/30 backdrop-blur-sm border border-amber-200/50 dark:border-amber-700/50 rounded-2xl p-6 hover:border-amber-400/80 dark:hover:border-amber-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Pending Labs
              </p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                {stats.pendingLabOrders}
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <Loader className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/10 dark:from-rose-900/30 dark:to-rose-800/30 backdrop-blur-sm border border-rose-200/50 dark:border-rose-700/50 rounded-2xl p-6 hover:border-rose-400/80 dark:hover:border-rose-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Gross Billing
              </p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-2">
                â‚¹{(stats.grossBilling / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
              <DollarSign className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-900/30 dark:to-orange-800/30 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 rounded-2xl p-6 hover:border-orange-400/80 dark:hover:border-orange-600 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Pending Collections
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                â‚¹{(stats.pendingCollections / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Overview */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Activity Overview</h2>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {[
              { label: "User Registrations", value: "2,543", change: "+12%" },
              { label: "Doctor Signups", value: "384", change: "+8%" },
              { label: "Appointments Booked", value: "1,289", change: "+15%" },
              { label: "Transactions", value: "892", change: "+22%" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
              >
                <span className="text-slate-300">{item.label}</span>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">{item.value}</span>
                  <span className="text-green-400 text-sm font-semibold">
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Stats</h2>

          <div className="space-y-4">
            {[
              { label: "Avg. AppointmentValue", value: "₹2,450" },
              { label: "Active Sessions", value: "147" },
              { label: "System Uptime", value: "99.9%" },
              { label: "Pending Tasks", value: "23" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-slate-700/50 to-transparent rounded-lg border border-slate-600/30"
              >
                <p className="text-slate-400 text-sm mb-1">{item.label}</p>
                <p className="text-white font-bold text-lg">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>

        <div className="space-y-3">
          {[
            {
              type: "doctor",
              message: "Dr. Rajesh Kumar signed up",
              time: "2 min ago",
            },
            {
              type: "appointment",
              message: "New appointment scheduled",
              time: "5 min ago",
            },
            {
              type: "user",
              message: "User verification completed",
              time: "10 min ago",
            },
            {
              type: "payment",
              message: "Payment received ₹5,000",
              time: "15 min ago",
            },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    activity.type === "doctor"
                      ? "bg-purple-500/20"
                      : activity.type === "appointment"
                        ? "bg-blue-500/20"
                        : activity.type === "user"
                          ? "bg-green-500/20"
                          : "bg-pink-500/20"
                  }`}
                >
                  <Activity className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-slate-300">{activity.message}</p>
              </div>
              <span className="text-slate-500 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
