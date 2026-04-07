// Backend: src/services/paymentService.js
require("dotenv").config();
const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;
const Razorpay = require("razorpay");
const Transaction = require("../models/Transaction");
const Appointment = require("../models/Appointment");

// Initialize Razorpay only if keys are provided
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// =====================================================
// STRIPE PAYMENT PROCESSING
// =====================================================

class PaymentService {
  // Create Stripe payment intent
  async createStripePaymentIntent(appointmentId, userId, doctorId, amount) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "inr",
        payment_method_types: ["card"],
        metadata: {
          appointmentId,
          userId,
          doctorId,
        },
      });

      // Create transaction record
      const transaction = await Transaction.create({
        appointmentId,
        userId,
        doctorId,
        amount,
        currency: "INR",
        gateway: "stripe",
        status: "pending",
        paymentMethod: "card",
        stripePaymentIntentId: paymentIntent.id,
        description: `Consultation appointment with doctor`,
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transaction._id,
      };
    } catch (error) {
      console.error("Stripe error:", error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  // Confirm Stripe payment
  async confirmStripePayment(paymentIntentId, transactionId) {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === "succeeded") {
        // Update transaction
        const transaction = await Transaction.findByIdAndUpdate(
          transactionId,
          {
            status: "success",
            stripeChargeId: paymentIntent.charges.data[0].id,
            gatewayResponse: paymentIntent,
          },
          { new: true },
        );

        // Update appointment payment status
        await Appointment.findByIdAndUpdate(transaction.appointmentId, {
          isPaid: true,
          paymentId: transaction._id,
        });

        return {
          success: true,
          message: "Payment successful",
          transactionId,
        };
      }

      return {
        success: false,
        message: "Payment not confirmed",
      };
    } catch (error) {
      console.error("Stripe confirmation error:", error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  // =====================================================
  // RAZORPAY PAYMENT PROCESSING
  // =====================================================

  // Create RazorPay order
  async createRazorpayOrder(appointmentId, userId, doctorId, amount) {
    try {
      if (!razorpay) {
        throw new Error(
          "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.",
        );
      }
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt: `appt_${appointmentId}`,
        payment_capture: 1, // Auto capture
      });

      // Create transaction record
      const transaction = await Transaction.create({
        appointmentId,
        userId,
        doctorId,
        amount,
        currency: "INR",
        gateway: "razorpay",
        status: "pending",
        paymentMethod: "razorpay",
        razorpayOrderId: order.id,
        description: `Consultation appointment with doctor`,
      });

      return {
        success: true,
        orderId: order.id,
        transactionId: transaction._id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error) {
      console.error("RazorPay error:", error);
      throw new Error(`Failed to create RazorPay order: ${error.message}`);
    }
  }

  // Verify RazorPay payment
  async verifyRazorpayPayment(
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    transactionId,
  ) {
    try {
      if (!razorpay) {
        throw new Error(
          "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.",
        );
      }
      const crypto = require("crypto");

      // Verify signature
      const hmac = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (hmac !== razorpaySignature) {
        throw new Error("Invalid payment signature");
      }

      // Update transaction
      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        {
          status: "success",
          razorpayPaymentId,
          razorpaySignature,
        },
        { new: true },
      );

      // Update appointment
      await Appointment.findByIdAndUpdate(transaction.appointmentId, {
        isPaid: true,
        paymentId: transaction._id,
      });

      return {
        success: true,
        message: "Payment verified successfully",
        transactionId,
      };
    } catch (error) {
      console.error("RazorPay verification error:", error);
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
  }

  // =====================================================
  // REFUND PROCESSING
  // =====================================================

  async processRefund(transactionId, reason) {
    try {
      const transaction = await Transaction.findById(transactionId);

      if (!transaction || transaction.status !== "success") {
        throw new Error("Transaction not eligible for refund");
      }

      let refundId;

      if (transaction.gateway === "stripe") {
        const refund = await stripe.refunds.create({
          charge: transaction.stripeChargeId,
          reason: "requested_by_customer",
        });
        refundId = refund.id;
      } else if (transaction.gateway === "razorpay") {
        const refund = await razorpay.payments.refund(
          transaction.razorpayPaymentId,
          {},
        );
        refundId = refund.id;
      }

      // Update transaction
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        {
          status: "refunded",
          "refund.amount": transaction.amount,
          "refund.reason": reason,
          "refund.status": "success",
          "refund.refundId": refundId,
          "refund.processedAt": new Date(),
        },
        { new: true },
      );

      return {
        success: true,
        message: "Refund processed successfully",
        refundId,
      };
    } catch (error) {
      console.error("Refund error:", error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  // =====================================================
  // TRANSACTION HISTORY
  // =====================================================

  async getUserTransactions(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("appointmentId", "date slot")
        .populate("doctorId", "fullname specialization");

      const total = await Transaction.countDocuments({ userId });

      return {
        success: true,
        data: transactions,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: transactions.length,
        },
      };
    } catch (error) {
      console.error("Transaction history error:", error);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  // Get receipt
  async generateReceipt(transactionId) {
    try {
      const transaction = await Transaction.findById(transactionId)
        .populate("userId", "fullname email")
        .populate("doctorId", "fullname specialization fee")
        .populate("appointmentId", "date slot");

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      return {
        success: true,
        receipt: {
          transactionId: transaction._id,
          receiptNumber: `RCP-${transaction._id.toString().slice(-8)}`,
          date: transaction.createdAt,
          patientName: transaction.userId.fullname,
          patientEmail: transaction.userId.email,
          doctorName: transaction.doctorId.fullname,
          doctorSpecialization: transaction.doctorId.specialization,
          appointmentDate: transaction.appointmentId.date,
          appointmentTime: transaction.appointmentId.slot,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          paymentMethod: transaction.paymentMethod,
        },
      };
    } catch (error) {
      console.error("Receipt generation error:", error);
      throw new Error(`Failed to generate receipt: ${error.message}`);
    }
  }

  // Get analytics
  async getPaymentAnalytics(startDate, endDate) {
    try {
      const results = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            transactionCount: { $sum: 1 },
            averageTransaction: { $avg: "$amount" },
          },
        },
      ]);

      return {
        success: true,
        analytics: results[0] || {
          totalRevenue: 0,
          transactionCount: 0,
          averageTransaction: 0,
        },
      };
    } catch (error) {
      console.error("Analytics error:", error);
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
