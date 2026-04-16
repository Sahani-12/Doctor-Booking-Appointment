import React from "react";
import Navbar from "../components/Navbar";
import { Activity } from "lucide-react";

export default function ActiveAdmissionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
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
      </div>
    </div>
  );
}
