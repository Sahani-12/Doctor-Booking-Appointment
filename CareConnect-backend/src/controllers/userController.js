const asyncHandler = require("express-async-handler");
const multer = require("multer");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Document = require("../models/Document");

// @desc Get user profile
// @route GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

// @desc Get user by ID
// @route GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  let user = await User.findById(req.params.id).select("-password");

  if (!user) {
    // Check if it's a doctor ID
    user = await Doctor.findById(req.params.id).select("-password");
  }

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc Update user profile
// @route PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("This endpoint is for patients only");
  }

  const {
    fullname,
    phone,
    city,
    DOB,
    age,
    gender,
    image,
    avatar,
  } = req.body;

  const imageVal = image !== undefined ? image : avatar;

  const updateData = {};
  const unsetFields = {};
  if (fullname !== undefined) updateData.fullname = fullname;
  if (phone !== undefined) updateData.phone = phone;
  if (city !== undefined) updateData.city = city;
  if (DOB !== undefined) updateData.DOB = DOB;
  if (age !== undefined) {
    if (age === "" || age === null) {
      unsetFields.age = "";
    } else {
      updateData.age = Number(age);
    }
  }
  if (gender !== undefined) updateData.gender = gender;
  if (imageVal !== undefined) updateData.image = imageVal;

  let updatePayload = updateData;
  if (Object.keys(unsetFields).length > 0) {
    updatePayload = {};
    if (Object.keys(updateData).length > 0) updatePayload.$set = updateData;
    updatePayload.$unset = unsetFields;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updatePayload,
    {
      new: true,
      runValidators: true,
    },
  ).select("-password");

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// @desc Get user appointments
// @route GET /api/users/appointments
const getUserAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({
    patient: req.user._id,
  })
    .populate("doctor", "fullname email city specialization")
    .sort({ date: -1 });

  res.json({
    success: true,
    data: appointments,
  });
});

// @desc Get user documents
// @route GET /api/users/documents
const getUserDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ user: req.user._id })
    .populate("user", "fullname")
    .sort({ createdAt: -1 });

  // Transform for frontend compatibility
  const mapped = documents.map((d) => {
    const obj = d.toObject();
    obj.file = obj.fileUrl;
    obj.author = obj.user;
    delete obj.user;
    return obj;
  });

  res.json({
    success: true,
    data: mapped,
  });
});

// @desc Get documents by user ID
// @route GET /api/users/:userId/documents
const getDocumentsByUserId = asyncHandler(async (req, res) => {
  const documents = await Document.find({ user: req.params.userId })
    .populate("user", "fullname")
    .sort({ createdAt: -1 });

  const mapped = documents.map((d) => {
    const obj = d.toObject();
    obj.file = obj.fileUrl;
    obj.author = obj.user;
    delete obj.user;
    return obj;
  });

  res.json({
    success: true,
    data: mapped,
  });
});

// @desc Upload document
// @route POST /api/users/documents/upload
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("File is required");
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/${req.file.path}`;
  const document = await Document.create({
    user: req.user._id,
    fileUrl,
    filename: req.file.originalname,
    message: req.body.message || "",
  });

  // Transform response
  const obj = document.toObject();
  obj.file = obj.fileUrl;

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    data: obj,
  });
});

// @desc Delete document
// @route DELETE /api/users/documents/:id
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error("Document not found");
  }

  // Check authorization
  if (document.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this document");
  }

  await Document.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Document deleted successfully",
  });
});

// @desc Get user dashboard data (appointments + profile)
// @route GET /api/users/dashboard/overview
const getDashboardOverview = asyncHandler(async (req, res) => {
  const user = req.user;

  const appointmentStats = await Appointment.aggregate([
    {
      $match:
        req.user.role === "doctor"
          ? { doctor: req.user._id }
          : { patient: req.user._id },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const upcomingAppointments = await Appointment.find(
    req.user.role === "doctor"
      ? { doctor: req.user._id, date: { $gte: new Date() } }
      : { patient: req.user._id, date: { $gte: new Date() } },
  )
    .populate(
      req.user.role === "doctor" ? "patient" : "doctor",
      "fullname email city",
    )
    .limit(5)
    .sort({ date: 1 });

  res.json({
    success: true,
    data: {
      user,
      appointmentStats,
      upcomingAppointments,
    },
  });
});

module.exports = {
  getUserProfile,
  getUserById,
  updateUserProfile,
  getUserAppointments,
  getUserDocuments,
  getDocumentsByUserId,
  uploadDocument,
  deleteDocument,
  getDashboardOverview,
};
