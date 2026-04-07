// Doctor Service Layer
// Place this file in backend: src/services/doctorService.js

const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

/**
 * Search doctors with advanced filters
 */
const searchDoctors = async (filters = {}, page = 1, limit = 15) => {
  const skip = (page - 1) * limit;
  const mongoFilters = buildDoctorFilters(filters);

  const total = await Doctor.countDocuments(mongoFilters);
  const doctors = await Doctor.find(mongoFilters)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    doctors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Build MongoDB filter from search parameters
 */
const buildDoctorFilters = (filters) => {
  const mongoFilters = {};

  if (filters.search) {
    mongoFilters.$or = [
      { fullname: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { specialization: { $in: [new RegExp(filters.search, "i")] } },
    ];
  }

  if (filters.city) {
    mongoFilters.city = { $regex: filters.city, $options: "i" };
  }

  if (filters.specialization) {
    mongoFilters.specialization = {
      $in: [new RegExp(filters.specialization, "i")],
    };
  }

  if (filters.language) {
    mongoFilters.languagesSpoken = {
      $in: [new RegExp(filters.language, "i")],
    };
  }

  if (filters.minFee || filters.maxFee) {
    mongoFilters.fee = {};
    if (filters.minFee) mongoFilters.fee.$gte = Number(filters.minFee);
    if (filters.maxFee) mongoFilters.fee.$lte = Number(filters.maxFee);
  }

  if (filters.isApproved !== undefined) {
    mongoFilters.isApproved = filters.isApproved;
  }

  return mongoFilters;
};

/**
 * Get doctor profile with statistics
 */
const getDoctorProfileWithStats = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId)
    .select("-password")
    .populate("stories");

  if (!doctor) return null;

  // Get appointment statistics
  const appointmentStats = await Appointment.aggregate([
    { $match: { doctor: doctor._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get average rating
  const ratings = await Appointment.find({
    doctor: doctor._id,
    rating: { $exists: true, $ne: null },
  }).select("rating");

  const avgRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, a) => sum + a.rating, 0) / ratings.length
        ).toFixed(1)
      : 0;

  return {
    ...doctor.toObject(),
    stats: {
      totalAppointments: appointmentStats.reduce((sum, s) => sum + s.count, 0),
      appointmentsByStatus: appointmentStats,
      averageRating: avgRating,
      totalReviews: ratings.length,
    },
  };
};

/**
 * Get doctor's schedule for the week
 */
const getDoctorWeeklySchedule = async (doctorId, startDate) => {
  const weekStart = new Date(startDate);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const appointments = await Appointment.find({
    doctor: doctorId,
    date: { $gte: weekStart, $lt: weekEnd },
    status: { $in: ["pending", "accepted"] },
  })
    .populate("patient", "fullname phone")
    .sort({ date: 1, slot: 1 });

  // Group by date
  const schedule = {};
  appointments.forEach((appt) => {
    const dateKey = appt.date.toISOString().split("T")[0];
    if (!schedule[dateKey]) {
      schedule[dateKey] = [];
    }
    schedule[dateKey].push(appt);
  });

  return schedule;
};

module.exports = {
  searchDoctors,
  buildDoctorFilters,
  getDoctorProfileWithStats,
  getDoctorWeeklySchedule,
};
