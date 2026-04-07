const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    phone: String,
    city: String,
    DOB: String,
    image: String,
    age: Number,
    gender: String,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ city: 1 });

module.exports = mongoose.model("User", userSchema);
