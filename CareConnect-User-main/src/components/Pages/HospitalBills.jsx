import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Loader2,
  AlertCircle,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Search,
} from "lucide-react";
import { hospitalAPI } from "@/services/api";
import BASE_URL from "@/constants/api";
import Navbar from "../Navbar";
import Footer from "../Footer";
import HospitalPortalNav from "../HospitalPortalNav";

const currency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const BillCard = ({ bill }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "partially-paid":
        return "bg-blue-100 text-blue-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalAmount =
    bill.lineItems?.reduce((sum, item) => sum + (item.amount || 0), 0) ||
    bill.totalAmount ||
    0;

  const paidAmount = bill.paidAmount || 0;
  const dueAmount = totalAmount - paidAmount;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Bill #{bill.billNumber || bill._id.slice(-6)}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Issued{" "}
              {new Date(bill.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(
              bill.status,
            )}`}
          >
            {bill.status
              ? bill.status.charAt(0).toUpperCase() + bill.status.slice(1)
              : "Pending"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {/* Line Items Summary */}
        {bill.lineItems && bill.lineItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">
              Services
            </p>
            <div className="space-y-2">
              {bill.lineItems.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0 dark:border-gray-800"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {item.description || item.name}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {currency(item.amount)}
                  </p>
                </div>
              ))}
              {bill.lineItems.length > 3 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  +{bill.lineItems.length - 3} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Amount Details */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">Subtotal</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {currency(totalAmount)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">Paid Amount</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                {currency(paidAmount)}
              </p>
            </div>
            {dueAmount > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="font-semibold text-red-900 dark:text-red-300">
                  Amount Due
                </p>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                  {currency(dueAmount)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            <Eye className="h-4 w-4" />
            View Details
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
            <Download className="h-4 w-4" />
            Download
          </button>
          {dueAmount > 0 && (
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 font-semibold text-white transition hover:shadow-lg">
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HospitalBillsPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadBills();
  }, [token, filter]);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError("");
      // Workaround for a bug in hospitalAPI that was causing a
      // "/api/api/..." double path error. This fetch call constructs the correct URL.
      const res = await fetch(`${BASE_URL}/hospital/bills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Request failed: ${res.status} ${errorBody}`);
      }
      const response = await res.json();
      let data = response.data || [];

      if (filter !== "all") {
        data = data.filter((bill) => bill.status === filter);
      }

      setBills(data);
    } catch (err) {
      setError(err.message || "Failed to load bills");
      console.error("Error loading bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalBillAmount = bills.reduce(
    (sum, bill) => sum + (bill.totalAmount || 0),
    0,
  );
  const totalPaidAmount = bills.reduce(
    (sum, bill) => sum + (bill.paidAmount || 0),
    0,
  );
  const totalDueAmount = totalBillAmount - totalPaidAmount;

  return (
    <>
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar Navigation */}
        <HospitalPortalNav
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={window.innerWidth < 1024}
        />

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Bills & Payments
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View and manage your hospital bills
              </p>
            </div>

            {/* Summary Cards */}
            {!loading && bills.length > 0 && (
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Bills
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {currency(totalBillAmount)}
                      </p>
                    </div>
                    <CreditCard className="h-10 w-10 text-gray-400" />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Paid
                      </p>
                      <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {currency(totalPaidAmount)}
                      </p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Amount Due
                      </p>
                      <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                        {currency(totalDueAmount)}
                      </p>
                    </div>
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
              {["all", "paid", "pending", "partially-paid", "overdue"].map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-6 py-2 font-semibold transition ${
                      filter === f
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
                  </button>
                ),
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex min-h-96 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-500" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading bills...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-300">
                      Error Loading Bills
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : bills.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No bills found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Your bills will appear here once generated
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {bills.map((bill) => (
                  <BillCard key={bill._id} bill={bill} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
