// Backend: src/models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // Reference to appointment
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    // Reference to user/patient
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reference to doctor
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Payment amount
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Currency
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR"],
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "razorpay"],
      required: true,
    },

    // Payment gateway used ("demo" = simulated, no external keys)
    gateway: {
      type: String,
      enum: ["stripe", "razorpay", "demo"],
      required: true,
    },

    // Transaction status
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },

    // Stripe payment ID (if using Stripe)
    stripePaymentIntentId: String,
    stripeChargeId: String,

    // RazorPay payment ID (if using RazorPay)
    razorpayPaymentId: String,
    razorpayOrderId: String,
    razorpaySignature: String,

    // Refund information
    refund: {
      amount: Number,
      reason: String,
      status: {
        type: String,
        enum: ["none", "pending", "success", "failed"],
        default: "none",
      },
      refundId: String,
      processedAt: Date,
    },

    // Receipt information
    receipt: {
      number: String,
      url: String,
      issuedAt: Date,
    },

    // Full gateway response (for debugging)
    gatewayResponse: mongoose.Schema.Types.Mixed,

    // Error information
    errorMessage: String,

    // Metadata
    description: String,
    metadata: mongoose.Schema.Types.Mixed,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ appointmentId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ gateway: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
