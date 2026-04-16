import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import {
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Loader2,
  NotebookPen,
  ReceiptIndianRupee,
  Stethoscope,
} from "lucide-react";
import { API_BASE } from "../constants/api";

type Patient = {
  _id: string;
  fullname: string;
  email?: string;
  city?: string;
  appointmentsCount?: number;
  activeAdmissions?: number;
};

type Department = { _id: string; name: string };
type AppointmentItem = { _id: string; date: string; slot: string; status: string; notes?: string };
type RecordItem = { _id: string; diagnosis?: string; chiefComplaint?: string; notes?: string; createdAt: string; department?: { name?: string } };
type AdmissionItem = { _id: string; admissionNumber: string; status: string; roomNumber?: string; reason?: string; diagnosis?: string; department?: { name?: string } };
type LabOrderItem = { _id: string; orderNumber: string; status: string; clinicalNotes?: string; tests?: Array<{ name: string; status?: string }> };
type BillItem = { _id: string; billNumber: string; status: string; totalAmount?: number; balanceDue?: number; dueDate?: string; department?: { name?: string } };
type Summary = {
  patient: Patient;
  stats: { appointments: number; records: number; admissions: number; labOrders: number; outstandingBalance: number };
  appointments: AppointmentItem[];
  records: RecordItem[];
  admissions: AdmissionItem[];
  labOrders: LabOrderItem[];
  bills: BillItem[];
};

type Mode = "record" | "admission" | "lab" | null;

const emptyForm = {
  departmentId: "",
  diagnosis: "",
  detail: "",
  notes: "",
  tests: "",
  roomNumber: "",
  appointmentId: "",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Not scheduled";

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const tone = (status = "") => {
  const value = status.toLowerCase();
  if (["confirmed", "completed", "paid", "discharged"].includes(value)) return "bg-emerald-500/15 text-emerald-300";
  if (["pending", "ordered", "admitted", "ready-for-discharge"].includes(value)) return "bg-amber-500/15 text-amber-300";
  if (["processing", "sample-collected", "under-treatment", "partially-paid"].includes(value)) return "bg-sky-500/15 text-sky-300";
  return "bg-slate-700 text-slate-200";
};

export default function PatientsHubPage() {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const queryPatientId = query.get("patient") || "";
  const queryAppointmentId = query.get("appointment") || "";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>(null);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);

  const selectedAppointment = summary?.appointments.find((item) => item._id === queryAppointmentId);

  const request = async (endpoint: string, options: RequestInit = {}) => {
    if (!token) throw new Error("Doctor login required");
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Request failed");
    return payload;
  };

  const loadSummary = async (patientId: string) => {
    if (!patientId || !token) return;
    try {
      setSummaryLoading(true);
      setError("");
      const payload = await request(`/hospital/patients/${patientId}/summary`);
      setSummary(payload.data as Summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Doctor login required");
      return;
    }

    const load = async () => {
      try {
        const [patientPayload, departmentPayload] = await Promise.all([
          request("/hospital/patients"),
          fetch(`${API_BASE}/hospital/departments`).then((response) => response.json()),
        ]);
        const roster = (patientPayload.data || []) as Patient[];
        const departmentList = (departmentPayload.data || []) as Department[];
        const initialPatientId =
          queryPatientId && roster.some((patient) => patient._id === queryPatientId)
            ? queryPatientId
            : roster[0]?._id || "";

        setPatients(roster);
        setDepartments(departmentList);
        setSelectedId(initialPatientId);
        if (initialPatientId) await loadSummary(initialPatientId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load patient hub");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token, queryPatientId]);

  const openComposer = (nextMode: Exclude<Mode, null>, item?: RecordItem | AdmissionItem | LabOrderItem) => {
    setMode(nextMode);
    setEditingId(item?._id || "");
    if (!item) {
      setForm({
        ...emptyForm,
        appointmentId: nextMode === "record" || nextMode === "lab" ? queryAppointmentId : "",
        detail: nextMode === "record" && selectedAppointment?.notes ? selectedAppointment.notes : "",
      });
      return;
    }

    if (nextMode === "record") {
      const record = item as RecordItem;
      setForm({ ...emptyForm, diagnosis: record.diagnosis || "", detail: record.chiefComplaint || "", notes: record.notes || "", appointmentId: queryAppointmentId });
      return;
    }

    if (nextMode === "admission") {
      const admission = item as AdmissionItem;
      setForm({ ...emptyForm, diagnosis: admission.diagnosis || "", detail: admission.reason || "", roomNumber: admission.roomNumber || "" });
      return;
    }

    const order = item as LabOrderItem;
    setForm({ ...emptyForm, tests: (order.tests || []).map((test) => test.name).join(", "), notes: order.clinicalNotes || "" });
  };

  const closeComposer = () => {
    setMode(null);
    setEditingId("");
    setForm(emptyForm);
  };

  const saveAction = async () => {
    if (!mode || !selectedId) return;

    const endpoint = editingId
      ? mode === "record"
        ? `/hospital/medical-records/${editingId}`
        : mode === "admission"
          ? `/hospital/admissions/${editingId}`
          : `/hospital/lab-orders/${editingId}`
      : mode === "record"
        ? "/hospital/medical-records"
        : mode === "admission"
          ? "/hospital/admissions"
          : "/hospital/lab-orders";

    const body =
      mode === "record"
        ? { patientId: selectedId, departmentId: form.departmentId || undefined, appointmentId: form.appointmentId || undefined, diagnosis: form.diagnosis, chiefComplaint: form.detail, notes: form.notes }
        : mode === "admission"
          ? { patientId: selectedId, departmentId: form.departmentId || undefined, diagnosis: form.diagnosis, reason: form.detail, roomNumber: form.roomNumber }
          : { patientId: selectedId, departmentId: form.departmentId || undefined, appointmentId: form.appointmentId || undefined, clinicalNotes: form.notes, tests: form.tests.split(",").map((value) => value.trim()).filter(Boolean).map((name) => ({ name })) };

    try {
      setSaving(true);
      setError("");
      await request(endpoint, { method: editingId ? "PUT" : "POST", body: JSON.stringify(body) });
      closeComposer();
      await loadSummary(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const updateAdmissionStatus = async (admission: AdmissionItem, status: string) => {
    try {
      setBusyId(admission._id);
      await request(`/hospital/admissions/${admission._id}`, {
        method: "PUT",
        body: JSON.stringify({ status, actualDischargeDate: status === "discharged" ? new Date().toISOString() : undefined }),
      });
      await loadSummary(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update admission");
    } finally {
      setBusyId("");
    }
  };

  const updateLabStatus = async (order: LabOrderItem, status: string) => {
    try {
      setBusyId(order._id);
      await request(`/hospital/lab-orders/${order._id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          tests: (order.tests || []).map((test) => ({
            ...test,
            status: status === "completed" ? "completed" : test.status === "completed" ? "completed" : status,
          })),
        }),
      });
      await loadSummary(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update lab order");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-950 p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Doctor Patients Hub</p>
        <h1 className="mt-4 text-4xl font-semibold">Appointments now flow into records, admissions, and labs</h1>
      </section>

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h2 className="text-xl font-semibold text-white">Patient roster</h2>
          <div className="mt-4 space-y-3">
            {patients.map((patient) => (
              <button
                key={patient._id}
                onClick={() => {
                  setSelectedId(patient._id);
                  void loadSummary(patient._id);
                }}
                className={`w-full rounded-2xl border p-4 text-left ${selectedId === patient._id ? "border-cyan-400 bg-cyan-500/10" : "border-slate-800 bg-slate-950/60"}`}
              >
                <p className="text-lg font-semibold text-white">{patient.fullname}</p>
                <p className="mt-1 text-sm text-slate-400">{patient.email || "Email unavailable"}</p>
                <p className="mt-3 text-xs text-slate-500">{patient.appointmentsCount || 0} appointments | {patient.activeAdmissions || 0} admissions</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {summaryLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/80">
              <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
            </div>
          ) : summary ? (
            <>
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Selected Patient</p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">{summary.patient.fullname}</h2>
                    <p className="mt-1 text-sm text-slate-400">{summary.patient.email || "Email unavailable"} | {summary.patient.city || "City pending"}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {[
                      { label: "Appointments", value: summary.stats.appointments },
                      { label: "Records", value: summary.stats.records },
                      { label: "Admissions", value: summary.stats.admissions },
                      { label: "Labs", value: summary.stats.labOrders },
                      { label: "Balance", value: money(summary.stats.outstandingBalance) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                        <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedAppointment && (
                  <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                    Appointment context: {formatDate(selectedAppointment.date)} at {selectedAppointment.slot}. {selectedAppointment.notes || "Use this visit to create the next clinical note."}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => openComposer("record")} className="rounded-2xl bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-300"><NotebookPen className="mr-2 inline h-4 w-4" />New record</button>
                  <button onClick={() => openComposer("admission")} className="rounded-2xl bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300"><Stethoscope className="mr-2 inline h-4 w-4" />New admission</button>
                  <button onClick={() => openComposer("lab")} className="rounded-2xl bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-300"><FlaskConical className="mr-2 inline h-4 w-4" />New lab order</button>
                </div>
              </div>

              {mode && (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                  <h3 className="text-2xl font-semibold text-white">
                    {editingId ? "Update" : "Create"} {mode === "record" ? "medical record" : mode === "admission" ? "admission" : "lab order"}
                  </h3>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <select
                      value={form.departmentId}
                      onChange={(e) => setForm((current) => ({ ...current, departmentId: e.target.value }))}
                      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    {(mode === "record" || mode === "admission") && (
                      <input
                        value={form.diagnosis}
                        onChange={(e) => setForm((current) => ({ ...current, diagnosis: e.target.value }))}
                        placeholder="Diagnosis"
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                      />
                    )}
                    {mode === "lab" && (
                      <input
                        value={form.tests}
                        onChange={(e) => setForm((current) => ({ ...current, tests: e.target.value }))}
                        placeholder="Tests, comma separated"
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                      />
                    )}
                    <input
                      value={form.detail}
                      onChange={(e) => setForm((current) => ({ ...current, detail: e.target.value }))}
                      placeholder={mode === "record" ? "Chief complaint" : mode === "admission" ? "Admission reason" : "Optional detail"}
                      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                    />
                    {mode === "admission" && (
                      <input
                        value={form.roomNumber}
                        onChange={(e) => setForm((current) => ({ ...current, roomNumber: e.target.value }))}
                        placeholder="Room number"
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                      />
                    )}
                    {(mode === "record" || mode === "lab") && (
                      <input
                        value={form.appointmentId}
                        onChange={(e) => setForm((current) => ({ ...current, appointmentId: e.target.value }))}
                        placeholder="Appointment id (optional)"
                        className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
                      />
                    )}
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
                      placeholder={mode === "admission" ? "Additional note or priority" : "Clinical notes"}
                      rows={4}
                      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white md:col-span-2"
                    />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button onClick={closeComposer} className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200">
                      Cancel
                    </button>
                    <button
                      onClick={() => void saveAction()}
                      disabled={saving}
                      className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {saving ? "Saving..." : editingId ? "Update" : "Save"}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-cyan-300" />
                      <h3 className="text-xl font-semibold text-white">Appointments</h3>
                    </div>
                    <div className="mt-4 space-y-4">
                      {summary.appointments.map((appointment) => (
                        <div key={appointment._id} className={`rounded-2xl border p-4 ${appointment._id === queryAppointmentId ? "border-cyan-400 bg-cyan-500/10" : "border-slate-800 bg-slate-950/60"}`}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-white">{formatDate(appointment.date)} at {appointment.slot}</p>
                              <p className="mt-1 text-sm text-slate-400">{appointment.notes || "Routine consultation"}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(appointment.status)}`}>{appointment.status}</span>
                          </div>
                        </div>
                      ))}
                      {!summary.appointments.length && <p className="text-sm text-slate-400">No appointments found for this patient.</p>}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-5 w-5 text-violet-300" />
                      <h3 className="text-xl font-semibold text-white">Records</h3>
                    </div>
                    <div className="mt-4 space-y-4">
                      {summary.records.map((record) => (
                        <div key={record._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-white">{record.diagnosis || "Clinical note"}</p>
                              <p className="mt-1 text-sm text-slate-400">{record.department?.name || "General"} | {formatDate(record.createdAt)}</p>
                            </div>
                            <button onClick={() => openComposer("record", record)} className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200">
                              Edit
                            </button>
                          </div>
                          <p className="mt-3 text-sm text-slate-300">{record.chiefComplaint || record.notes || "No notes added"}</p>
                        </div>
                      ))}
                      {!summary.records.length && <p className="text-sm text-slate-400">No records yet.</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-5 w-5 text-emerald-300" />
                      <h3 className="text-xl font-semibold text-white">Admissions</h3>
                    </div>
                    <div className="mt-4 space-y-4">
                      {summary.admissions.map((admission) => (
                        <div key={admission._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-white">{admission.admissionNumber}</p>
                              <p className="mt-1 text-sm text-slate-400">{admission.department?.name || "Hospital ward"} | Room {admission.roomNumber || "--"}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(admission.status)}`}>{admission.status}</span>
                          </div>
                          <p className="mt-3 text-sm text-slate-300">{admission.reason || admission.diagnosis || "No details"}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={() => openComposer("admission", admission)} className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200">Edit</button>
                            {admission.status !== "ready-for-discharge" && admission.status !== "discharged" && (
                              <button onClick={() => void updateAdmissionStatus(admission, "ready-for-discharge")} disabled={busyId === admission._id} className="rounded-2xl bg-amber-500/15 px-3 py-2 text-xs font-medium text-amber-300 disabled:opacity-50">Ready</button>
                            )}
                            {admission.status !== "discharged" && (
                              <button onClick={() => void updateAdmissionStatus(admission, "discharged")} disabled={busyId === admission._id} className="rounded-2xl bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-300 disabled:opacity-50">Discharge</button>
                            )}
                          </div>
                        </div>
                      ))}
                      {!summary.admissions.length && <p className="text-sm text-slate-400">No admissions yet.</p>}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <div className="flex items-center gap-3">
                      <FlaskConical className="h-5 w-5 text-amber-300" />
                      <h3 className="text-xl font-semibold text-white">Lab orders</h3>
                    </div>
                    <div className="mt-4 space-y-4">
                      {summary.labOrders.map((order) => (
                        <div key={order._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-white">{order.orderNumber}</p>
                              <p className="mt-1 text-sm text-slate-400">{(order.tests || []).map((test) => test.name).join(", ") || "Diagnostics order"}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(order.status)}`}>{order.status}</span>
                          </div>
                          <p className="mt-3 text-sm text-slate-300">{order.clinicalNotes || "No clinical notes provided"}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={() => openComposer("lab", order)} className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200">Edit</button>
                            {order.status !== "processing" && order.status !== "completed" && (
                              <button onClick={() => void updateLabStatus(order, "processing")} disabled={busyId === order._id} className="rounded-2xl bg-sky-500/15 px-3 py-2 text-xs font-medium text-sky-300 disabled:opacity-50">Processing</button>
                            )}
                            {order.status !== "completed" && (
                              <button onClick={() => void updateLabStatus(order, "completed")} disabled={busyId === order._id} className="rounded-2xl bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-300 disabled:opacity-50">Complete</button>
                            )}
                          </div>
                        </div>
                      ))}
                      {!summary.labOrders.length && <p className="text-sm text-slate-400">No lab orders yet.</p>}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                    <div className="flex items-center gap-3">
                      <ReceiptIndianRupee className="h-5 w-5 text-rose-300" />
                      <h3 className="text-xl font-semibold text-white">Bills</h3>
                    </div>
                    <div className="mt-4 space-y-4">
                      {summary.bills.map((bill) => (
                        <div key={bill._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-white">{bill.billNumber}</p>
                              <p className="mt-1 text-sm text-slate-400">{bill.department?.name || "Hospital services"} | Due {formatDate(bill.dueDate)}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(bill.status)}`}>{bill.status}</span>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-900 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Total</p>
                              <p className="mt-1 text-sm font-semibold text-white">{money(bill.totalAmount || 0)}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-900 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Balance</p>
                              <p className="mt-1 text-sm font-semibold text-white">{money(bill.balanceDue || 0)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!summary.bills.length && <p className="text-sm text-slate-400">No bills yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
              Select a patient to load the hospital timeline.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
