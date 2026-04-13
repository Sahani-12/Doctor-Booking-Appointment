const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: { type: Date, required: true },
    slot: { type: String, required: true }, // Format: HH:MM
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "completed", "cancelled"],
    },
    notes: String, // Patient's reason for visit
    consultationType: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    rating: Number, // Doctor rating after completion
    feedback: String, // Patient feedback
    prescription: String, // Doctor's prescription/notes
    prescriptionFile: String, // URL to prescription document
    isPaid: { type: Boolean, default: false },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  { timestamps: true }
);

// Indexes for performance
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);