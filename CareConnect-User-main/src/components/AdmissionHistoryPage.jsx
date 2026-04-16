import React from "react";
import Navbar from "../components/Navbar";
import { History } from "lucide-react";

export default function AdmissionHistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-500/10 text-slate-500 rounded-full flex items-center justify-center mb-6 border-4 border-slate-100 dark:border-slate-500/20">
            <History size={48} />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Admission History
          </h1>
          <p className="text-muted-foreground max-w-lg mb-8">
            Your past hospital admissions, treatments, operations, and discharge
            summaries will be securely recorded and accessible here.
          </p>
        </div>
      </div>
    </div>
  );
}
