import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Loader2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { authFetch } from "@/utils/authFetch";

const currency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not scheduled";

const tone = (status = "") => {
  const value = status.toLowerCase();
  if (["completed", "confirmed", "paid", "discharged"].includes(value)) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  }
  if (
    ["ordered", "pending", "admitted", "ready-for-discharge"].includes(value)
  ) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  }
  if (
    [
      "processing",
      "sample-collected",
      "under-treatment",
      "partially-paid",
    ].includes(value)
  ) {
    return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
};

const Section = ({ title, kicker, children }) => (
  <section className="rounded-[2rem] border border-orange-100 bg-white/95 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
      {kicker}
    </p>
    <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
      {title}
    </h2>
    <div className="mt-6">{children}</div>
  </section>
);

export default function HospitalPortal() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [user, setUser] = useState(() =>
    JSON.parse(sessionStorage.getItem("user") || "null"),
  );
  const [dashboard, setDashboard] = useState(null);
  const [patientSummary, setPatientSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (isBackground = false) => {
      if (!user) return;
      if (!isBackground) setLoading(true);
      try {
        const patientId = user.id || user._id;
        const [dashboardResponse, summaryResponse] = await Promise.all([
          authFetch("/hospital/dashboard/overview"),
          patientId
            ? authFetch(`/hospital/patients/${patientId}/summary`)
            : Promise.resolve(null),
        ]);

        const dashboardPayload = await dashboardResponse.json();
        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardPayload.message || "Failed to load hospital portal",
          );
        }

        if (summaryResponse) {
          const summaryPayload = await summaryResponse.json();
          if (summaryResponse.ok) {
            setPatientSummary(summaryPayload.data);
          } else {
            console.error(
              "Could not load patient summary:",
              summaryPayload.message,
            );
          }
        }

        setDashboard(dashboardPayload.data);
      } catch (err) {
        if (!isBackground)
          setError(err.message || "Failed to load hospital portal");
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    loadDashboard();
    const intervalId = setInterval(() => loadDashboard(true), 10000); // Poll every 10 seconds
    return () => clearInterval(intervalId);
  }, [token, loadDashboard]);

  if (!token) {
    return (
      <>
        <Navbar />
        <div className="mx-auto min-h-[70vh] max-w-4xl px-6 py-24">
          <div className="rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-10 text-center dark:border-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
              Sign in to access your hospital portal
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              View admissions, lab orders, medical records, and billing in one
              place.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-700 px-6 py-3 font-medium text-white"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/doctor-search")}
                className="rounded-2xl border border-orange-300 px-6 py-3 font-medium text-orange-700 dark:border-gray-700 dark:text-orange-300"
              >
                Explore doctors
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="flex-1 rounded-[2rem] bg-gradient-to-r from-[#1f8a70] via-[#0b5d52] to-[#073b35] p-8 text-white shadow-2xl">
              <h1 className="text-4xl font-semibold sm:text-5xl">
                Hospital hub for {user.fullname || "Patient"}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-emerald-50/85 sm:text-lg">
                Your appointments, inpatient care, diagnostics, records, and
                billing are now connected in one place.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-emerald-50/85">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {user.city || "City not added yet"}
                </span>
                <button
                  onClick={() => navigate("/doctor-search")}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 font-medium transition hover:bg-white/15"
                >
                  Book doctor
                </button>
                <button
                  onClick={() => navigate("/consult")}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 font-medium transition hover:bg-white/15"
                >
                  Virtual consult
                </button>
              </div>
            </div>
            <button
              onClick={() => loadDashboard(false)}
              className="rounded-2xl bg-white/10 p-4 text-gray-600 backdrop-blur-sm transition hover:bg-white/20 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800/80"
              title="Refresh Dashboard"
            >
              <RefreshCw
                className={`h-6 w-6 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-500" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading your hospital dashboard...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  {
                    icon: <CalendarDays className="h-5 w-5" />,
                    label: "Appointments",
                    value:
                      patientSummary?.stats?.appointments ||
                      dashboard?.stats?.upcomingAppointments ||
                      0,
                  },
                  {
                    icon: <ClipboardList className="h-5 w-5" />,
                    label: "Records",
                    value:
                      patientSummary?.stats?.records ||
                      dashboard?.stats?.records ||
                      0,
                  },
                  {
                    icon: <FlaskConical className="h-5 w-5" />,
                    label: "Pending Labs",
                    value: dashboard?.stats?.pendingLabOrders || 0,
                  },
                  {
                    icon: <Building2 className="h-5 w-5" />,
                    label: "Active Admissions",
                    value: dashboard?.stats?.activeAdmission || 0,
                  },
                  {
                    icon: <CreditCard className="h-5 w-5" />,
                    label: "Balance",
                    value: currency(
                      patientSummary?.stats?.outstandingBalance ||
                        dashboard?.stats?.outstandingBalance ||
                        0,
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-orange-100 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70"
                  >
                    <div className="rounded-2xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300 w-fit">
                      {item.icon}
                    </div>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <Section title="Upcoming appointments" kicker="Care Timeline">
                  <div className="space-y-4">
                    {(
                      patientSummary?.appointments ||
                      dashboard?.upcomingAppointments ||
                      []
                    ).slice(0, 5).length ? (
                      (
                        patientSummary?.appointments ||
                        dashboard?.upcomingAppointments ||
                        []
                      )
                        .slice(0, 5)
                        .map((appointment) => (
                          <div
                            key={appointment._id}
                            className="rounded-3xl border border-orange-100 bg-orange-50/60 p-5 dark:border-gray-800 dark:bg-gray-950/60"
                          >
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {appointment.doctor?.fullname || "Doctor"}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {(appointment.doctor?.specialization || []).join(
                                ", ",
                              ) || "General consultation"}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(appointment.date)} at{" "}
                                {appointment.slot}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(
                                  appointment.status,
                                )}`}
                              >
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-orange-200 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        No upcoming appointments yet.
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="Active admission" kicker="Inpatient Watch">
                  {dashboard?.activeAdmission ? (
                    <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-6 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-emerald-100/80">
                            {dashboard.activeAdmission.department?.name}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold">
                            {dashboard.activeAdmission.roomNumber ||
                              "Ward pending"}
                          </h3>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(
                            dashboard.activeAdmission.status,
                          )}`}
                        >
                          {dashboard.activeAdmission.status}
                        </span>
                      </div>
                      <p className="mt-5 text-sm text-emerald-50/85">
                        {dashboard.activeAdmission.treatmentPlan ||
                          "Your treatment plan will appear here once updated by the care team."}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-orange-200 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                      No active inpatient admission right now.
                    </div>
                  )}
                </Section>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Section title="Recent medical records" kicker="Clinical Notes">
                  <div className="space-y-4">
                    {(patientSummary?.records || dashboard?.recentRecords || [])
                      .slice(0, 4)
                      .map((record) => (
                        <div
                          key={record._id}
                          className="rounded-3xl border border-slate-200 p-5 dark:border-gray-800"
                        >
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {record.diagnosis || "Clinical follow-up"}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {record.department?.name || "General medicine"} |{" "}
                            {record.doctor?.fullname}
                          </p>
                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            {record.chiefComplaint ||
                              record.notes ||
                              "Record added by your care team."}
                          </p>
                        </div>
                      ))}
                    {!(
                      patientSummary?.records ||
                      dashboard?.recentRecords ||
                      []
                    ).length && (
                      <div className="rounded-3xl border border-dashed border-orange-200 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        No medical records yet.
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="Lab orders and reports" kicker="Diagnostics">
                  <div className="space-y-4">
                    {(patientSummary?.labOrders || dashboard?.labOrders || [])
                      .slice(0, 4)
                      .map((order) => (
                        <div
                          key={order._id}
                          className="rounded-3xl border border-slate-200 p-5 dark:border-gray-800"
                        >
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {(order.tests || [])
                              .map((test) => test.name)
                              .join(", ")}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Ordered {formatDate(order.orderedAt)}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    {!(patientSummary?.labOrders || dashboard?.labOrders || [])
                      .length && (
                      <div className="rounded-3xl border border-dashed border-orange-200 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        No lab orders right now.
                      </div>
                    )}
                  </div>
                </Section>
              </div>

              <div className="mt-8">
                <Section title="Admission history" kicker="Inpatient Journey">
                  <div className="space-y-4">
                    {(patientSummary?.admissions || [])
                      .slice(0, 4)
                      .map((admission) => (
                        <div
                          key={admission._id}
                          className="rounded-3xl border border-slate-200 p-5 dark:border-gray-800"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {admission.admissionNumber}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {admission.department?.name || "Hospital ward"}{" "}
                                | Room {admission.roomNumber || "--"}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(
                                admission.status,
                              )}`}
                            >
                              {admission.status}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            {admission.reason ||
                              admission.diagnosis ||
                              "Admission details will appear here."}
                          </p>
                        </div>
                      ))}
                    {!patientSummary?.admissions?.length && (
                      <div className="rounded-3xl border border-dashed border-orange-200 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        No admission history available yet.
                      </div>
                    )}
                  </div>
                </Section>
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                <Section title="Hospital bills" kicker="Billing">
                  <div className="space-y-4">
                    {(patientSummary?.bills || dashboard?.bills || [])
                      .slice(0, 4)
                      .map((bill) => (
                        <div
                          key={bill._id}
                          className="rounded-3xl border border-slate-200 p-5 dark:border-gray-800"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {bill.billNumber}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {bill.department?.name || "Hospital services"} |
                                Due {formatDate(bill.dueDate || bill.issuedAt)}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(
                                bill.status,
                              )}`}
                            >
                              {bill.status}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-gray-950/70">
                              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                                Total
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                {currency(bill.totalAmount)}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-gray-950/70">
                              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                                Balance
                              </p>
                              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                {currency(bill.balanceDue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {!(patientSummary?.bills || dashboard?.bills || [])
                      .length && (
                      <div className="rounded-3xl border border-dashed border-orange-200 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        No hospital bills generated yet.
                      </div>
                    )}
                  </div>
                </Section>

                <Section title="Departments" kicker="Hospital Network">
                  <div className="space-y-4">
                    {(dashboard?.departments || [])
                      .slice(0, 5)
                      .map((department) => (
                        <div
                          key={department._id}
                          className="rounded-3xl border border-slate-200 p-5 dark:border-gray-800"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {department.name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {department.location || "Main block"} |{" "}
                                {department.floor || "Floor pending"}
                              </p>
                            </div>
                            <span
                              className="h-4 w-4 rounded-full"
                              style={{
                                backgroundColor: department.color || "#f97316",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    {!dashboard?.departments?.length && (
                      <div className="rounded-3xl border border-dashed border-orange-200 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                        Department directory unavailable.
                      </div>
                    )}
                  </div>
                </Section>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
