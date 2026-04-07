// Backend: src/controllers/paymentController.js
const paymentService = require("../services/paymentService");
const Transaction = require("../models/Transaction");
const Appointment = require("../models/Appointment");

// Create Stripe payment intent
exports.createStripePayment = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!appointmentId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Get appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Create payment intent
    const result = await paymentService.createStripePaymentIntent(
      appointmentId,
      userId,
      appointment.doctor,
      amount,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm Stripe payment
exports.confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, transactionId } = req.body;

    const result = await paymentService.confirmStripePayment(
      paymentIntentId,
      transactionId,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create RazorPay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    const userId = req.user.id;

    if (!appointmentId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    const result = await paymentService.createRazorpayOrder(
      appointmentId,
      userId,
      appointment.doctor,
      amount,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("RazorPay order creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify RazorPay payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      transactionId,
    } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment verification data" });
    }

    const result = await paymentService.verifyRazorpayPayment(
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      transactionId,
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("RazorPay verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;

    if (!transactionId) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction ID required" });
    }

    const result = await paymentService.processRefund(
      transactionId,
      reason || "Patient requested",
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Refund processing error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const result = await paymentService.getUserTransactions(
      userId,
      parseInt(page),
      parseInt(limit),
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get receipt
exports.getReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const result = await paymentService.generateReceipt(transactionId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Receipt generation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Payment analytics
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await paymentService.getPaymentAnalytics(start, end);

    res.status(200).json(result);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Demo payment — no Stripe/Razorpay keys (marks appointment paid for UI/testing)
exports.demoCompletePayment = async (req, res) => {
  try {
    const { appointmentId, amount } = req.body;
    const userId = req.user._id;

    if (!appointmentId || amount == null) {
      return res.status(400).json({
        success: false,
        message: "appointmentId and amount are required",
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (appointment.patient.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const numAmount = Number(amount);
    if (Number.isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const transaction = await Transaction.create({
      appointmentId,
      userId,
      doctorId: appointment.doctor,
      amount: numAmount,
      currency: "INR",
      paymentMethod: "wallet",
      gateway: "demo",
      status: "success",
      description: "Demo payment (no payment gateway configured)",
    });

    await Appointment.findByIdAndUpdate(appointmentId, {
      isPaid: true,
      paymentId: transaction._id,
    });

    res.status(200).json({
      success: true,
      message: "Demo payment recorded successfully",
      data: { transactionId: transaction._id },
    });
  } catch (error) {
    console.error("Demo payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, gateway } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (gateway) query.gateway = gateway;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "fullname email")
      .populate("doctorId", "fullname specialization")
      .populate("appointmentId", "date slot");

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Transaction fetch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
