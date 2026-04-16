const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, default: "" },
    frequency: { type: String, default: "" },
    duration: { type: String, default: "" },
    instructions: { type: String, default: "" },
  },
  { _id: false },
);

const medicalRecordSchema = new mongoose.Schema(
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
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    admission: { type: mongoose.Schema.Types.ObjectId, ref: "Admission" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    visitType: {
      type: String,
      enum: ["opd", "ipd", "emergency", "follow-up", "teleconsult"],
      default: "opd",
    },
    chiefComplaint: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    symptoms: [{ type: String }],
    allergies: [{ type: String }],
    vitals: {
      bloodPressure: { type: String, default: "" },
      pulse: { type: String, default: "" },
      temperature: { type: String, default: "" },
      oxygenSaturation: { type: String, default: "" },
      weight: { type: String, default: "" },
      height: { type: String, default: "" },
      bmi: { type: String, default: "" },
    },
    medications: [medicationSchema],
    treatmentPlan: { type: String, default: "" },
    notes: { type: String, default: "" },
    followUpDate: { type: Date },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "under-observation", "closed"],
      default: "open",
    },
  },
  { timestamps: true },
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
