import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "@/constants/api";
import { Calendar, Search, Filter, Video } from "lucide-react";

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState({
    completed: false,
    confirmed: false,
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

  // Navigate to Video Call
  const handleJoinCall = (appointment) => {
    // Grab the ID whether backend sends _id, id, or appointmentId
    const roomId = appointment._id || appointment.id || appointment.appointmentId;
    navigate(`/video?roomID=${roomId}`);
  };

  const formatPrescription = (value) => {
    if (!value) return "";

    try {
      const data = JSON.parse(value);
      const meds = Array.isArray(data.medications)
        ? data.medications
            .filter((med) => med?.name || med?.dosage || med?.duration)
            .map(
              (med) =>
                `${med.name || "Medicine"} ${med.dosage || ""} ${
                  med.duration || ""
                }`.trim(),
            )
            .join("\n")
        : "";

      return [
        data.symptoms && `Symptoms: ${data.symptoms}`,
        data.diagnosis && `Diagnosis: ${data.diagnosis}`,
        data.prescription && `Prescription: ${data.prescription}`,
        meds && `Medicines:\n${meds}`,
        data.followUpDate && `Follow-up: ${data.followUpDate}`,
        data.notes && `Notes: ${data.notes}`,
      ]
        .filter(Boolean)
        .join("\n\n");
    } catch {
      return String(value);
    }
  };

  const handleViewPrescription = (appt) => {
    const text = formatPrescription(appt.prescription);
    const file = appt.prescriptionFile
      ? `\n\nFile: ${appt.prescriptionFile}`
      : "";
    window.alert(
      text ? `${text}${file}` : `Prescription file: ${appt.prescriptionFile}`,
    );
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
      case "confirmed":
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
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-muted-foreground" />
          {["completed", "confirmed", "pending"].map((key) => (
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
              <th className="p-3 text-left">Prescription</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-6">
                  Loading appointments...
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-6">
                  No appointments found
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appt, i) => {
                const isConfirmed = appt.status?.toLowerCase() === "confirmed";

                return (
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
                      {appt.date
                        ? new Date(appt.date).toLocaleDateString()
                        : "-"}
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

                    <td className="p-3">
                      {appt.prescription || appt.prescriptionFile ? (
                        <button
                          type="button"
                          onClick={() => handleViewPrescription(appt)}
                          className="text-sm font-semibold text-orange-600 hover:underline"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">Pending</span>
                      )}
                    </td>

                    {/* Video Call Button */}
                    <td className="p-3">
                      {isConfirmed ? (
                        <button
                          onClick={() => handleJoinCall(appt)}
                          className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          <Video size={16} />
                          Join Call
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          Not Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentTable;
