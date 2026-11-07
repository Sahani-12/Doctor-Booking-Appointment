const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { validateEmail, validatePassword } = require("../utils/validators");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRES_IN || "7d",
  });
};

// @desc Register doctor
// @route POST /api/auth/register/doctor
const registerDoctor = asyncHandler(async (req, res) => {
  const {
    fullname,
    email,
    password,
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
  } = req.body;

  // Validation
  if (!fullname || !email || !password) {
    res.status(400);
    throw new Error("fullname, email, and password are required");
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Invalid email format");
  }

  if (!validatePassword(password)) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Check if doctor already exists
  const existing = await Doctor.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("Doctor email already registered");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create doctor
  const doctor = await Doctor.create({
    fullname,
    email,
    password: hashedPassword,
    phone,
    gender,
    DOB,
    age,
    experience,
    description,
    specialization: Array.isArray(specialization)
      ? specialization
      : specialization
        ? [specialization]
        : [],
    subspecialization: Array.isArray(subspecialization)
      ? subspecialization
      : subspecialization
        ? [subspecialization]
        : [],
    degrees: Array.isArray(degrees) ? degrees : degrees ? [degrees] : [],
    certification: Array.isArray(certification)
      ? certification
      : certification
        ? [certification]
        : [],
    educationHistory: Array.isArray(educationHistory)
      ? educationHistory
      : educationHistory
        ? [educationHistory]
        : [],
    fee,
    emergencyFee,
    location,
    city,
    profileImage,
    languagesSpoken: Array.isArray(languagesSpoken)
      ? languagesSpoken
      : languagesSpoken
        ? [languagesSpoken]
        : [],
  });

  res.status(201).json({
    success: true,
    message: "Doctor registered successfully",
    data: {
      user: {
        _id: doctor._id,
        id: doctor._id,
        fullname: doctor.fullname,
        email: doctor.email,
        role: doctor.role,
        city: doctor.city,
        profileImage: doctor.profileImage || "",
      },
      token: generateToken(doctor._id),
    },
  });
});

// @desc Register user/patient
// @route POST /api/auth/register/user
const registerUser = asyncHandler(async (req, res) => {
  const {
    fullname,
    email,
    password,
    phone,
    gender,
    age,
    city,
    DOB,
    location,
    image,
  } = req.body;

  // Validation
  if (!fullname || !email || !password) {
    res.status(400);
    throw new Error("fullname, email, and password are required");
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Invalid email format");
  }

  if (!validatePassword(password)) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("Email already registered");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
    phone,
    gender,
    age,
    city: city || location,
    DOB,
    image,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        _id: user._id,
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        city: user.city,
        DOB: user.DOB,
        image: user.image,
      },
      token: generateToken(user._id),
    },
  });
});

// @desc Login doctor/user
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const cleanEmail = email.trim();
  const emailRegex = new RegExp(
    `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i",
  );

  // Check in both collections (case-insensitive)
  const doctor = await Doctor.findOne({ email: emailRegex });
  const user = !doctor ? await User.findOne({ email: emailRegex }) : null;
  const account = doctor || user;

  if (!account) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, account.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const role = doctor ? "doctor" : account.role || "user";

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        _id: account._id,
        id: account._id,
        fullname: account.fullname,
        email: account.email,
        role: role,
        city: account.city,
        specialization: account.specialization,
        profileImage: account.profileImage || "",
      },
      token: generateToken(account._id),
    },
  });
});

// @desc Admin login
// @route POST /api/auth/admin-login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const cleanEmail = email.trim();
  const emailRegex = new RegExp(
    `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i",
  );

  // Find user with admin role (case-insensitive)
  let account = await User.findOne({ email: emailRegex, role: "admin" });
  let isDoctor = false;

  // If not found as explicit admin user, check if a registered doctor or staff is logging in
  if (!account) {
    const doctorAccount = await Doctor.findOne({ email: emailRegex });
    if (doctorAccount) {
      account = doctorAccount;
      isDoctor = true;
    } else {
      // Fallback check: check if any User has admin role by case-insensitive email
      const generalUser = await User.findOne({ email: emailRegex });
      if (generalUser && generalUser.role === "admin") {
        account = generalUser;
      }
    }
  }

  if (!account) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, account.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const role = isDoctor ? "doctor" : account.role || "admin";

  res.json({
    success: true,
    message: "Admin login successful",
    data: {
      admin: {
        _id: account._id,
        id: account._id,
        name: account.fullname,
        fullname: account.fullname,
        email: account.email,
        role: role,
      },
      user: {
        _id: account._id,
        id: account._id,
        name: account.fullname,
        fullname: account.fullname,
        email: account.email,
        role: role,
      },
      token: generateToken(account._id),
    },
  });
});

// @desc Get current authenticated user
// @route GET /api/auth/me
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: user,
  });
});

// @desc Logout (client-side - token removal)
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully. Please remove token from client.",
  });
});

// @desc Setup admin user (for initial setup only)
// @route POST /api/auth/setup-admin
const setupAdmin = asyncHandler(async (req, res) => {
  const { email, password, fullname, setupKey } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // Security check: Only allow if no admin exists yet OR if valid setupKey matches environment secret
  const existingAnyAdmin = await User.findOne({ role: "admin" });
  const configuredKey = process.env.ADMIN_SETUP_SECRET;

  if (existingAnyAdmin) {
    if (!configuredKey || setupKey !== configuredKey) {
      res.status(403);
      throw new Error("Admin user already initialized. Setup endpoint is locked.");
    }
  }

  // Check if this specific email is already registered
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "An account with this email already exists",
      data: { email, role: existing.role },
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create admin user
  const admin = await User.create({
    fullname: fullname || "Admin",
    email,
    password: hashedPassword,
    role: "admin",
    isVerified: true,
  });

  const token = generateToken(admin._id);

  res.status(201).json({
    success: true,
    message: "Admin setup successful",
    data: {
      token,
      admin: {
        id: admin._id,
        name: admin.fullname,
        email: admin.email,
        role: admin.role,
      },
    },
  });
});

module.exports = {
  registerDoctor,
  registerUser,
  login,
  adminLogin,
  getCurrentUser,
  logout,
  setupAdmin,
};
