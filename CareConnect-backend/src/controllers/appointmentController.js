const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const {
  generateDailySlots,
  calculatePagination,
} = require("../utils/response");
const { validateFutureDate, validateTimeSlot } = require("../utils/validators");
const { emailTemplates, sendEmail } = require("../utils/email");

const toStartOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const toEndOfDay = (date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const transformAppointment = (appt) => {
  const obj = appt.toObject ? appt.toObject() : appt;

  return {
    ...obj,
    patientId: obj.patient?._id?.toString() || obj.patient?.toString(),
    patientName: obj.patient?.fullname,
    patientEmail: obj.patient?.email,
    patientPhone: obj.patient?.phone,
    appointmentDate: obj.date,
    appointmentTime: obj.slot,
    reason: obj.notes,
    submissionDate: obj.createdAt,
    time: obj.slot,
    doctorName: obj.doctor?.fullname,
    visitedFor: obj.notes,
  };
};

const getDoctorFilterId = async (user) => {
  if (user.role !== "doctor") return user._id;

  const doctorById = await Doctor.findById(user._id).select("_id");
  if (doctorById) return doctorById._id;

  const doctorByEmail = user.email
    ? await Doctor.findOne({ email: user.email }).select("_id")
    : null;

  return doctorByEmail?._id || user._id;
};

// @desc Create appointment
// @route POST /api/appointments
const createAppointment = asyncHandler(async (req, res) => {
  const doctorId =
    req.body.doctorId ||
    req.body.doctor?._id ||
    req.body.doctor?.id ||
    req.body.doctor ||
    req.body.doctor_id;
  const date = req.body.date || req.body.appointmentDate;
  const notes = req.body.notes || req.body.reason || req.body.visitedFor;
  const slot =
    req.body.slot || req.body.startTime || req.body.appointmentTime;

  // Validate input
  if (!doctorId || !date || !slot) {
    res.status(400);
    throw new Error("doctorId, date, and slot (or startTime) are required");
  }

  // Validate date is future date
  if (!validateFutureDate(date)) {
    res.status(400);
    throw new Error("Please select a future date");
  }

  // Validate slot format
  if (!validateTimeSlot(slot)) {
    res.status(400);
    throw new Error("Invalid slot format (use HH:MM)");
  }

  // Check if doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const appointmentDate = toStartOfDay(date);
  const endOfDay = toEndOfDay(date);

  // Check if slot is already booked
  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    date: { $gte: appointmentDate, $lte: endOfDay },
    slot,
    status: { $in: ["pending", "confirmed"] },
  });

  if (existingAppointment) {
    res.status(400);
    throw new Error("This slot is already booked. Please select another slot.");
  }

  const created = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    date: appointmentDate,
    slot,
    notes,
  });

  console.log("✅ Appointment created:");
  console.log("   Patient:", req.user._id);
  console.log("   Doctor:", doctorId);
  console.log("   Date:", date);
  console.log("   Slot:", slot);

  const appointment = await Appointment.findById(created._id)
    .populate("doctor", "fullname email city")
    .populate("patient", "fullname email phone");

  // Send confirmation email template (mock)
  const emailData = emailTemplates.appointmentBooked(
    req.user.fullname,
    doctor.fullname,
    new Date(date).toLocaleDateString(),
    slot,
  );
  await sendEmail(req.user.email, emailData);

  res.status(201).json({
    success: true,
    message: "Appointment created successfully",
    data: transformAppointment(appointment),
    appointmentId: appointment._id,
  });
});

// @desc Get user appointments (patient or doctor view)
// @route GET /api/appointments/my
const getMyAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );
  const { status } = req.query;

  // Debugging
  console.log("🔍 getMyAppointments called");
  console.log("   User ID:", req.user._id);
  console.log("   User Role:", req.user.role);
  console.log("   User Full:", req.user);

  // Build filter based on user role
  // If role is not set, check if it's a doctor or user by trying to match doctor collection
  let isDoctor = req.user.role === "doctor";
  const doctorFilterId = await getDoctorFilterId(req.user);

  // If role is determined to be doctor, build filter
  const filter = isDoctor
    ? { doctor: doctorFilterId }
    : { patient: req.user._id };

  console.log("   Is Doctor:", isDoctor);
  console.log("   Filter:", filter);

  // Filter by status if provided
  if (status) {
    filter.status = status;
  }

  // Count total
  const total = await Appointment.countDocuments(filter);
  console.log("   Total appointments found:", total);
  const totalPages = Math.ceil(total / limit);

  // Fetch appointments
  const appointments = await Appointment.find(filter)
    .populate("doctor", "fullname email city specialization fee")
    .populate("patient", "fullname email phone city age gender DOB image")
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  console.log("   Appointments returned:", appointments.length);

  // Transform for frontend compatibility
  const transformed = appointments.map(transformAppointment);

  res.json({
    success: true,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    data: transformed,
  });
});

// @desc Get available slots for a doctor on a specific date
// @route GET /api/appointments/slots/:doctorId/:date
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.params;

  if (!doctorId || !date) {
    res.status(400);
    throw new Error("doctorId and date are required");
  }

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  // Generate available slots
  const slots = generateDailySlots();
  const appointmentDate = new Date(date);
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Find booked appointments for this doctor on this date
  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["pending", "confirmed"] },
  });

  // Map slots to availability
  const slotMap = new Map(bookedAppointments.map((a) => [a.slot, a]));

  const availableSlots = slots.map((slot) => {
    const booking = slotMap.get(slot);
    if (!booking) {
      return { startTime: slot, status: "available" };
    }
    // Check if it's the current user's appointment
    const isMine = req.user._id.toString() === booking.patient.toString();
    return {
      startTime: slot,
      status: isMine ? "mine" : "booked",
    };
  });

  res.json({
    success: true,
    data: {
      doctorId,
      date,
      slots: availableSlots,
    },
  });
});

// @desc Update appointment status
// @route PUT /api/appointments/:id/status
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (
    !status ||
    !["pending", "confirmed", "completed", "cancelled"].includes(status)
  ) {
    res.status(400);
    throw new Error(
      "Invalid status. Must be: pending, confirmed, completed, or cancelled",
    );
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const doctorFilterId = await getDoctorFilterId(req.user);
  const isDoctorOwner =
    req.user.role === "doctor" &&
    doctorFilterId.toString() === appointment.doctor.toString();

  // Authorization: only doctor or patient or admin can update
  if (
    req.user.role !== "admin" &&
    !isDoctorOwner &&
    req.user._id.toString() !== appointment.patient.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to update this appointment");
  }

  // Update status
  const oldStatus = appointment.status;
  appointment.status = status;
  await appointment.save();

  // Populate for response
  await appointment.populate("doctor", "fullname email");
  await appointment.populate("patient", "fullname email");

  // Send email notifications based on status change
  if (oldStatus !== status) {
    if (status === "cancelled") {
      const emailData = emailTemplates.appointmentCancelled(
        appointment.patient.fullname,
        appointment.doctor.fullname,
        appointment.date.toLocaleDateString(),
      );
      await sendEmail(appointment.patient.email, emailData);
    }
  }

  res.json({
    success: true,
    message: "Appointment status updated successfully",
    data: appointment,
  });
});

// @desc Cancel appointment
// @route POST /api/appointments/:id/cancel
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Check authorization
  if (
    req.user._id.toString() !== appointment.patient.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to cancel this appointment");
  }

  // Check if appointment can be cancelled
  const appointmentDate = new Date(appointment.date);
  const now = new Date();
  const hoursDifference = (appointmentDate - now) / (1000 * 60 * 60);

  if (hoursDifference < 24 && hoursDifference > 0) {
    res.status(400);
    throw new Error(
      "Cannot cancel appointment within 24 hours of appointment time",
    );
  }

  appointment.status = "cancelled";
  await appointment.save();

  // Populate and send email
  await appointment.populate("doctor", "fullname email");
  await appointment.populate("patient", "fullname email");

  const emailData = emailTemplates.appointmentCancelled(
    appointment.patient.fullname,
    appointment.doctor.fullname,
    appointment.date.toLocaleDateString(),
  );
  await sendEmail(appointment.patient.email, emailData);

  res.json({
    success: true,
    message: "Appointment cancelled successfully",
    data: appointment,
  });
});

// @desc Get appointment statistics
// @route GET /api/appointments/stats
const getAppointmentStats = asyncHandler(async (req, res) => {
  const total = await Appointment.countDocuments();
  const byStatus = await Appointment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const thisMonth = new Date();
  thisMonth.setMonth(thisMonth.getMonth() - 1);

  const thisMonthCount = await Appointment.countDocuments({
    createdAt: { $gte: thisMonth },
  });

  res.json({
    success: true,
    data: {
      totalAppointments: total,
      thisMonth: thisMonthCount,
      byStatus,
    },
  });
});

module.exports = {
  createAppointment,
  getMyAppointments,
  getAvailableSlots,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentStats,
};
