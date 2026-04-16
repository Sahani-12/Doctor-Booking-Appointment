import { useEffect, useState } from "react";
import {
  Building2,
  CreditCard,
  FlaskConical,
  Loader,
  PlusCircle,
  Users,
} from "lucide-react";
import { API_BASE } from "../constants/api";
import { useAuth } from "../hooks/useAuth";

type Department = { _id: string; name: string; code: string; floor?: string; location?: string; bedCapacity?: number; occupiedBeds?: number; availableBeds?: number };
type Patient = { _id: string; fullname: string; email?: string; appointmentsCount?: number; activeAdmissions?: number; outstandingBalance?: number };
type Doctor = { _id: string; fullname: string; specialization?: string[] };
type Admission = { _id: string; admissionNumber: string; status: string; roomNumber?: string; patient?: { fullname?: string }; doctor?: { fullname?: string }; department?: { name?: string } };
type LabOrder = { _id: string; orderNumber: string; status: string; patient?: { fullname?: string }; doctor?: { fullname?: string }; tests?: Array<{ name: string; status?: string }> };
type Bill = { _id: string; billNumber: string; status: string; totalAmount: number; balanceDue: number; paidAmount?: number; patient?: { fullname?: string }; department?: { name?: string } };

const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const tone = (status = "") => {
  const value = status.toLowerCase();
  if (["confirmed", "completed", "paid", "discharged"].includes(value)) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (["pending", "ordered", "admitted", "ready-for-discharge"].includes(value)) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  if (["processing", "sample-collected", "under-treatment", "partially-paid"].includes(value)) return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
};

export default function HospitalOperationsPage() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [patientSummary, setPatientSummary] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");

  const [departmentForm, setDepartmentForm] = useState({ name: "", code: "", floor: "", location: "", bedCapacity: "", description: "" });
  const [admissionForm, setAdmissionForm] = useState({ patientId: "", doctorId: "", departmentId: "", diagnosis: "", reason: "", roomNumber: "" });
  const [labForm, setLabForm] = useState({ patientId: "", doctorId: "", departmentId: "", tests: "", clinicalNotes: "" });
  const [billForm, setBillForm] = useState({ patientId: "", doctorId: "", departmentId: "", description: "", amount: "", dueDate: "" });

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

  const loadPatientSummary = async (patientId: string) => {
    if (!patientId) return;
    try {
      const payload = await request(`/hospital/patients/${patientId}/summary`);
      setPatientSummary(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patient summary");
    }
  };

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const [departmentPayload, patientPayload, doctorPayload, admissionPayload, labPayload, billPayload] = await Promise.all([
        fetch(`${API_BASE}/hospital/departments`).then((response) => response.json()),
        request("/hospital/patients"),
        request("/admin/doctors"),
        request("/hospital/admissions"),
        request("/hospital/lab-orders"),
        request("/hospital/bills"),
      ]);

      const patientList = (patientPayload.data || []) as Patient[];
      setDepartments((departmentPayload.data || []) as Department[]);
      setPatients(patientList);
      setDoctors((doctorPayload.data || []) as Doctor[]);
      setAdmissions((admissionPayload.data || []) as Admission[]);
      setLabOrders((labPayload.data || []) as LabOrder[]);
      setBills((billPayload.data || []) as Bill[]);

      const defaultPatientId = selectedPatientId || patientList[0]?._id || "";
      setSelectedPatientId(defaultPatientId);
      if (defaultPatientId) await loadPatientSummary(defaultPatientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load operations data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const saveDepartment = async () => {
    try {
      setSavingKey("department");
      await request("/hospital/departments", { method: "POST", body: JSON.stringify({ ...departmentForm, bedCapacity: Number(departmentForm.bedCapacity) || 0 }) });
      setDepartmentForm({ name: "", code: "", floor: "", location: "", bedCapacity: "", description: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create department");
    } finally {
      setSavingKey("");
    }
  };

  const saveAdmission = async () => {
    try {
      setSavingKey("admission");
      await request("/hospital/admissions", { method: "POST", body: JSON.stringify(admissionForm) });
      setAdmissionForm({ patientId: "", doctorId: "", departmentId: "", diagnosis: "", reason: "", roomNumber: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create admission");
    } finally {
      setSavingKey("");
    }
  };

  const saveLabOrder = async () => {
    try {
      setSavingKey("lab");
      await request("/hospital/lab-orders", {
        method: "POST",
        body: JSON.stringify({
          ...labForm,
          tests: labForm.tests.split(",").map((value) => value.trim()).filter(Boolean).map((name) => ({ name })),
        }),
      });
      setLabForm({ patientId: "", doctorId: "", departmentId: "", tests: "", clinicalNotes: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lab order");
    } finally {
      setSavingKey("");
    }
  };

  const saveBill = async () => {
    try {
      setSavingKey("bill");
      await request("/hospital/bills", {
        method: "POST",
        body: JSON.stringify({
          patientId: billForm.patientId,
          doctorId: billForm.doctorId || undefined,
          departmentId: billForm.departmentId || undefined,
          dueDate: billForm.dueDate || undefined,
          lineItems: [{ description: billForm.description, quantity: 1, unitPrice: Number(billForm.amount) || 0 }],
        }),
      });
      setBillForm({ patientId: "", doctorId: "", departmentId: "", description: "", amount: "", dueDate: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue bill");
    } finally {
      setSavingKey("");
    }
  };

  const updateAdmissionStatus = async (admissionId: string, status: string) => {
    try {
      setBusyId(admissionId);
      await request(`/hospital/admissions/${admissionId}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          actualDischargeDate: status === "discharged" ? new Date().toISOString() : undefined,
        }),
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update admission");
    } finally {
      setBusyId("");
    }
  };

  const updateLabStatus = async (order: LabOrder, status: string) => {
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
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lab order");
    } finally {
      setBusyId("");
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
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to settle bill");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-950 p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/70">Hospital Ops Console</p>
          <h1 className="mt-4 text-4xl font-bold">Admissions, diagnostics, departments, and billing</h1>
        </section>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">{error}</div>}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Departments", value: departments.length, icon: <Building2 className="h-5 w-5" /> },
            { label: "Tracked Patients", value: patients.length, icon: <Users className="h-5 w-5" /> },
            { label: "Active Admissions", value: admissions.filter((item) => item.status !== "discharged").length, icon: <Building2 className="h-5 w-5" /> },
            { label: "Open Labs", value: labOrders.filter((item) => item.status !== "completed").length, icon: <FlaskConical className="h-5 w-5" /> },
            { label: "Collections Due", value: money(bills.reduce((sum, bill) => sum + (bill.balanceDue || 0), 0)), icon: <CreditCard className="h-5 w-5" /> },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="w-fit rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">{item.icon}</div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4 flex items-center gap-3"><Building2 className="h-5 w-5 text-blue-500" /><h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create department</h2></div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["name", "Department name"],
                ["code", "Code"],
                ["floor", "Floor"],
                ["location", "Location"],
                ["bedCapacity", "Bed capacity"],
              ].map(([key, label]) => (
                <input key={key} value={departmentForm[key as keyof typeof departmentForm]} onChange={(e) => setDepartmentForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              ))}
              <textarea value={departmentForm.description} onChange={(e) => setDepartmentForm((current) => ({ ...current, description: e.target.value }))} placeholder="Department description" rows={4} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
            <button onClick={() => void saveDepartment()} disabled={savingKey === "department"} className="mt-4 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><PlusCircle className="mr-2 inline h-4 w-4" />{savingKey === "department" ? "Saving..." : "Add department"}</button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4 flex items-center gap-3"><Building2 className="h-5 w-5 text-emerald-500" /><h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Admit patient</h2></div>
            <div className="grid gap-4 md:grid-cols-2">
              <select value={admissionForm.patientId} onChange={(e) => setAdmissionForm((current) => ({ ...current, patientId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Select patient</option>{patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.fullname}</option>)}</select>
              <select value={admissionForm.doctorId} onChange={(e) => setAdmissionForm((current) => ({ ...current, doctorId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Assign doctor</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.fullname}</option>)}</select>
              <select value={admissionForm.departmentId} onChange={(e) => setAdmissionForm((current) => ({ ...current, departmentId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Select department</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select>
              <input value={admissionForm.roomNumber} onChange={(e) => setAdmissionForm((current) => ({ ...current, roomNumber: e.target.value }))} placeholder="Room number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input value={admissionForm.diagnosis} onChange={(e) => setAdmissionForm((current) => ({ ...current, diagnosis: e.target.value }))} placeholder="Diagnosis" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input value={admissionForm.reason} onChange={(e) => setAdmissionForm((current) => ({ ...current, reason: e.target.value }))} placeholder="Admission reason" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
            <button onClick={() => void saveAdmission()} disabled={savingKey === "admission"} className="mt-4 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><PlusCircle className="mr-2 inline h-4 w-4" />{savingKey === "admission" ? "Saving..." : "Create admission"}</button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4 flex items-center gap-3"><FlaskConical className="h-5 w-5 text-amber-500" /><h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create lab order</h2></div>
            <div className="grid gap-4 md:grid-cols-2">
              <select value={labForm.patientId} onChange={(e) => setLabForm((current) => ({ ...current, patientId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Select patient</option>{patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.fullname}</option>)}</select>
              <select value={labForm.doctorId} onChange={(e) => setLabForm((current) => ({ ...current, doctorId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Assign doctor</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.fullname}</option>)}</select>
              <select value={labForm.departmentId} onChange={(e) => setLabForm((current) => ({ ...current, departmentId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Select department</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select>
              <input value={labForm.tests} onChange={(e) => setLabForm((current) => ({ ...current, tests: e.target.value }))} placeholder="Tests, comma separated" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <textarea value={labForm.clinicalNotes} onChange={(e) => setLabForm((current) => ({ ...current, clinicalNotes: e.target.value }))} placeholder="Clinical notes" rows={4} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
            <button onClick={() => void saveLabOrder()} disabled={savingKey === "lab"} className="mt-4 rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><PlusCircle className="mr-2 inline h-4 w-4" />{savingKey === "lab" ? "Saving..." : "Create lab order"}</button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-4 flex items-center gap-3"><CreditCard className="h-5 w-5 text-rose-500" /><h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Issue bill</h2></div>
            <div className="grid gap-4 md:grid-cols-2">
              <select value={billForm.patientId} onChange={(e) => setBillForm((current) => ({ ...current, patientId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Select patient</option>{patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.fullname}</option>)}</select>
              <select value={billForm.doctorId} onChange={(e) => setBillForm((current) => ({ ...current, doctorId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Assign doctor</option>{doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.fullname}</option>)}</select>
              <select value={billForm.departmentId} onChange={(e) => setBillForm((current) => ({ ...current, departmentId: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="">Select department</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select>
              <input value={billForm.amount} onChange={(e) => setBillForm((current) => ({ ...current, amount: e.target.value }))} placeholder="Amount" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input value={billForm.description} onChange={(e) => setBillForm((current) => ({ ...current, description: e.target.value }))} placeholder="Bill description" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input type="date" value={billForm.dueDate} onChange={(e) => setBillForm((current) => ({ ...current, dueDate: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
            <button onClick={() => void saveBill()} disabled={savingKey === "bill"} className="mt-4 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><PlusCircle className="mr-2 inline h-4 w-4" />{savingKey === "bill" ? "Issuing..." : "Issue bill"}</button>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Admissions queue</h2>
            <div className="mt-4 space-y-3">
              {admissions.slice(0, 5).map((admission) => (
                <div key={admission._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{admission.admissionNumber}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{admission.patient?.fullname || "Patient"} | {admission.department?.name || "Ward"} | Room {admission.roomNumber || "--"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(admission.status)}`}>{admission.status}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {admission.status !== "ready-for-discharge" && admission.status !== "discharged" && (
                      <button onClick={() => void updateAdmissionStatus(admission._id, "ready-for-discharge")} disabled={busyId === admission._id} className="rounded-2xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 disabled:opacity-50 dark:bg-amber-900/30 dark:text-amber-300">Ready</button>
                    )}
                    {admission.status !== "discharged" && (
                      <button onClick={() => void updateAdmissionStatus(admission._id, "discharged")} disabled={busyId === admission._id} className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-300">Discharge</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Lab workflow</h2>
            <div className="mt-4 space-y-3">
              {labOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{order.patient?.fullname || "Patient"} | {(order.tests || []).map((test) => test.name).join(", ")}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(order.status)}`}>{order.status}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.status !== "processing" && order.status !== "completed" && (
                      <button onClick={() => void updateLabStatus(order, "processing")} disabled={busyId === order._id} className="rounded-2xl bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-700 disabled:opacity-50 dark:bg-sky-900/30 dark:text-sky-300">Processing</button>
                    )}
                    {order.status !== "completed" && (
                      <button onClick={() => void updateLabStatus(order, "completed")} disabled={busyId === order._id} className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-300">Complete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Billing desk</h2>
            <div className="mt-4 space-y-3">
              {bills.slice(0, 5).map((bill) => (
                <div key={bill._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{bill.billNumber}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{bill.patient?.fullname || "Patient"} | {bill.department?.name || "Hospital services"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(bill.status)}`}>{bill.status}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Total</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{money(bill.totalAmount)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Balance</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{money(bill.balanceDue)}</p>
                    </div>
                  </div>
                  {bill.balanceDue > 0 && (
                    <button onClick={() => void settleBill(bill)} disabled={busyId === bill._id} className="mt-4 rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Mark paid</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Patient summary view</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inspect a patient timeline before issuing admissions, labs, or billing updates.</p>
            </div>
            <select value={selectedPatientId} onChange={(e) => { setSelectedPatientId(e.target.value); void loadPatientSummary(e.target.value); }} className="min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="">Select patient</option>
              {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.fullname}</option>)}
            </select>
          </div>

          {patientSummary ? (
            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{patientSummary.patient?.fullname}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{patientSummary.patient?.email || "Email unavailable"}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Appointments", value: patientSummary.stats?.appointments || 0 },
                      { label: "Records", value: patientSummary.stats?.records || 0 },
                      { label: "Admissions", value: patientSummary.stats?.admissions || 0 },
                      { label: "Labs", value: patientSummary.stats?.labOrders || 0 },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Outstanding balance</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{money(patientSummary.stats?.outstandingBalance || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent records</h3>
                  <div className="mt-4 space-y-3">
                    {(patientSummary.records || []).slice(0, 3).map((record: any) => (
                      <div key={record._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{record.diagnosis || "Clinical note"}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{record.department?.name || "General"} | {new Date(record.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent activity</h3>
                  <div className="mt-4 space-y-3">
                    {(patientSummary.admissions || []).slice(0, 2).map((admission: any) => (
                      <div key={admission._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{admission.admissionNumber}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{admission.status} | Room {admission.roomNumber || "--"}</p>
                      </div>
                    ))}
                    {(patientSummary.labOrders || []).slice(0, 2).map((order: any) => (
                      <div key={order._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(order.tests || []).map((test: any) => test.name).join(", ")} | {order.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Select a patient to inspect the full hospital timeline.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
