const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    floor: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    email: { type: String, default: "" },
    operatingHours: {
      weekdays: { type: String, default: "08:00 - 20:00" },
      weekends: { type: String, default: "09:00 - 17:00" },
    },
    services: [{ type: String }],
    facilities: [{ type: String }],
    headDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    bedCapacity: { type: Number, default: 0 },
    wardCount: { type: Number, default: 0 },
    color: { type: String, default: "#0f766e" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });

module.exports = mongoose.model("Department", departmentSchema);
