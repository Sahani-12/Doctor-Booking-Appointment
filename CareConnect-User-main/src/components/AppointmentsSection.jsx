import React, { useState, useEffect } from "react";
import BASE_URL from "@/constants/api";

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState({
    completed: false,
    accepted: false,
    pending: false,
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${BASE_URL}/appointments/my`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error();

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

  const toggleStatusFilter = (key) => {
    setStatusFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredAppointments = appointments.filter((appt) => {
    // safe check
    if (!appt) return false;

    // search filter
    if (filters.length) {
      const search = filters.join(" ").toLowerCase();
      const combined =
        `${appt.doctorName} ${appt.visitedFor} ${appt.status}`.toLowerCase();

      if (!combined.includes(search)) return false;
    }

    // date filter
    if (selectedDate && appt.date) {
      const apptDate = new Date(appt.date).toISOString().split("T")[0];
      if (apptDate !== selectedDate) return false;
    }

    // status filter
    const activeStatuses = Object.keys(statusFilter).filter(
      (k) => statusFilter[k],
    );

    if (activeStatuses.length > 0) {
      if (!activeStatuses.includes(appt.status.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 justify-between">
        <div className="flex gap-4 flex-wrap">
          {["completed", "accepted", "pending"].map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={statusFilter[key]}
                onChange={() => toggleStatusFilter(key)}
              />
              {key}
            </label>
          ))}

          <input
            type="date"
            className="border px-2 py-1 rounded"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-1 rounded"
          onChange={(e) => setFilters([e.target.value])}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-2">Submission</th>
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Doctor</th>
              <th className="p-2">Reason</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No appointments found
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appt, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    {appt.submissionDate
                      ? new Date(appt.submissionDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-2">
                    {appt.date ? new Date(appt.date).toLocaleDateString() : "-"}
                  </td>

                  <td className="p-2">{appt.time || "-"}</td>
                  <td className="p-2">{appt.doctorName || "-"}</td>
                  <td className="p-2">{appt.visitedFor || "-"}</td>

                  <td
                    className={`p-2 capitalize font-semibold ${
                      appt.status === "completed"
                        ? "text-green-600"
                        : appt.status === "accepted"
                          ? "text-yellow-600"
                          : "text-blue-600"
                    }`}
                  >
                    {appt.status}
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
