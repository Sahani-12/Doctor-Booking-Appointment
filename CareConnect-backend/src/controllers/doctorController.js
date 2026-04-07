const asyncHandler = require("express-async-handler");
const Doctor = require("../models/Doctor");
const { calculatePagination } = require("../utils/response");

// @desc Get all doctors with search, filter, and pagination
// @route GET /api/doctors
const getAllDoctors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = calculatePagination(
    req.query.page,
    req.query.limit,
  );

  // Build filter object
  const filter = {};

  // Search by name, description, or specialization
  if (req.query.search) {
    filter.$or = [
      { fullname: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
      { specialization: { $in: [new RegExp(req.query.search, "i")] } },
    ];
  }

  // Filter by city
  if (req.query.city) {
    filter.city = { $regex: req.query.city, $options: "i" };
  }

  // Filter by specialization
  if (req.query.specialization) {
    filter.specialization = {
      $in: [new RegExp(req.query.specialization, "i")],
    };
  }

  // Filter by language
  if (req.query.language) {
    filter.languagesSpoken = { $in: [new RegExp(req.query.language, "i")] };
  }

  // Filter by fee range
  if (req.query.minFee || req.query.maxFee) {
    filter.fee = {};
    if (req.query.minFee) filter.fee.$gte = Number(req.query.minFee);
    if (req.query.maxFee) filter.fee.$lte = Number(req.query.maxFee);
  }

  // Filter by experience
  if (req.query.experience) {
    filter.experience = { $regex: req.query.experience, $options: "i" };
  }

  // Count total documents
  const total = await Doctor.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  // Fetch doctors
  const doctors = await Doctor.find(filter)
    .select("-password") // Don't send password
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    data: doctors,
  });
});

// @desc Get single doctor by ID
// @route GET /api/doctors/:id
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .select("-password")
    .populate("stories");

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.json({
    success: true,
    data: doctor,
  });
});

// @desc Get doctor profile (authenticated doctor)
// @route GET /api/doctors/profile
const getDoctorProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== "doctor") {
    res.status(403);
    throw new Error("This endpoint is for doctors only");
  }

  const doctor = await Doctor.findById(req.user._id)
    .select("-password")
    .populate("stories");

  res.json({
    success: true,
    data: doctor,
  });
});

// @desc Update doctor profile
// @route PUT /api/doctors/profile
const updateDoctorProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== "doctor") {
    res.status(403);
    throw new Error("This endpoint is for doctors only");
  }

  const {
    fullname,
    phone,
    gender,
    DOB,
    age,
    experience,
    description,
    specialization,
    subspecialization,
    degrees,
    certification,
    educationHistory,
    fee,
    emergencyFee,
    location,
    city,
    profileImage,
    languagesSpoken,
    licenseNumber,
  } = req.body;

  // Build update object (only include provided fields)
  const updateData = {};
  const unsetFields = {};
  if (fullname !== undefined) updateData.fullname = fullname;
  if (phone !== undefined) updateData.phone = phone;
  if (gender !== undefined) updateData.gender = gender;
  if (DOB !== undefined) updateData.DOB = DOB;
  if (age !== undefined) {
    if (age === "" || age === null) {
      unsetFields.age = "";
    } else {
      updateData.age = Number(age);
    }
  }
  if (experience !== undefined) updateData.experience = experience;
  if (description !== undefined) updateData.description = description;
  if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
  const toStringArray = (val) => {
    if (val === null || val === undefined) return [];
    if (Array.isArray(val))
      return val
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean);
    return String(val)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  if (specialization !== undefined) {
    updateData.specialization = toStringArray(specialization);
  }
  if (subspecialization !== undefined) {
    updateData.subspecialization = toStringArray(subspecialization);
  }
  if (degrees !== undefined) {
    updateData.degrees = toStringArray(degrees);
  }
  if (certification !== undefined) {
    updateData.certification = toStringArray(certification);
  }
  if (educationHistory !== undefined) {
    updateData.educationHistory = toStringArray(educationHistory);
  }
  if (fee !== undefined) updateData.fee = fee;
  if (emergencyFee !== undefined) updateData.emergencyFee = emergencyFee;
  if (location !== undefined) updateData.location = location;
  if (city !== undefined) updateData.city = city;
  if (profileImage !== undefined) updateData.profileImage = profileImage;
  if (languagesSpoken !== undefined) {
    updateData.languagesSpoken = toStringArray(languagesSpoken);
  }

  let updatePayload = updateData;
  if (Object.keys(unsetFields).length > 0) {
    updatePayload = {};
    if (Object.keys(updateData).length > 0) updatePayload.$set = updateData;
    updatePayload.$unset = unsetFields;
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.user._id,
    updatePayload,
    { new: true, runValidators: true },
  ).select("-password");

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: updatedDoctor,
  });
});

// @desc Get doctor statistics
// @route GET /api/doctors/stats
const getDoctorStats = asyncHandler(async (req, res) => {
  const total = await Doctor.countDocuments();
  const bySpecialization = await Doctor.aggregate([
    {
      $group: {
        _id: "$specialization",
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalDoctors: total,
      bySpecialization,
    },
  });
});

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorStats,
};
