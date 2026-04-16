import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { History, Loader2, Bed } from "lucide-react";
import BASE_URL from "@/constants/api";

export default function AdmissionHistoryPage() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view admission history.");
          setLoading(false);
          return;
        }
        // Fetch all admissions, frontend will filter for discharged/past ones
        const res = await fetch(`${BASE_URL}/hospital/admissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          // Filter for past admissions
          const history = data.data.filter(
            (admission) =>
              admission.status === "discharged" ||
              new Date(admission.admissionDate) < new Date(),
          );
          setAdmissions(history);
        } else {
          throw new Error(data.message || "Failed to fetch admission history.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
          Admission History
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : admissions.length > 0 ? (
          <div className="grid gap-4">
            {admissions.map((admission) => (
              <div
                key={admission._id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      {admission.admissionNumber}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {admission.diagnosis ||
                        admission.reason ||
                        "Hospital Stay"}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Admitted:{" "}
                      {new Date(admission.admissionDate).toLocaleDateString()}
                      {admission.actualDischargeDate &&
                        ` • Discharged: ${new Date(admission.actualDischargeDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`}
                  >
                    {admission.status}
                  </span>
                </div>
                <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                  <p>
                    <strong>Doctor:</strong>{" "}
                    {admission.doctor?.fullname || "N/A"}
                  </p>
                  <p>
                    <strong>Department:</strong>{" "}
                    {admission.department?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Room:</strong> {admission.roomNumber || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-border rounded-2xl shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-500/10 text-slate-500 rounded-full flex items-center justify-center mb-6 border-4 border-slate-100 dark:border-slate-500/20">
              <History size={48} />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              No Admission History
            </h1>
            <p className="text-muted-foreground max-w-lg mb-8">
              Your past hospital admissions, treatments, and discharge summaries
              will be securely recorded and accessible here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
