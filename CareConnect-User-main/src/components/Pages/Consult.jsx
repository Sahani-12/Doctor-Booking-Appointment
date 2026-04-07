import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import PaymentModal from "../Payment/PaymentModal";
import BASE_URL from "@/constants/api";
import { authFetch } from "@/utils/authFetch";
import { doctorAvatarUrl, formatSpecialization } from "@/utils/mediaUrl";
import { CalendarDays, Clock, MapPin, ShieldCheck, Sparkles } from "lucide-react";

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

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

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
          { method: "GET" },
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

  const fee = Number(doctor?.fee ?? doctor?.consultationFee ?? 499) || 499;

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
        },
      );

      if (response.data.success) {
        const apptId =
          response.data.appointmentId || response.data.data?._id || null;
        if (!apptId) {
          alert("Appointment booked. You can view it in your dashboard.");
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
          "Could not book this slot. Try another time.",
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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center border border-slate-100">
            <Sparkles className="w-10 h-10 text-teal-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Book a consultation
            </h1>
            <p className="text-slate-600 mb-8 text-sm sm:text-base">
              Find a doctor, then tap <strong>Consult Now</strong> on their
              card to continue here with their photo, fee, and payment.
            </p>
            <Link
              to="/doctor-search"
              className="inline-flex justify-center w-full sm:w-auto rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-3 text-sm font-semibold shadow-lg hover:opacity-95 transition-opacity"
            >
              Browse doctors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avatar = doctorAvatarUrl(doctor);
  const spec = formatSpecialization(doctor.specialization);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 pb-24">
        <div className="text-center mb-8">
          <p className="text-teal-400 text-sm font-medium tracking-wide uppercase mb-2">
            CareConnect
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Consult now
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Choose a date, pick a slot, confirm—then pay securely (Razorpay /
            Stripe) or skip if you will pay at the clinic.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/95 backdrop-blur">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-8 sm:px-8 text-white">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <img
                src={avatar}
                alt={doctor.fullname}
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl"
              />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{doctor.fullname}</h2>
                <p className="text-teal-100 mt-1">{spec || "Specialist"}</p>
                <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start text-sm">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                    <MapPin className="w-4 h-4" />
                    {doctor.city || doctor.location || "India"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                    <ShieldCheck className="w-4 h-4" />
                    {doctor.experience || "—"} yrs exp
                  </span>
                </div>
                <div className="mt-5 inline-flex items-baseline gap-2 bg-white/20 rounded-2xl px-4 py-2">
                  <span className="text-sm text-teal-100">Consultation fee</span>
                  <span className="text-3xl font-bold">₹{fee}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <CalendarDays className="w-4 h-4 text-teal-600" />
                Date
              </label>
              <input
                type="date"
                name="date"
                min={minDate}
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Reason for visit
              </label>
              <textarea
                name="problem"
                placeholder="Symptoms, duration, or questions for the doctor..."
                value={formData.problem}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Clock className="w-4 h-4 text-teal-600" />
                Available slots
              </label>
              {!formData.date ? (
                <p className="text-sm text-slate-500">Pick a date first.</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-amber-600">
                  No slots loaded—ensure you are logged in. Try another date.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slots.map(({ startTime, status }) => {
                    const disabled = status === "booked";
                    const active = selectedSlot === startTime;
                    return (
                      <button
                        key={startTime}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setSelectedSlot(startTime)}
                        className={`rounded-xl py-3 px-2 text-sm font-medium border transition-all ${
                          disabled
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : active
                              ? "bg-teal-600 text-white border-teal-600 shadow-md scale-[1.02]"
                              : "bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-teal-50"
                        }`}
                      >
                        {status === "mine" ? `${startTime} (yours)` : startTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={bookingLoading}
                className={`flex-1 rounded-xl py-4 text-white font-semibold text-lg shadow-lg transition-all ${
                  bookingLoading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95"
                }`}
              >
                {bookingLoading ? "Booking…" : "Confirm & continue to payment"}
              </button>
              <Link
                to={`/doctors-page/${doctor._id}`}
                className="sm:w-auto text-center rounded-xl border-2 border-slate-200 py-4 px-6 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Full profile
              </Link>
            </div>
          </form>
        </div>
      </div>

      <PaymentModal
        isOpen={paymentOpen}
        appointmentId={bookedAppointmentId}
        amount={fee}
        doctorName={doctor.fullname}
        onSuccess={() => {
          setPaymentOpen(false);
          goDashboard();
        }}
        onClose={() => {
          setPaymentOpen(false);
          goDashboard();
        }}
      />
    </div>
  );
};

export default Consult;
