// Backend: src/routes/payments.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

// =====================================================
// PUBLIC ROUTES (Authenticated users)
// =====================================================

// Demo / simulated payment (no Stripe or Razorpay keys required)
router.post("/demo-complete", protect, paymentController.demoCompletePayment);

// Stripe payment endpoints
router.post(
  "/stripe/create-payment",
  protect,
  paymentController.createStripePayment,
);
router.post(
  "/stripe/confirm-payment",
  protect,
  paymentController.confirmStripePayment,
);

// RazorPay payment endpoints
router.post(
  "/razorpay/create-order",
  protect,
  paymentController.createRazorpayOrder,
);
router.post(
  "/razorpay/verify-payment",
  protect,
  paymentController.verifyRazorpayPayment,
);

// Refund
router.post("/refund", protect, paymentController.processRefund);

// Payment history
router.get("/history", protect, paymentController.getPaymentHistory);

// Get receipt
router.get("/receipt/:transactionId", protect, paymentController.getReceipt);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Analytics (admin only)
router.get(
  "/admin/analytics",
  protect,
  authorize("admin"),
  paymentController.getPaymentAnalytics,
);

// All transactions (admin only)
router.get(
  "/admin/transactions",
  protect,
  authorize("admin"),
  paymentController.getAllTransactions,
);

module.exports = router;
