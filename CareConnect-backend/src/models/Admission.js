const mongoose = require("mongoose");

const admissionNoteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const admissionSchema = new mongoose.Schema(
  {
    admissionNumber: { type: String, required: true, unique: true, trim: true },
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    reason: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    roomNumber: { type: String, default: "" },
    bedNumber: { type: String, default: "" },
    wardType: {
      type: String,
      enum: ["general", "semi-private", "private", "icu"],
      default: "general",
    },
    admissionDate: { type: Date, default: Date.now },
    expectedDischargeDate: { type: Date },
    actualDischargeDate: { type: Date },
    status: {
      type: String,
      enum: ["admitted", "under-treatment", "ready-for-discharge", "discharged"],
      default: "admitted",
    },
    priority: {
      type: String,
      enum: ["routine", "urgent", "critical"],
      default: "routine",
    },
    treatmentPlan: { type: String, default: "" },
    notes: [admissionNoteSchema],
  },
  { timestamps: true },
);

admissionSchema.index({ patient: 1, admissionDate: -1 });
admissionSchema.index({ doctor: 1, admissionDate: -1 });
admissionSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model("Admission", admissionSchema);
