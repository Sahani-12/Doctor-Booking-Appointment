const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "doctor" },
    phone: String,
    gender: String,
    DOB: String,
    age: Number,
    experience: String,
    description: String,
    licenseNumber: String,
    specialization: [{ type: String }],
    subspecialization: [{ type: String }],
    degrees: [{ type: String }],
    certification: [{ type: String }],
    educationHistory: [{ type: String }],
    fee: Number,
    emergencyFee: Number,
    location: String,
    city: String,
    profileImage: String,
    languagesSpoken: [{ type: String }],
    stories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
    rating: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true }, // Admin approval status
    isVerified: { type: Boolean, default: false }, // Email/document verification
  },
  { timestamps: true },
);

// Add index for better query performance
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ city: 1 });
doctorSchema.index({ email: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
