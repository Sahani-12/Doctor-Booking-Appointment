import { useEffect, useState } from "react";
import {
  Building2,
  Loader2,
  PlusCircle,
  Pencil,
  X,
  Check,
  MapPin,
  Layers,
  BedDouble,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { API_BASE } from "../constants/api";
import { useAuth } from "../hooks/useAuth";

type Department = {
  _id: string;
  name: string;
  code: string;
  floor?: string;
  location?: string;
  bedCapacity?: number;
  description?: string;
  isActive?: boolean;
  color?: string;
};

const emptyForm = {
  name: "",
  code: "",
  floor: "",
  location: "",
  bedCapacity: "",
  description: "",
  color: "#0f766e",
};

const PRESET_COLORS = [
  "#0f766e", "#2563eb", "#dc2626", "#7c3aed",
  "#b45309", "#0e7490", "#15803d", "#9333ea",
];

export default function AdminDepartments() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);

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

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const payload = await fetch(`${API_BASE}/hospital/departments`).then((r) => r.json());
      setDepartments((payload.data || []) as Department[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDepartments(); }, []);

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const startEdit = (dept: Department) => {
    setEditingId(dept._id);
    setForm({
      name: dept.name,
      code: dept.code,
      floor: dept.floor || "",
      location: dept.location || "",
      bedCapacity: String(dept.bedCapacity || ""),
      description: dept.description || "",
      color: dept.color || "#0f766e",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
    setShowForm(false);
    setError("");
  };

  const saveDepartment = async () => {
    if (!form.name || !form.code) {
      setError("Department name and code are required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const body = { ...form, bedCapacity: Number(form.bedCapacity) || 0 };
      if (editingId) {
        await request(`/hospital/departments/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
        showSuccessMsg("Department updated successfully!");
      } else {
        await request("/hospital/departments", { method: "POST", body: JSON.stringify(body) });
        showSuccessMsg("Department created successfully!");
      }
      resetForm();
      await loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (dept: Department) => {
    try {
      setBusyId(dept._id);
      await request(`/hospital/departments/${dept._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !dept.isActive }),
      });
      await loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-teal-500" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-700 to-cyan-800 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 left-1/3 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-200/80">
            Hospital Admin
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Departments</h1>
          <p className="mt-2 max-w-xl text-sm text-teal-100/75">
            Manage hospital departments — add new wards, update locations, and control availability.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {departments.length} Total departments
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {departments.filter((d) => d.isActive !== false).length} Active
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow transition hover:bg-teal-50"
            >
              <PlusCircle className="h-4 w-4" />
              Add department
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300">
          <X className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingId ? "Edit department" : "New department"}
            </h2>
            <button onClick={resetForm} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Department Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Cardiology"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. CARD"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Floor</label>
              <input
                value={form.floor}
                onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                placeholder="e.g. 3rd Floor"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. North Wing"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bed Capacity</label>
              <input
                value={form.bedCapacity}
                onChange={(e) => setForm((f) => ({ ...f, bedCapacity: e.target.value }))}
                placeholder="e.g. 24"
                type="number"
                min="0"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Department Color</label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: form.color === c ? "#fff" : "transparent",
                      boxShadow: form.color === c ? `0 0 0 2px ${c}` : "none",
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this department..."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => void saveDepartment()}
              disabled={saving}
              className="flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving..." : editingId ? "Update department" : "Create department"}
            </button>
            <button onClick={resetForm} className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <Building2 className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-slate-500 dark:text-slate-400">No departments yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Color bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: dept.color || "#0f766e" }} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                      style={{ backgroundColor: dept.color || "#0f766e" }}
                    >
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{dept.name}</h3>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {dept.code}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${dept.isActive !== false ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                    {dept.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                {dept.description && (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{dept.description}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {dept.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {dept.location}
                    </span>
                  )}
                  {dept.floor && (
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {dept.floor}
                    </span>
                  )}
                  {dept.bedCapacity !== undefined && dept.bedCapacity > 0 && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" /> {dept.bedCapacity} beds
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    onClick={() => startEdit(dept)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => void toggleActive(dept)}
                    disabled={busyId === dept._id}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {busyId === dept._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : dept.isActive !== false ? (
                      <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-3.5 w-3.5" />
                    )}
                    {dept.isActive !== false ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
