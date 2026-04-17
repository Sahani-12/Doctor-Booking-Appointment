import { useEffect, useState } from "react";
import {
  CreditCard,
  Loader2,
  PlusCircle,
  X,
  Check,
  IndianRupee,
  CalendarDays,
} from "lucide-react";
import { API_BASE } from "../constants/api";
import { useAuth } from "../hooks/useAuth";

type Patient = { _id: string; fullname: string };
type Doctor = { _id: string; fullname: string };
type Department = { _id: string; name: string };
type Bill = {
  _id: string;
  billNumber: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  dueDate?: string;
  issuedAt?: string;
  paymentMethod?: string;
  notes?: string;
  patient?: { _id?: string; fullname?: string };
  doctor?: { _id?: string; fullname?: string };
  department?: { _id?: string; name?: string };
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    category?: string;
  }>;
};

const emptyForm = {
  patientId: "",
  doctorId: "",
  departmentId: "",
  description: "",
  amount: "",
  dueDate: "",
  notes: "",
};

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

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
  if (v === "paid")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (v === "partially-paid")
    return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
  if (v === "pending")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  if (v === "cancelled")
    return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
};

export default function AdminBilling() {
  const { token } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
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
      const [billPayload, patientPayload, doctorPayload, deptPayload] =
        await Promise.all([
          request("/hospital/bills"),
          request("/hospital/patients"),
          request("/admin/doctors"),
          fetch(`${API_BASE}/hospital/departments`).then((r) => r.json()),
        ]);
      setBills((billPayload.data || []) as Bill[]);
      if (!isBackground) {
        setPatients((patientPayload.data || []) as Patient[]);
        setDoctors((doctorPayload.data || []) as Doctor[]);
        setDepartments((deptPayload.data || []) as Department[]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load billing data",
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
    setShowForm(false);
    setError("");
  };

  const saveBill = async () => {
    if (!form.patientId || !form.amount || !form.description) {
      setError("Patient, description, and amount are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await request("/hospital/bills", {
        method: "POST",
        body: JSON.stringify({
          patientId: form.patientId,
          doctorId: form.doctorId || undefined,
          departmentId: form.departmentId || undefined,
          dueDate: form.dueDate || undefined,
          notes: form.notes || undefined,
          lineItems: [
            {
              description: form.description,
              quantity: 1,
              unitPrice: Number(form.amount) || 0,
              amount: Number(form.amount) || 0,
            },
          ],
        }),
      });
      showSuccessMsg("Bill issued successfully!");
      resetForm();
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue bill");
    } finally {
      setSaving(false);
    }
  };

  const settleBill = async (bill: Bill) => {
    try {
      setBusyId(bill._id);
      await request(`/hospital/bills/${bill._id}`, {
        method: "PUT",
        body: JSON.stringify({
          paidAmount: bill.totalAmount,
          status: "paid",
          paymentMethod: "Front Desk",
          paidAt: new Date().toISOString(),
        }),
      });
      showSuccessMsg("Bill marked as paid!");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to settle bill");
    } finally {
      setBusyId("");
    }
  };

  const cancelBill = async (billId: string) => {
    try {
      setBusyId(billId);
      await request(`/hospital/bills/${billId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "cancelled" }),
      });
      showSuccessMsg("Bill cancelled.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel bill");
    } finally {
      setBusyId("");
    }
  };

  const totalRevenue = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPending = bills
    .filter((b) => b.status !== "paid" && b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const totalBilled = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const filtered =
    filterStatus === "all"
      ? bills
      : bills.filter((b) => b.status === filterStatus);
  const statuses = ["all", "pending", "partially-paid", "paid", "cancelled"];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-rose-500" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Loading billing data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 p-8 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/4 h-28 w-28 rounded-full bg-white/5" />
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse"></span>
            Real-time sync
          </span>
        </div>
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-200/80">
            Hospital Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Billing</h1>
          <p className="mt-2 max-w-xl text-sm text-rose-100/75">
            Issue bills, track collections, and settle outstanding balances
            across all patients.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              Total billed: {money(totalBilled)}
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              Collected: {money(totalRevenue)}
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              Pending: {money(totalPending)}
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow transition hover:bg-rose-50"
            >
              <PlusCircle className="h-4 w-4" />
              Issue bill
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Billed",
            value: money(totalBilled),
            color: "text-slate-900 dark:text-white",
            bg: "bg-white dark:bg-slate-900",
          },
          {
            label: "Collected",
            value: money(totalRevenue),
            color: "text-emerald-700 dark:text-emerald-300",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
          },
          {
            label: "Outstanding",
            value: money(totalPending),
            color: "text-rose-700 dark:text-rose-300",
            bg: "bg-rose-50 dark:bg-rose-950/30",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-3xl border border-slate-200 p-5 shadow-sm dark:border-slate-800 ${item.bg}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className={`mt-2 text-3xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
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

      {/* Issue Bill Form */}
      {showForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Issue new bill
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Description *
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="e.g. Admission charges, Lab fees..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="0"
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Due Date
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Additional billing notes..."
                rows={2}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => void saveBill()}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-rose-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {saving ? "Issuing..." : "Issue bill"}
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
            className={`rounded-2xl px-4 py-2 text-xs font-semibold capitalize transition ${filterStatus === s ? "bg-rose-600 text-white shadow" : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            {s === "all" ? `All (${bills.length})` : s.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Bills List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <CreditCard className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            No bills found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((bill) => (
            <div
              key={bill._id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                    {bill.billNumber}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                    {bill.patient?.fullname || "Patient"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {bill.department?.name || "Hospital services"}
                    {bill.doctor?.fullname ? ` · ${bill.doctor.fullname}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(bill.status)}`}
                >
                  {bill.status.replace("-", " ")}
                </span>
              </div>

              {/* Line items */}
              {(bill.lineItems || []).length > 0 && (
                <div className="mt-4 space-y-1">
                  {(bill.lineItems || []).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-600 dark:text-slate-300">
                        {item.description}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {money(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Amounts */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Total
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {money(bill.totalAmount)}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                  <p className="text-xs uppercase tracking-wide text-emerald-500">
                    Paid
                  </p>
                  <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
                    {money(bill.paidAmount)}
                  </p>
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 ${bill.balanceDue > 0 ? "bg-rose-50 dark:bg-rose-950/20" : "bg-slate-50 dark:bg-slate-800"}`}
                >
                  <p
                    className={`text-xs uppercase tracking-wide ${bill.balanceDue > 0 ? "text-rose-500" : "text-slate-400"}`}
                  >
                    Balance
                  </p>
                  <p
                    className={`mt-1 font-semibold ${bill.balanceDue > 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-white"}`}
                  >
                    {money(bill.balanceDue)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Issued:{" "}
                  {formatDate(bill.issuedAt)}
                </span>
                {bill.dueDate && <span>Due: {formatDate(bill.dueDate)}</span>}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                {bill.balanceDue > 0 && bill.status !== "cancelled" && (
                  <button
                    onClick={() => void settleBill(bill)}
                    disabled={busyId === bill._id}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-900/20 dark:text-emerald-300"
                  >
                    {busyId === bill._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Mark paid
                  </button>
                )}
                {bill.status !== "paid" && bill.status !== "cancelled" && (
                  <button
                    onClick={() => void cancelBill(bill._id)}
                    disabled={busyId === bill._id}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-900/20 dark:text-rose-300"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
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
