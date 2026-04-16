import { useEffect, useState } from "react";
import {
  BedDouble,
  Loader2,
  PlusCircle,
  X,
  Check,
  Pencil,
  ChevronRight,
} from "lucide-react";
import { API_BASE } from "../constants/api";
import { useAuth } from "../hooks/useAuth";

type Patient = { _id: string; fullname: string; email?: string };
type Doctor = { _id: string; fullname: string; specialization?: string[] };
type Department = { _id: string; name: string };
type Admission = {
  _id: string;
  admissionNumber: string;
  status: string;
  priority: string;
  roomNumber?: string;
  wardType?: string;
  diagnosis?: string;
  reason?: string;
  admissionDate?: string;
  expectedDischargeDate?: string;
  patient?: { fullname?: string; email?: string };
  doctor?: { fullname?: string };
  department?: { name?: string };
};

const emptyForm = {
  patientId: "",
  doctorId: "",
  departmentId: "",
  diagnosis: "",
  reason: "",
  roomNumber: "",
  wardType: "general",
  priority: "routine",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const tone = (status = "") => {
  const v = status.toLowerCase();
  if (["discharged"].includes(v)) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (["ready-for-discharge"].includes(v)) return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
  if (["under-treatment"].includes(v)) return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
  if (["admitted"].includes(v)) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

const priorityTone = (priority = "") => {
  if (priority === "critical") return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
  if (priority === "urgent") return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

export default function AdminAdmissions() {
  const { token } = useAuth();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const request = async (endpoint: string, options: RequestInit = {}) => {
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

  const loadAll = async () => {
    try {
      setLoading(true);
      const [admissionPayload, patientPayload, doctorPayload, deptPayload] = await Promise.all([
        request("/hospital/admissions"),
        request("/hospital/patients"),
        request("/admin/doctors"),
        fetch(`${API_BASE}/hospital/departments`).then((r) => r.json()),
      ]);
      setAdmissions((admissionPayload.data || []) as Admission[]);
      setPatients((patientPayload.data || []) as Patient[]);
      setDoctors((doctorPayload.data || []) as Doctor[]);
      setDepartments((deptPayload.data || []) as Department[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAll(); }, []);

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
    setShowForm(false);
    setError("");
  };

  const startEdit = (admission: Admission) => {
    setEditingId(admission._id);
    setForm({
      patientId: (admission.patient as any)?._id || "",
      doctorId: (admission.doctor as any)?._id || "",
      departmentId: (admission.department as any)?._id || "",
      diagnosis: admission.diagnosis || "",
      reason: admission.reason || "",
      roomNumber: admission.roomNumber || "",
      wardType: admission.wardType || "general",
      priority: admission.priority || "routine",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAdmission = async () => {
    if (!form.patientId || !form.doctorId) {
      setError("Patient and doctor are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      if (editingId) {
        await request(`/hospital/admissions/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
        showSuccessMsg("Admission updated!");
      } else {
        await request("/hospital/admissions", { method: "POST", body: JSON.stringify(form) });
        showSuccessMsg("Admission created!");
      }
      resetForm();
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save admission");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (admission: Admission, status: string) => {
    try {
      setBusyId(admission._id);
      await request(`/hospital/admissions/${admission._id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          actualDischargeDate: status === "discharged" ? new Date().toISOString() : undefined,
        }),
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusyId("");
    }
  };

  const filtered = filterStatus === "all"
    ? admissions
    : admissions.filter((a) => a.status === filterStatus);

  const statuses = ["all", "admitted", "under-treatment", "ready-for-discharge", "discharged"];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-violet-500" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading admissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-8 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/4 h-28 w-28 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-200/80">Hospital Admin</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Admissions</h1>
          <p className="mt-2 max-w-xl text-sm text-violet-100/75">
            Manage inpatient admissions — admit patients, assign rooms, and track discharge progress.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {admissions.filter((a) => a.status !== "discharged").length} Active
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {admissions.filter((a) => a.status === "discharged").length} Discharged
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow transition hover:bg-violet-50"
            >
              <PlusCircle className="h-4 w-4" />
              New admission
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300">
          <X className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Check className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingId ? "Edit admission" : "New admission"}
            </h2>
            <button onClick={resetForm} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Patient *", key: "patientId", options: patients, labelKey: "fullname" },
              { label: "Doctor *", key: "doctorId", options: doctors, labelKey: "fullname" },
              { label: "Department", key: "departmentId", options: departments, labelKey: "name" },
            ].map(({ label, key, options, labelKey }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label>
                <select
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select {label.replace(" *", "").toLowerCase()}</option>
                  {options.map((o: any) => <option key={o._id} value={o._id}>{o[labelKey]}</option>)}
                </select>
              </div>
            ))}

            {[
              { label: "Diagnosis", key: "diagnosis", placeholder: "e.g. Viral fever" },
              { label: "Admission Reason", key: "reason", placeholder: "e.g. Observation needed" },
              { label: "Room Number", key: "roomNumber", placeholder: "e.g. A-204" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ward Type</label>
              <select
                value={form.wardType}
                onChange={(e) => setForm((f) => ({ ...f, wardType: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="general">General</option>
                <option value="semi-private">Semi-private</option>
                <option value="private">Private</option>
                <option value="icu">ICU</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => void saveAdmission()}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving..." : editingId ? "Update" : "Create admission"}
            </button>
            <button onClick={resetForm} className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-2xl px-4 py-2 text-xs font-semibold capitalize transition ${filterStatus === s ? "bg-violet-600 text-white shadow" : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            {s === "all" ? `All (${admissions.length})` : s.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Admissions List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <BedDouble className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-slate-500 dark:text-slate-400">No admissions found.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((admission) => (
            <div key={admission._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">{admission.admissionNumber}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{admission.patient?.fullname || "Patient"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {admission.department?.name || "Ward"} {admission.roomNumber ? `· Room ${admission.roomNumber}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(admission.status)}`}>
                    {admission.status.replace("-", " ")}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone(admission.priority)}`}>
                    {admission.priority}
                  </span>
                </div>
              </div>

              {(admission.diagnosis || admission.reason) && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  {admission.diagnosis || admission.reason}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span>Admitted: {formatDate(admission.admissionDate)}</span>
                {admission.expectedDischargeDate && (
                  <span>Expected discharge: {formatDate(admission.expectedDischargeDate)}</span>
                )}
                <span>Doctor: {admission.doctor?.fullname || "—"}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  onClick={() => startEdit(admission)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {admission.status !== "ready-for-discharge" && admission.status !== "discharged" && (
                  <button
                    onClick={() => void updateStatus(admission, "ready-for-discharge")}
                    disabled={busyId === admission._id}
                    className="flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition hover:bg-sky-100 disabled:opacity-50 dark:bg-sky-900/20 dark:text-sky-300"
                  >
                    <ChevronRight className="h-3.5 w-3.5" /> Ready
                  </button>
                )}
                {admission.status !== "discharged" && (
                  <button
                    onClick={() => void updateStatus(admission, "discharged")}
                    disabled={busyId === admission._id}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/20 dark:text-emerald-300"
                  >
                    {busyId === admission._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Discharge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
