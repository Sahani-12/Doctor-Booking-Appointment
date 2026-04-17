import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { Receipt, Loader2, CreditCard } from "lucide-react";
import BASE_URL from "@/constants/api";
import BillPaymentModal from "../Payment/BillPaymentModal";

// Helper function to format currency
const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function HospitalBillsPage() {
  const [bills, setBills] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchBills = async (isBackground = false) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view bills.");
        if (!isBackground) setLoading(false);
        return;
      }
      // Fetch user's own bills
      const res = await fetch(`${BASE_URL}/users/bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBills(data.data);
        setLastUpdate(new Date().toLocaleTimeString());
        // Calculate total outstanding balance
        const totalDue = data.data.reduce(
          (sum, bill) => sum + (bill.balanceDue || 0),
          0,
        );
        setBalance(totalDue);
        if (!isBackground) setError("");
      } else {
        throw new Error(data.message || "Failed to fetch bills.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    const intervalId = setInterval(() => fetchBills(true), 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handlePaymentSuccess = (updatedBill) => {
    // Refresh bills list after successful payment
    const updatedBills = bills.map((bill) =>
      bill._id === updatedBill._id ? updatedBill : bill,
    );
    setBills(updatedBills);
    const totalDue = updatedBills.reduce(
      (sum, bill) => sum + (bill.balanceDue || 0),
      0,
    );
    setBalance(totalDue);
  };

  const openPaymentModal = (bill) => {
    if (bill.balanceDue > 0) {
      setSelectedBill(bill);
      setPaymentModalOpen(true);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "partially-paid":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BillPaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        bill={selectedBill}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Hospital Bills
          </h1>
          <div className="flex flex-col gap-2">
            <div className="px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold text-lg flex items-center gap-2">
              <CreditCard size={20} /> Outstanding Balance: {money(balance)}
            </div>
            {lastUpdate && (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                Last updated: {lastUpdate}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : bills.length > 0 ? (
          <div className="grid gap-4">
            {bills.map((bill) => (
              <div
                key={bill._id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      {bill.billNumber}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {bill.lineItems?.[0]?.description || "Hospital Services"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Issued: {new Date(bill.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(bill.status)}`}
                  >
                    {bill.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Total
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {money(bill.totalAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/20">
                    <p className="text-xs uppercase tracking-wide text-emerald-500">
                      Paid
                    </p>
                    <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-300">
                      {money(bill.paidAmount)}
                    </p>
                  </div>
                  <div
                    className={`rounded-xl px-3 py-2 ${bill.balanceDue > 0 ? "bg-rose-50 dark:bg-rose-950/20" : "bg-slate-50 dark:bg-slate-800"}`}
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
                {bill.balanceDue > 0 && (
                  <button
                    onClick={() => openPaymentModal(bill)}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    Pay Now {money(bill.balanceDue)}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-border rounded-2xl shadow-sm">
            <div className="w-24 h-24 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 border-4 border-green-100 dark:border-green-500/20">
              <Receipt size={48} />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              No Bills Found
            </h1>
            <p className="text-muted-foreground max-w-lg mb-8">
              You have no pending or recent hospital bills to display. All your
              transaction history and invoices will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
