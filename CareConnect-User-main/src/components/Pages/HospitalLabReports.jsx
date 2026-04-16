import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FlaskConical,
  Loader2,
  AlertCircle,
  Download,
  Eye,
  Search,
  Calendar,
  Beaker,
  TrendingUp,
  Filter,
} from "lucide-react";
import { hospitalAPI } from "@/services/api";
import BASE_URL from "@/constants/api";
import { useRealTimePolling } from "@/hooks/useRealTime";
import Navbar from "../Navbar";
import Footer from "../Footer";
import HospitalPortalNav from "../HospitalPortalNav";

const LabOrderCard = ({ order }) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "sample-collected":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Lab Order #{order.orderNumber || order._id.slice(-6)}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              By Dr. {order.doctor?.fullname || "Doctor"}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusIcon(
              order.status,
            )}`}
          >
            {order.status
              ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
              : "Pending"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {/* Tests */}
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-3">
            <Beaker className="h-4 w-4" />
            Tests Ordered
          </p>
          <div className="flex flex-wrap gap-2">
            {(order.tests || []).map((test, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {test.name || test}
              </span>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ordered Date
            </p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-white">
              {new Date(order.orderedAt).toLocaleDateString("en-IN")}
            </p>
          </div>
          {order.completedAt && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed Date
              </p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {new Date(order.completedAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          )}
        </div>

        {/* Clinical Notes */}
        {order.clinicalNotes && (
          <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Clinical Notes
            </p>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {order.clinicalNotes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          {order.status === "completed" && (
            <>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                <Eye className="h-4 w-4" />
                View Report
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HospitalLabReportsPage() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real-time polling for lab orders
  useRealTimePolling(
    // Workaround for a bug in hospitalAPI that was causing a
    // "/api/api/..." double path error. This fetch call constructs the correct URL.
    async () => {
      const res = await fetch(`${BASE_URL}/hospital/lab-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Request failed: ${res.status} ${errorBody}`);
      }
      return res.json();
    },
    (response) => {
      setLabOrders(response.data || []);
      setLoading(false);
    },
    (error) => {
      setError(error?.message || "Failed to load lab orders");
      setLoading(false);
      console.error("Error fetching lab orders:", error);
    },
    10000, // Poll every 10 seconds
    !!token, // Enable when token exists
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
  }, [token, navigate]);

  const filteredOrders = labOrders.filter((order) => {
    const matchesSearch =
      (order.tests || []).some((test) =>
        (test.name || test).toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      order.doctor?.fullname.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    return order.status === filter && matchesSearch;
  });

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
                Lab Reports
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track and download your lab test results
              </p>
            </div>

            {/* Search & Filter */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by test name or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 transition focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value="all">All Orders</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex min-h-96 items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading lab orders...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-300">
                      Error Loading Lab Orders
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                <FlaskConical className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No lab orders found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Your lab test orders will appear here
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredOrders.map((order) => (
                  <LabOrderCard key={order._id} order={order} />
                ))}
              </div>
            )}

            {/* Stats */}
            {!loading && labOrders.length > 0 && (
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Orders
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {labOrders.length}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed Tests
                  </p>
                  <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {labOrders.filter((o) => o.status === "completed").length}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Results
                  </p>
                  <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {labOrders.filter((o) => o.status === "pending").length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
