import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
  FlaskConical,
  Loader2,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";
import BASE_URL from "@/constants/api";
import BookLabTestModal from "../BookLabTestModal";

export default function LabReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchReports = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/hospital/lab-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setReports(data.data);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Error fetching lab reports:", err);
    } finally {
      if (!isBackground) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Real-time polling every 5 seconds for faster updates
    const intervalId = setInterval(() => fetchReports(true), 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = async () => {
    await fetchReports(true);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "in-progress":
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BookLabTestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Lab Orders & Reports
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold shadow hover:bg-secondary/90 transition flex items-center gap-2 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow hover:bg-primary/90 transition"
            >
              Book a Lab Test
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : reports.length > 0 ? (
          <div className="grid gap-4">
            {reports.map((report, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">
                      {(report.tests || []).map((t) => t.name).join(", ") ||
                        "Lab Test"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ordered: {new Date(report.orderedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  <span
                    className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap ${getStatusBadge(report.status)}`}
                  >
                    {report.status || "Pending"}
                  </span>
                  {report.status === "completed" ? (
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition font-medium text-sm whitespace-nowrap">
                      <Download size={16} /> Download
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300 bg-card border border-border rounded-2xl shadow-sm">
            <div className="w-24 h-24 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-6 border-4 border-purple-100 dark:border-purple-500/20">
              <FlaskConical size={48} />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Lab Orders & Reports
            </h1>
            <p className="text-muted-foreground max-w-lg mb-8">
              You have no recent laboratory orders or test reports available at
              the moment. Once your tests are processed, the results will be
              available for download here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
