import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import PaymentModal from "../Payment/PaymentModal";
import BASE_URL from "@/constants/api";
import { authFetch } from "@/utils/authFetch";
import { doctorAvatarUrl, formatSpecialization } from "@/utils/mediaUrl";
import {
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  IndianRupee,
} from "lucide-react";

const Consult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initial = state?.doctor;

  const [doctor, setDoctor] = useState(initial);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    problem: "",
  });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bookedAppointmentId, setBookedAppointmentId] = useState(null);

  // Fetch doctor details
  useEffect(() => {
    if (!initial?._id) return;
    fetch(`${BASE_URL}/doctors/${initial._id}`)
      .then((r) => r.json())
      .then((j) => {
        const d = j.data ?? j;
        if (d && (d.fullname || d._id)) setDoctor(d);
      })
      .catch(() => {});
  }, [initial?._id]);

  const minDate = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  // Fetch slots
  useEffect(() => {
    if (!doctor?._id || !formData.date) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await authFetch(
          `/appointments/slots/${doctor._id}/${formData.date}`,
          { method: "GET" }
        );
        const data = await res.json();
        const list = data.data?.slots ?? [];
        if (!cancelled) setSlots(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setSlots([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [doctor?._id, formData.date]);

  const fee =
    Number(doctor?.fee ?? doctor?.consultationFee ?? 499) || 499;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "date") setSelectedSlot("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      alert("Please select an available time slot.");
      return;
    }

    if (!formData.date) {
      alert("Please choose a date.");
      return;
    }

    setBookingLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Please log in first.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/appointments`,
        {
          doctorId: doctor?._id,
          date: formData.date,
          slot: selectedSlot,
          notes: formData.problem || "Consultation request",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const apptId =
          response.data.appointmentId ||
          response.data.data?._id ||
          null;

        if (!apptId) {
          alert("Appointment booked successfully.");
          goDashboard();
          return;
        }

        setBookedAppointmentId(apptId);
        setPaymentOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        error.response?.data?.message ||
          "Could not book this slot. Try another time."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const goDashboard = () => {
    const u = JSON.parse(sessionStorage.getItem("user") || "{}");
    const name = u.fullname || u.name || "profile";
    navigate(`/user-dashboard/${encodeURIComponent(name)}`);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-xl rounded-2xl p-8 text-center max-w-md">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground">
              Book a Consultation
            </h2>
            <p className="text-muted-foreground mt-2">
              Browse doctors and click on Consult Now to proceed.
            </p>
            <Link
              to="/doctor-search"
              className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold"
            >
              Browse Doctors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avatar = doctorAvatarUrl(doctor);
  const spec = formatSpecialization(doctor.specialization);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-primary font-semibold uppercase text-sm">
            CareConnect
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Consult Now
          </h1>
          <p className="text-muted-foreground">
            Choose a date, select a slot, and confirm your appointment.
          </p>
        </div>

        {/* Doctor Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img
                src={avatar}
                alt={doctor.fullname}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {doctor.fullname}
                </h2>
                <p>{spec || "Specialist"}</p>
                <div className="flex gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />{" "}
                    {doctor.city || "India"}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} />{" "}
                    {doctor.experience || "—"} yrs
                  </span>
                </div>
                <div className="mt-3 text-lg font-bold flex items-center gap-1">
                  <IndianRupee size={18} /> {fee}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="font-semibold flex items-center gap-2">
                <CalendarDays size={16} />
                Select Date
              </label>
              <input
                type="date"
                name="date"
                min={minDate}
                value={formData.date}
                onChange={handleChange}
                className="w-full mt-2 border border-border rounded-xl p-3 bg-background"
                required
              />
            </div>

            <div>
              <label className="font-semibold">
                Reason for Visit
              </label>
              <textarea
                name="problem"
                rows={3}
                value={formData.problem}
                onChange={handleChange}
                placeholder="Describe your symptoms..."
                className="w-full mt-2 border border-border rounded-xl p-3 bg-background"
              />
            </div>

            <div>
              <label className="font-semibold flex items-center gap-2">
                <Clock size={16} />
                Available Slots
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {slots.map(({ startTime, status }) => (
                  <button
                    key={startTime}
                    type="button"
                    disabled={status === "booked"}
                    onClick={() => setSelectedSlot(startTime)}
                    className={`py-2 rounded-lg border ${
                      selectedSlot === startTime
                        ? "bg-primary text-white"
                        : "bg-background"
                    }`}
                  >
                    {startTime}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 rounded-xl font-semibold"
            >
              {bookingLoading
                ? "Booking..."
                : "Confirm & Pay"}
            </button>
          </form>
        </div>
      </div>

      <PaymentModal
        isOpen={paymentOpen}
        appointmentId={bookedAppointmentId}
        amount={fee}
        doctorName={doctor.fullname}
        onSuccess={goDashboard}
        onClose={goDashboard}
      />
    </div>
  );
};

export default Consult;