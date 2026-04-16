import { useEffect, useState } from "react";
import {
  Activity,
  Building2,
  Calendar,
  CreditCard,
  FlaskConical,
  Loader,
  Users,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../constants/api";

type Stats = {
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
};

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function HospitalAdminDashboardPage() {
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
    const loadDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load admin dashboard");
        }
        setStats(payload.data as Stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const cards = [
    { label: "Patients", value: stats.totalUsers, icon: <Users className="h-5 w-5" /> },
    { label: "Doctors", value: stats.totalDoctors, icon: <UserCheck className="h-5 w-5" /> },
    { label: "Pending Approvals", value: stats.pendingDoctors, icon: <Activity className="h-5 w-5" /> },
    { label: "Appointments", value: stats.totalAppointments, icon: <Calendar className="h-5 w-5" /> },
    { label: "Departments", value: stats.departments, icon: <Building2 className="h-5 w-5" /> },
    { label: "Active Admissions", value: stats.activeAdmissions, icon: <Activity className="h-5 w-5" /> },
    { label: "Pending Labs", value: stats.pendingLabOrders, icon: <FlaskConical className="h-5 w-5" /> },
    { label: "Collections Due", value: money(stats.pendingCollections), icon: <CreditCard className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-950 p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
            Hospital Command Center
          </p>
          <h1 className="mt-4 text-5xl font-bold">Admin operations overview</h1>
          <p className="mt-3 max-w-3xl text-sm text-cyan-50/80">
            Monitor hospital growth, operational workload, diagnostics, and
            collections from one admin dashboard.
          </p>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="w-fit rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                {card.icon}
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Revenue snapshot
            </h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Appointment revenue
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {money(stats.totalRevenue)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Gross hospital billing
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  {money(stats.grossBilling)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Operational focus
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                Doctor onboarding and hospital approvals remain active with{" "}
                <span className="font-semibold">{stats.pendingDoctors}</span> pending.
              </p>
              <p className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                Diagnostics queue currently holds{" "}
                <span className="font-semibold">{stats.pendingLabOrders}</span> open lab workflows.
              </p>
              <p className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                Inpatient load is at{" "}
                <span className="font-semibold">{stats.activeAdmissions}</span> active admissions.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Next actions
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                Review doctor approvals to keep specialist coverage growing.
              </p>
              <p className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                Use Hospital Ops to issue inpatient bills and add departments.
              </p>
              <p className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                Watch pending collections of{" "}
                <span className="font-semibold">{money(stats.pendingCollections)}</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
