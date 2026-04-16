import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { Activity, Loader2, Calendar, Bed, RefreshCw } from "lucide-react";
import BASE_URL from "@/constants/api";

export default function ActiveAdmissionPage() {
  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmission = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/hospital/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.activeAdmission) {
        setAdmission(data.data.activeAdmission);
      } else {
        setAdmission(null); // Clear old data if no active admission
      }
    } catch (err) {
      console.error("Error fetching admission:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmission();
    // Real-time polling every 10 seconds
    const intervalId = setInterval(() => fetchAdmission(true), 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : admission ? (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="text-blue-500" /> Current Admission Details
              </h2>
              <button
                onClick={fetchAdmission}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground"
                title="Refresh Data"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">Room / Bed</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Bed size={18} />{" "}
                  {admission.roomNumber || "Pending Assignment"}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">Admitted On</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Calendar size={18} />{" "}
                  {new Date(admission.admissionDate).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-xl md:col-span-2">
                <p className="text-sm text-muted-foreground">
                  Reason / Diagnosis
                </p>
                <p className="text-lg font-semibold">
                  {admission.reason || "Under observation"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6 border-4 border-blue-100 dark:border-blue-500/20">
              <Activity size={48} />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              No Active Admission
            </h1>
            <p className="text-muted-foreground max-w-lg mb-8">
              You are not currently admitted to the hospital. Any ongoing
              inpatient care details, room number, and assigned doctors will
              appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
