import { useEffect, useState } from "react";
import {
  BedDouble,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Loader2,
  Users,
} from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import { API_BASE } from "../constants/api";

type DashboardStats = {
  todayAppointments: number;
  activeAdmissions: number;
  openRecords: number;
  pendingLabOrders: number;
  totalPatients: number;
};

type PatientSummary = {
  _id: string;
  fullname: string;
  city?: string;
  email?: string;
};

type AppointmentSummary = {
  _id: string;
  date: string;
  slot: string;
  notes?: string;
  status: string;
  patient?: {
    fullname?: string;
  };
};

type DashboardPayload = {
  stats: DashboardStats;
  recentPatients: PatientSummary[];
  upcomingAppointments: AppointmentSummary[];
};

const badgeTone = (status: string) => {
  const normalized = status.toLowerCase();
  if (["confirmed", "completed"].includes(normalized)) {
    return "bg-emerald-500/15 text-emerald-300";
  }
  if (["pending", "ordered", "admitted"].includes(normalized)) {
    return "bg-amber-500/15 text-amber-300";
  }
  return "bg-slate-700 text-slate-200";
};

export default function HospitalHome() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setError("Doctor login required");
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/hospital/dashboard/overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Failed to load hospital dashboard");
        }

        setData(payload.data as DashboardPayload);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load hospital dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const stats = [
    {
      label: "Today's Appointments",
      value: data?.stats.todayAppointments ?? 0,
      icon: <CalendarDays className="h-5 w-5" />,
      tone: "from-sky-500/20 to-cyan-500/10 text-sky-300",
    },
    {
      label: "Active Admissions",
      value: data?.stats.activeAdmissions ?? 0,
      icon: <BedDouble className="h-5 w-5" />,
      tone: "from-emerald-500/20 to-teal-500/10 text-emerald-300",
    },
    {
      label: "Open Records",
      value: data?.stats.openRecords ?? 0,
      icon: <ClipboardList className="h-5 w-5" />,
      tone: "from-violet-500/20 to-fuchsia-500/10 text-violet-300",
    },
    {
      label: "Pending Lab Orders",
      value: data?.stats.pendingLabOrders ?? 0,
      icon: <FlaskConical className="h-5 w-5" />,
      tone: "from-amber-500/20 to-orange-500/10 text-amber-300",
    },
    {
      label: "Tracked Patients",
      value: data?.stats.totalPatients ?? 0,
      icon: <Users className="h-5 w-5" />,
      tone: "from-rose-500/20 to-pink-500/10 text-rose-300",
    },
  ];

  return (
    <>
      <PageMeta
        title="CareConnect Doctor | Hospital Operations Dashboard"
        description="Doctor control center for appointments, admissions, records, and diagnostics."
      />

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-500" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Loading hospital operations...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-cyan-950 p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
              Doctor Hospital Command
            </p>
            <h1 className="mt-4 text-4xl font-semibold">
              Track rounds, consults, labs, and inpatient care from one place
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-cyan-50/80">
              The dashboard now reflects your live operational workload across
              OPD, inpatient admissions, and diagnostics.
            </p>
          </section>

          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((item) => (
              <div
                key={item.label}
                className={`rounded-3xl border border-slate-800 bg-gradient-to-br ${item.tone} p-5`}
              >
                <div className="w-fit rounded-2xl bg-white/10 p-3">
                  {item.icon}
                </div>
                <p className="mt-4 text-sm text-slate-200">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Consultation Queue
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Upcoming appointments
                </h2>
              </div>

              <div className="space-y-4">
                {data?.upcomingAppointments?.length ? (
                  data.upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            {appointment.patient?.fullname || "Patient"}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {appointment.slot}
                          </p>
                          <p className="mt-3 text-sm text-slate-400">
                            {appointment.notes || "Routine consultation"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeTone(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
                    No upcoming consultations scheduled.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  Patient Roster
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Recent patients
                </h2>
              </div>

              <div className="space-y-4">
                {data?.recentPatients?.length ? (
                  data.recentPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <p className="text-lg font-semibold text-white">
                        {patient.fullname}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {patient.email || "Email unavailable"}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                        {patient.city || "City pending"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
                    Patient summaries will appear here as appointments and
                    hospital records build up.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
