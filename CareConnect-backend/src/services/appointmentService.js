const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const { generateDailySlots } = require("../utils/response");
const { emailTemplates, sendEmail } = require("../utils/email");

/**
 * Check if a slot is available for a doctor on a specific date
 */
const isSlotAvailable = async (doctorId, date, slot) => {
  const appointmentDate = new Date(date);
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    slot,
    status: { $in: ["pending", "confirmed"] },
  });

  return !existingAppointment;
};

/**
 * Get available slots for a doctor on a specific date
 */
const getAvailableSlotsForDate = async (doctorId, date, userId) => {
  const slots = generateDailySlots();
  const appointmentDate = new Date(date);
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["pending", "confirmed"] },
  });

  const slotMap = new Map(bookedAppointments.map((a) => [a.slot, a]));

  return slots.map((slot) => {
    const booking = slotMap.get(slot);
    if (!booking) {
      return { startTime: slot, status: "available" };
    }
    const isMine = userId && userId.toString() === booking.patient.toString();
    return { startTime: slot, status: isMine ? "mine" : "booked" };
  });
};

/**
 * Create appointment and send notifications
 */
const createAppointmentWithNotifications = async (
  appointmentData,
  userEmail,
  userName,
  doctorName,
) => {
  const appointment = await Appointment.create(appointmentData);

  const emailData = emailTemplates.appointmentBooked(
    userName,
    doctorName,
    new Date(appointmentData.date).toLocaleDateString(),
    appointmentData.slot,
  );

  await sendEmail(userEmail, emailData);
  return appointment;
};

/**
 * Get appointment statistics
 */
const getAppointmentStatistics = async (filter = {}) => {
  const total = await Appointment.countDocuments(filter);

  const byStatus = await Appointment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const thisMonth = new Date();
  thisMonth.setDate(1);

  const thisMonthCount = await Appointment.countDocuments({
    ...filter,
    createdAt: { $gte: thisMonth },
  });

  return {
    total,
    thisMonth: thisMonthCount,
    byStatus,
  };
};

/**
 * Calculate appointment duration (in hours)
 */
const getAppointmentDuration = (slot1, slot2) => {
  const [h1, m1] = slot1.split(":").map(Number);
  const [h2, m2] = slot2.split(":").map(Number);

  const time1 = h1 * 60 + m1;
  const time2 = h2 * 60 + m2;

  return Math.abs(time2 - time1) / 60;
};

module.exports = {
  isSlotAvailable,
  getAvailableSlotsForDate,
  createAppointmentWithNotifications,
  getAppointmentStatistics,
  getAppointmentDuration,
};
