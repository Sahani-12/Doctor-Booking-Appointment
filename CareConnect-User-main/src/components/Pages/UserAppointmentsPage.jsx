import React from "react";
import Navbar from "../Navbar";
import Appointment from "../AppointmentsSection";
import { useNavigate } from "react-router-dom";

export default function UserAppointmentsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4 lg:p-6 mt-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            My Appointments
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage your upcoming and past appointments.
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 md:p-8 shadow-sm">
          <Appointment />
        </div>
      </div>
    </div>
  );
}
          