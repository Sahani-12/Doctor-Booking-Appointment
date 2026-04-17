import { useEffect, useState } from "react";
import {
  FlaskConical,
  Loader2,
  PlusCircle,
  X,
  Check,
  Pencil,
  ChevronRight,
} from "lucide-react";
import { API_BASE } from "../constants/api";
import { useAuth } from "../hooks/useAuth";

type Patient = { _id: string; fullname: string };
type Doctor = { _id: string; fullname: string };
type Department = { _id: string; name: string };
type LabTest = {
  name: string;
  category?: string;
  status?: string;
  referenceRange?: string;
};
type LabOrder = {
  _id: string;
  orderNumber: string;
  status: string;
  priority: string;
  clinicalNotes?: string;
  orderedAt?: string;
  patient?: { _id?: string; fullname?: string };
  doctor?: { _id?: string; fullname?: string };
  department?: { _id?: string; name?: string };
  tests?: LabTest[];
};

const emptyForm = {
  patientId: "",
  doctorId: "",
  departmentId: "",
  tests: "",
  clinicalNotes: "",
  priority: "routine",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const tone = (status = "") => {
  const v = status.toLowerCase();
  if (v === "completed")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (v === "processing")
    return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
  if (v === "sample-collected")
    return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
  if (v === "ordered")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

const priorityTone = (p = "") => {
  if (p === "urgent")
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
  if (p === "critical")
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

const WORKFLOW_STEPS = [
  "ordered",
  "sample-collected",
  "processing",
  "completed",
];

export default function AdminLabOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<LabOrder[]>([]);
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

  const loadAll = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [labPayload, patientPayload, doctorPayload, deptPayload] =
        await Promise.all([
          request("/hospital/lab-orders"),
          request("/hospital/patients"),
          request("/admin/doctors"),
          fetch(`${API_BASE}/hospital/departments`).then((r) => r.json()),
        ]);
      setOrders((labPayload.data || []) as LabOrder[]);
      if (!isBackground) {
        setPatients((patientPayload.data || []) as Patient[]);
        setDoctors((doctorPayload.data || []) as Doctor[]);
        setDepartments((deptPayload.data || []) as Department[]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load lab orders",
      );
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
    // Real-time polling every 5 seconds
    const intervalId = setInterval(() => loadAll(true), 5000);
    return () => clearInterval(intervalId);
  }, []);

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

  const startEdit = (order: LabOrder) => {
    setEditingId(order._id);
    setForm({
      patientId: (order.patient as any)?._id || "",
      doctorId: (order.doctor as any)?._id || "",
      departmentId: (order.department as any)?._id || "",
      tests: (order.tests || []).map((t) => t.name).join(", "),
      clinicalNotes: order.clinicalNotes || "",
      priority: order.priority || "routine",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveOrder = async () => {
    if (!form.patientId || !form.tests.trim()) {
      setError("Patient and at least one test are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const body = {
        ...form,
        tests: form.tests
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      };
      if (editingId) {
        await request(`/hospital/lab-orders/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        showSuccessMsg("Lab order updated!");
      } else {
        await request("/hospital/lab-orders", {
          method: "POST",
          body: JSON.stringify(body),
        });
        showSuccessMsg("Lab order created!");
      }
      resetForm();
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lab order");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (order: LabOrder, status: string) => {
    try {
      setBusyId(order._id);
      await request(`/hospital/lab-orders/${order._id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          tests: (order.tests || []).map((t) => ({
            ...t,
            status:
              status === "completed"
                ? "completed"
                : t.status === "completed"
                  ? "completed"
                  : status,
          })),
        }),
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusyId("");
    }
  };

  const getNextStatus = (current: string) => {
    const idx = WORKFLOW_STEPS.indexOf(current);
    return idx >= 0 && idx < WORKFLOW_STEPS.length - 1
      ? WORKFLOW_STEPS[idx + 1]
      : null;
  };

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);
  const statuses = [
    "all",
    "ordered",
    "sample-collected",
    "processing",
    "completed",
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-500" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Loading lab orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 p-8 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-white/5" />
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></span>
            Real-time sync
          </span>
        </div>
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-100/80">
            Hospital Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Lab Orders</h1>
          <p className="mt-2 max-w-xl text-sm text-amber-100/75">
            Manage diagnostic workflows — create orders, advance through
            pipeline, and mark results complete.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {orders.filter((o) => o.status !== "completed").length} Pending
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {orders.filter((o) => o.status === "completed").length} Completed
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow transition hover:bg-amber-50"
            >
              <PlusCircle className="h-4 w-4" />
              New lab order
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
              {editingId ? "Edit lab order" : "New lab order"}
            </h2>
            <button
              onClick={resetForm}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Patient *",
                key: "patientId",
                options: patients,
                labelKey: "fullname",
              },
              {
                label: "Doctor",
                key: "doctorId",
                options: doctors,
                labelKey: "fullname",
              },
              {
                label: "Department",
                key: "departmentId",
                options: departments,
                labelKey: "name",
              },
            ].map(({ label, key, options, labelKey }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {label}
                </label>
                <select
                  value={(form as any)[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">
                    Select {label.replace(" *", "").toLowerCase()}
                  </option>
                  {options.map((o: any) => (
                    <option key={o._id} value={o._id}>
                      {o[labelKey]}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tests * (comma separated)
              </label>
              <input
                value={form.tests}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tests: e.target.value }))
                }
                placeholder="e.g. CBC, Lipid Profile, Troponin I"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Clinical Notes
              </label>
              <textarea
                value={form.clinicalNotes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clinicalNotes: e.target.value }))
                }
                placeholder="Clinical context or special instructions..."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => void saveOrder()}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saving
                ? "Saving..."
                : editingId
                  ? "Update order"
                  : "Create order"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
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
            className={`rounded-2xl px-4 py-2 text-xs font-semibold capitalize transition ${filterStatus === s ? "bg-amber-500 text-white shadow" : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            {s === "all" ? `All (${orders.length})` : s.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Lab Orders List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <FlaskConical className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            No lab orders found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((order) => {
            const nextStatus = getNextStatus(order.status);
            return (
              <div
                key={order._id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {order.patient?.fullname || "Patient"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {order.doctor?.fullname || "—"} ·{" "}
                      {order.department?.name || "Diagnostics"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(order.status)}`}
                    >
                      {order.status.replace("-", " ")}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone(order.priority)}`}
                    >
                      {order.priority}
                    </span>
                  </div>
                </div>

                {/* Tests */}
                {(order.tests || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(order.tests || []).map((test, i) => (
                      <span
                        key={i}
                        className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {test.name}
                      </span>
                    ))}
                  </div>
                )}

                {order.clinicalNotes && (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {order.clinicalNotes}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Ordered: {formatDate(order.orderedAt)}
                </p>

                {/* Workflow progress bar */}
                <div className="mt-4 flex items-center gap-1">
                  {WORKFLOW_STEPS.map((step, i) => {
                    const currentIdx = WORKFLOW_STEPS.indexOf(order.status);
                    const isCompleted = i <= currentIdx;
                    return (
                      <div
                        key={step}
                        className="flex flex-1 items-center gap-1"
                      >
                        <div
                          className={`h-1.5 flex-1 rounded-full transition-all ${isCompleted ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"}`}
                        />
                        {i < WORKFLOW_STEPS.length - 1 && null}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    onClick={() => startEdit(order)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {nextStatus && (
                    <button
                      onClick={() => void updateStatus(order, nextStatus)}
                      disabled={busyId === order._id}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-900/20 dark:text-amber-300"
                    >
                      {busyId === order._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      Move to {nextStatus.replace("-", " ")}
                    </button>
                  )}
                  {order.status !== "completed" && (
                    <button
                      onClick={() => void updateStatus(order, "completed")}
                      disabled={busyId === order._id}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/20 dark:text-emerald-300"
                    >
                      <Check className="h-3.5 w-3.5" /> Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
