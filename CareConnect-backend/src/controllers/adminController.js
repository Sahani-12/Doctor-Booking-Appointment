const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Document = require("../models/Document");
const Transaction = require("../models/Transaction");
const Settings = require("../models/Settings");
const Department = require("../models/Department");
const Admission = require("../models/Admission");
const LabOrder = require("../models/LabOrder");
const Bill = require("../models/Bill");
const MedicalRecord = require("../models/MedicalRecord");
const { calculatePagination } = require("../utils/response");

// @desc Get all users
// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );

  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { fullname: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const users = await User.find(filter)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: users,
  });
});

// @desc Get all doctors
// @route GET /api/admin/doctors
const getAllDoctorsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );

  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { fullname: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const total = await Doctor.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const doctors = await Doctor.find(filter)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: doctors,
  });
});

// @desc Get all appointments
// @route GET /api/admin/appointments
const getAllAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await Appointment.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const appointments = await Appointment.find(filter)
    .populate("patient", "fullname email city")
    .populate("doctor", "fullname email specialization")
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: appointments,
  });
});

// @desc Update user status/role
// @route PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { fullname, phone, city, role, status, isVerified } = req.body;

  const updateData = {};
  if (fullname !== undefined) updateData.fullname = fullname;
  if (phone !== undefined) updateData.phone = phone;
  if (city !== undefined) updateData.city = city;
  if (isVerified !== undefined) updateData.isVerified = isVerified;
  if (role !== undefined && role !== "user") {
    res.status(400);
    throw new Error("Cannot change user role through this endpoint");
  }

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// @desc Update doctor approval status
// @route PUT /api/admin/doctors/:id/approve
const approveDoctor = asyncHandler(async (req, res) => {
  let { isApproved } = req.body;

  if (typeof isApproved !== "boolean" && typeof req.body.status === "string") {
    if (req.body.status === "approved") isApproved = true;
    if (req.body.status === "rejected") isApproved = false;
  }

  if (typeof isApproved !== "boolean") {
    res.status(400);
    throw new Error("isApproved must be true or false");
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isApproved },
    { new: true },
  ).select("-password");

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.json({
    success: true,
    message: `Doctor ${isApproved ? "approved" : "rejected"} successfully`,
    data: doctor,
  });
});

// @desc Delete user
// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Also delete user's appointments and documents
  await Appointment.deleteMany({ patient: req.params.id });
  await Document.deleteMany({ user: req.params.id });
  await Admission.deleteMany({ patient: req.params.id });
  await LabOrder.deleteMany({ patient: req.params.id });
  await Bill.deleteMany({ patient: req.params.id });
  await MedicalRecord.deleteMany({ patient: req.params.id });

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc Delete doctor
// @route DELETE /api/admin/doctors/:id
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  // Also delete doctor's appointments
  await Appointment.deleteMany({ doctor: req.params.id });
  await Admission.deleteMany({ doctor: req.params.id });
  await LabOrder.deleteMany({ doctor: req.params.id });
  await Bill.deleteMany({ doctor: req.params.id });
  await MedicalRecord.deleteMany({ doctor: req.params.id });
  await Department.updateMany(
    { headDoctor: req.params.id },
    { $unset: { headDoctor: "" } },
  );

  res.json({
    success: true,
    message: "Doctor deleted successfully",
  });
});

// @desc Get admin dashboard statistics
// @route GET /api/admin/stats
const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const totalAppointments = await Appointment.countDocuments();

  const appointmentsByStatus = await Appointment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const thisMonthAppointments = await Appointment.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setDate(1)),
    },
  });

  const revenueData = await Appointment.aggregate([
    {
      $match: { status: "completed" },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctorInfo",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $arrayElemAt: ["$doctorInfo.fee", 0] } },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalDoctors,
      totalAppointments,
      thisMonthAppointments,
      appointmentsByStatus,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
    },
  });
});

// @desc Get users by date range
// @route GET /api/admin/users/analytics/report
const getUsersAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const users = await User.countDocuments(filter);
  const doctors = await Doctor.countDocuments(filter);

  res.json({
    success: true,
    data: {
      period: { startDate, endDate },
      newUsers: users,
      newDoctors: doctors,
    },
  });
});

// @desc Get pending doctor approvals
// @route GET /api/admin/doctors/pending
const getPendingDoctors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );

  const filter = { isApproved: false };

  const total = await Doctor.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const doctors = await Doctor.find(filter)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: doctors,
  });
});

// @desc Get dashboard statistics
// @route GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const pendingDoctors = await Doctor.countDocuments({ isApproved: false });
  const totalAppointments = await Appointment.countDocuments();
  const departments = await Department.countDocuments();
  const activeAdmissions = await Admission.countDocuments({
    status: { $in: ["admitted", "under-treatment", "ready-for-discharge"] },
  });
  const pendingLabOrders = await LabOrder.countDocuments({
    status: { $in: ["ordered", "sample-collected", "processing"] },
  });

  const revenueData = await Transaction.aggregate([
    {
      $match: { status: "completed" },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  const billingData = await Bill.aggregate([
    {
      $group: {
        _id: null,
        grossBilling: { $sum: "$totalAmount" },
        pendingCollections: { $sum: "$balanceDue" },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalDoctors,
      pendingDoctors,
      totalAppointments,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      departments,
      activeAdmissions,
      pendingLabOrders,
      grossBilling: billingData[0]?.grossBilling || 0,
      pendingCollections: billingData[0]?.pendingCollections || 0,
    },
  });
});

// @desc Get all payments/transactions
// @route GET /api/admin/payments
const getPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const total = await Transaction.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  const payments = await Transaction.find(filter)
    .populate("appointment", "patient doctor")
    .populate({
      path: "appointment",
      populate: [
        { path: "patient", select: "fullname email" },
        { path: "doctor", select: "fullname email" },
      ],
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    pagination: { page, limit, total, totalPages },
    data: payments,
  });
});

// @desc Get app settings
// @route GET /api/admin/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  res.json({
    success: true,
    data: settings,
  });
});

// @desc Update app settings
// @route POST /api/admin/settings
const updateSettings = asyncHandler(async (req, res) => {
  const {
    appName,
    supportEmail,
    supportPhone,
    maintenanceMode,
    maintenanceMessage,
  } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings();
  }

  if (appName !== undefined) settings.appName = appName;
  if (supportEmail !== undefined) settings.supportEmail = supportEmail;
  if (supportPhone !== undefined) settings.supportPhone = supportPhone;
  if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
  if (maintenanceMessage !== undefined)
    settings.maintenanceMessage = maintenanceMessage;
  settings.updatedBy = req.user._id;

  await settings.save();

  res.json({
    success: true,
    message: "Settings updated successfully",
    data: settings,
  });
});

module.exports = {
  getAllUsers,
  getAllDoctorsAdmin,
  getAllAppointments,
  updateUser,
  approveDoctor,
  deleteUser,
  deleteDoctor,
  getAdminStats,
  getUsersAnalytics,
  getPendingDoctors,
  getDashboard,
  getPayments,
  getSettings,
  updateSettings,
};
