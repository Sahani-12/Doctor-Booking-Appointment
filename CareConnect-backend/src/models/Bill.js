const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    category: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false },
);

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true, trim: true },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    admission: { type: mongoose.Schema.Types.ObjectId, ref: "Admission" },
    lineItems: [billItemSchema],
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "pending", "partially-paid", "paid", "cancelled"],
      default: "pending",
    },
    dueDate: { type: Date },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
    paymentMethod: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

billSchema.index({ patient: 1, issuedAt: -1 });
billSchema.index({ status: 1 });

module.exports = mongoose.model("Bill", billSchema);
