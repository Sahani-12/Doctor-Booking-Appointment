import React from "react";
import Navbar from "../Navbar";
import Documents from "../DocumentsSection";

export default function MedicalRecordsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Medical Records
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your uploaded prescriptions, lab reports, and other medical
            documents.
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 md:p-8 shadow-sm">
          <Documents />
        </div>
      </div>
    </div>
  );
}
