const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ordered", "sample-collected", "processing", "completed"],
      default: "ordered",
    },
    result: { type: String, default: "" },
    unit: { type: String, default: "" },
    referenceRange: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { _id: false },
);

const labOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    admission: { type: mongoose.Schema.Types.ObjectId, ref: "Admission" },
    priority: {
      type: String,
      enum: ["routine", "urgent", "stat"],
      default: "routine",
    },
    status: {
      type: String,
      enum: [
        "ordered",
        "sample-collected",
        "processing",
        "completed",
        "cancelled",
      ],
      default: "ordered",
    },
    tests: [labTestSchema],
    clinicalNotes: { type: String, default: "" },
    orderedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

labOrderSchema.index({ patient: 1, orderedAt: -1 });
labOrderSchema.index({ doctor: 1, orderedAt: -1 });
labOrderSchema.index({ status: 1 });

module.exports = mongoose.model("LabOrder", labOrderSchema);
