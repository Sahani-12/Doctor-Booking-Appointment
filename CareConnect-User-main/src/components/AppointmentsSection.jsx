import React, { useState, useEffect } from "react";
import BASE_URL from "@/constants/api";
import { Calendar, Search, Filter } from "lucide-react";

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState({
    completed: false,
    accepted: false,
    pending: false,
  });

  // Fetch Appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${BASE_URL}/appointments/my`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch appointments");

        const data = await res.json();
        const list = data.data ?? data.appointments ?? [];
        setAppointments(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Toggle Status Filter
  const toggleStatusFilter = (key) => {
    setStatusFilter((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter Logic
  const filteredAppointments = appointments.filter((appt) => {
    if (!appt) return false;

    const searchText = search.toLowerCase();
    const combined =
      `${appt.doctorName} ${appt.visitedFor} ${appt.status}`.toLowerCase();

    if (search && !combined.includes(searchText)) return false;

    if (selectedDate && appt.date) {
      const apptDate = new Date(appt.date).toISOString().split("T")[0];
      if (apptDate !== selectedDate) return false;
    }

    const activeStatuses = Object.keys(statusFilter).filter(
      (k) => statusFilter[k],
    );

    if (activeStatuses.length > 0) {
      if (!activeStatuses.includes(appt.status?.toLowerCase())) return false;
    }

    return true;
  });

  // Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "accepted":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "pending":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="text-primary" size={20} />
          My Appointments
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-muted-foreground" />
          {["completed", "accepted", "pending"].map((key) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              <input
                type="checkbox"
                checked={statusFilter[key]}
                onChange={() => toggleStatusFilter(key)}
                className="accent-orange-500"
              />
              <span className="capitalize">{key}</span>
            </label>
          ))}

          <input
            type="date"
            className="border border-border bg-background text-foreground px-3 py-2 rounded-lg"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search appointments..."
            className="pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="p-3 text-left">Submission</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Doctor</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-6 text-muted-foreground"
                >
                  Loading appointments...
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-6 text-muted-foreground"
                >
                  No appointments found
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appt, i) => (
                <tr
                  key={i}
                  className="border-b border-border hover:bg-muted/50 transition"
                >
                  <td className="p-3">
                    {appt.submissionDate
                      ? new Date(appt.submissionDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-3">
                    {appt.date ? new Date(appt.date).toLocaleDateString() : "-"}
                  </td>

                  <td className="p-3">{appt.time || "-"}</td>
                  <td className="p-3">{appt.doctorName || "-"}</td>
                  <td className="p-3">{appt.visitedFor || "-"}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                        appt.status,
                      )}`}
                    >
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentTable;
