import React, { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Check,
  X,
  Loader2,
  Trash2,
  FileText,
  CreditCard,
  User,
  Calendar,
} from "lucide-react";
import apiService from "../services/apiService";

interface Patient {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
}

interface LineItem {
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Bill {
  _id: string;
  billNumber: string;
  patient: Patient;
  doctor?: { _id: string; fullname: string; specialization?: string };
  lineItems: LineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: "draft" | "pending" | "partially-paid" | "paid" | "cancelled" | string;
  dueDate?: string;
  issuedAt: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}

const PRESET_SERVICES = [
  { description: "General Consultation Fee", category: "Consultation", unitPrice: 500 },
  { description: "Specialist Consultation Fee", category: "Consultation", unitPrice: 800 },
  { description: "Emergency / Immediate Consultation", category: "Consultation", unitPrice: 1200 },
  { description: "Wound Dressing & Suturing", category: "Procedure", unitPrice: 450 },
  { description: "Clinical ECG & Heart Rhythm Review", category: "Diagnostics", unitPrice: 600 },
  { description: "Blood Pressure & Vitals Assessment", category: "Checkup", unitPrice: 200 },
  { description: "Prescription Medication Administration", category: "Pharmacy", unitPrice: 350 },
];

const currency = (val = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);

export default function DoctorBillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Bill Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "General Consultation Fee", category: "Consultation", quantity: 1, unitPrice: 500, amount: 500 },
  ]);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isImmediatelyPaid, setIsImmediatelyPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [billNotes, setBillNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  // View Bill Modal State
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [billsRes, patientsRes] = await Promise.all([
        apiService.getBills().catch(() => ({ data: [] })),
        apiService.getMyPatients().catch(() => ({ data: [] })),
      ]);

      const billsList = Array.isArray(billsRes?.data) ? billsRes.data : [];
      setBills(billsList);

      const patientsList = Array.isArray(patientsRes?.data)
        ? patientsRes.data
        : Array.isArray(patientsRes)
        ? patientsRes
        : [];
      setPatients(patientsList);
    } catch (err: any) {
      console.error("Failed to load bills data", err);
      setError(err?.message || "Failed to load billing records");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", category: "Service", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const handleApplyPreset = (preset: (typeof PRESET_SERVICES)[0]) => {
    setLineItems([
      ...lineItems,
      {
        description: preset.description,
        category: preset.category,
        quantity: 1,
        unitPrice: preset.unitPrice,
        amount: preset.unitPrice,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    if (field === "quantity" || field === "unitPrice") {
      const q = Number(field === "quantity" ? value : item.quantity) || 0;
      const p = Number(field === "unitPrice" ? value : item.unitPrice) || 0;
      item.amount = q * p;
    }

    updated[index] = item;
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netTotal = Math.max(0, subtotal + Number(taxAmount || 0) - Number(discountAmount || 0));

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setError("");

    if (!selectedPatientId) {
      setModalError("Please select a patient before issuing the bill.");
      return;
    }

    const validItems = lineItems.filter((item) => item.description.trim() && item.amount > 0);
    if (validItems.length === 0) {
      setModalError("Please provide at least one valid item with a description and amount.");
      return;
    }

    try {
      setActionLoading(true);

      const payload = {
        patientId: selectedPatientId,
        lineItems: validItems,
        taxAmount: Number(taxAmount) || 0,
        discountAmount: Number(discountAmount) || 0,
        paidAmount: isImmediatelyPaid ? netTotal : 0,
        paymentMethod: isImmediatelyPaid ? paymentMethod : "",
        status: isImmediatelyPaid ? "paid" : "pending",
        notes: billNotes,
        dueDate: dueDate || undefined,
      };

      const res = await apiService.createBill(payload);
      if (res?.success || res?.data) {
        setSuccess("Bill issued successfully!");
        setShowCreateModal(false);
        resetForm();
        loadData();
        setTimeout(() => setSuccess(""), 4000);
      } else {
        throw new Error(res?.message || "Failed to create bill");
      }
    } catch (err: any) {
      console.error("Error creating bill:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to create bill";
      setModalError(errMsg);
      setError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async (bill: Bill) => {
    if (!window.confirm(`Mark Bill #${bill.billNumber} for ${bill.patient?.fullname || "Patient"} as PAID?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiService.updateBill(bill._id, {
        status: "paid",
        paidAmount: bill.totalAmount,
        paymentMethod: "cash",
      });

      if (res?.success || res?.data) {
        setSuccess(`Bill #${bill.billNumber} marked as Paid!`);
        loadData();
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err: any) {
      console.error("Error marking bill paid:", err);
      setError(err?.message || "Failed to update bill payment");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatientId("");
    setModalError("");
    setLineItems([
      { description: "General Consultation Fee", category: "Consultation", quantity: 1, unitPrice: 500, amount: 500 },
    ]);
    setTaxAmount(0);
    setDiscountAmount(0);
    setIsImmediatelyPaid(false);
    setPaymentMethod("cash");
    setBillNotes("");
    setDueDate("");
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      b.billNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patient?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patient?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || b.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalInvoiced = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalCollected = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalOutstanding = bills.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const pendingCount = bills.filter((b) => b.status === "pending" || b.balanceDue > 0).length;

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300";
      case "partially-paid":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Receipt className="w-8 h-8 text-brand-500" />
            Billing & Invoicing Desk
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Issue consultation bills, procedure charges, and track patient payment status
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-md shadow-brand-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Issue New Bill
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-sm font-medium">Total Invoiced</span>
            <DollarSign className="w-5 h-5 text-brand-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {currency(totalInvoiced)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all issued patient bills</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-sm font-medium">Collected Revenue</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(totalCollected)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Successfully cleared payments</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-sm font-medium">Balance Due</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {currency(totalOutstanding)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pendingCount} bills awaiting payment</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-sm font-medium">Total Bills</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {bills.length}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Issued from your practice</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Bill #, Patient name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["all", "pending", "paid", "partially-paid"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === f
                  ? "bg-brand-500 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {f.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading billing records...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">No Bills Found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search query or filter"
                : "You haven't issued any bills yet. Click 'Issue New Bill' to generate one."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700/60 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Bill Number</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Services / Charges</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Balance Due</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredBills.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-brand-600 dark:text-brand-400">
                      {b.billNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {b.patient?.fullname || "Patient"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {b.patient?.phone || b.patient?.email || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="truncate text-gray-700 dark:text-gray-300">
                        {b.lineItems?.map((li) => li.description).join(", ") || "Consultation Service"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {b.lineItems?.length || 0} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {currency(b.totalAmount)}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {b.balanceDue > 0 ? (
                        <span className="text-red-600 dark:text-red-400">{currency(b.balanceDue)}</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">₹0 (Cleared)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(b.status)}`}>
                        {b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {new Date(b.issuedAt || b._id).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedBill(b)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium cursor-pointer transition-colors"
                        title="View Full Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>

                      {b.status !== "paid" && b.balanceDue > 0 && (
                        <button
                          onClick={() => handleMarkAsPaid(b)}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer transition-colors"
                          title="Mark bill as collected/paid"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE BILL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto max-h-[88vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white dark:from-gray-800 dark:to-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6 text-brand-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Issue Clinical Invoice / Bill
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Modal Error Alert */}
              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Select Patient */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Select Patient *
                  </label>
                  {patients.length > 0 ? (
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                      {patients.length} booked patient{patients.length === 1 ? "" : "s"} available
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await apiService.getMyPatients();
                        if (res?.data) setPatients(res.data);
                      }}
                      className="text-xs text-brand-500 hover:underline"
                    >
                      Refresh Patients
                    </button>
                  )}
                </div>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    setModalError("");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose Booked Patient --</option>
                  {patients.length === 0 ? (
                    <option value="" disabled>No booked patients found</option>
                  ) : (
                    patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.fullname} ({p.phone || p.email})
                      </option>
                    ))
                  )}
                </select>
                {patients.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                    No booked patients found. Patients who book appointments with you will appear here.
                  </p>
                )}
              </div>

              {/* Preset Shortcuts */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Quick Add Standard Services
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SERVICES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors cursor-pointer"
                    >
                      + {preset.description} (₹{preset.unitPrice})
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Line Items & Charges *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Custom Item
                  </button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700"
                    >
                      <input
                        type="text"
                        placeholder="Item description (e.g. Consultation, Dressing)"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                        required
                        className="flex-3 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />

                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-xs text-gray-400">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                          className="w-14 px-2 py-2 text-sm text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-xs text-gray-400">₹:</span>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(index, "unitPrice", e.target.value)}
                          className="w-20 px-2 py-2 text-sm text-right rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="w-20 text-right font-bold text-gray-900 dark:text-white text-sm">
                        ₹{item.amount}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(index)}
                        disabled={lineItems.length === 1}
                        className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax, Discount & Totals */}
              <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{currency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax / GST (₹):</span>
                  <input
                    type="number"
                    min="0"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(Number(e.target.value) || 0)}
                    className="w-28 px-3 py-1.5 text-right rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount (₹):</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                    className="w-28 px-3 py-1.5 text-right rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                  <span>Total Payable:</span>
                  <span className="text-brand-600 dark:text-brand-400 text-lg">{currency(netTotal)}</span>
                </div>
              </div>

              {/* Immediate Payment Option */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isImmediatelyPaid}
                    onChange={(e) => setIsImmediatelyPaid(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Patient has already paid at desk / clinic (Mark as Paid)
                  </span>
                </label>

                {isImmediatelyPaid && (
                  <div className="mt-3 pl-7 flex items-center gap-3">
                    <span className="text-xs text-gray-500">Payment Method:</span>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI / QR</option>
                      <option value="card">Card / POS</option>
                      <option value="demo">Demo Simulation</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Due Date & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Notes / Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Follow-up after 5 days"
                    value={billNotes}
                    onChange={(e) => setBillNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0 sticky bottom-0 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirm & Issue Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BILL DETAILS MODAL */}
      {selectedBill && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 my-auto max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Invoice #{selectedBill.billNumber}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Issued on {new Date(selectedBill.issuedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Info */}
            <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl mb-4 text-sm space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                Patient: {selectedBill.patient?.fullname}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Email: {selectedBill.patient?.email} | Phone: {selectedBill.patient?.phone || "N/A"}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 mb-4">
              <div className="text-xs uppercase font-semibold text-gray-400 px-1">Itemized Services</div>
              {selectedBill.lineItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
                  <span className="text-gray-800 dark:text-gray-200">
                    {item.description} <span className="text-xs text-gray-400">(x{item.quantity || 1})</span>
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{currency(item.amount)}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal:</span>
                <span>{currency(selectedBill.subtotal)}</span>
              </div>
              {selectedBill.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- {currency(selectedBill.discountAmount)}</span>
                </div>
              )}
              {selectedBill.taxAmount > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax:</span>
                  <span>+ {currency(selectedBill.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total Amount:</span>
                <span>{currency(selectedBill.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Paid Amount:</span>
                <span>{currency(selectedBill.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold">
                <span>Balance Due:</span>
                <span>{currency(selectedBill.balanceDue)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBill(null)}
                className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

