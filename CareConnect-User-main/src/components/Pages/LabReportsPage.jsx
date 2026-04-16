import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { FlaskConical, Loader2, Download, FileText } from "lucide-react";
import BASE_URL from "@/constants/api";
import BookLabTestModal from "../BookLabTestModal";

export default function LabReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/hospital/lab-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setReports(data.data);
        }
      } catch (err) {
        console.error("Error fetching lab reports:", err);
      } finally {
        if (!isBackground) setLoading(false);
      }
    };

    fetchReports();
    // Real-time polling every 10 seconds
    const intervalId = setInterval(() => fetchReports(true), 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BookLabTestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Lab Orders & Reports
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow hover:bg-primary/90 transition"
          >
            Book a Lab Test
          </button>
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
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                    <FileText />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {(report.tests || []).map((t) => t.name).join(", ")}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      Ordered: {new Date(report.orderedAt).toLocaleDateString()}{" "}
                      • Status: {report.status}
                    </p>
                  </div>
                </div>
                {report.status === "completed" ? (
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition font-medium text-sm">
                    <Download size={16} /> View Report
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium text-sm">
                    In Progress
                  </span>
                )}
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
