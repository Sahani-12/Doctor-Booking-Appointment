import React from "react";
import Navbar from "../components/Navbar";
import { FlaskConical } from "lucide-react";

export default function LabReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-300">
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
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md hover:bg-primary/90 transition">
            Book a Lab Test
          </button>
        </div>
      </div>
    </div>
  );
}
