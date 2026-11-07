const express = require("express");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const {
  getUserProfile,
  getUserById,
  updateUserProfile,
  getUserAppointments,
  getUserDocuments,
  getDocumentsByUserId,
  uploadDocument,
  deleteDocument,
  getDashboardOverview,
  createUserLabOrder,
  getUserLabOrders,
  getUserBills,
} = require("../controllers/userController");

const router = express.Router();

// User profile routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/dashboard/overview", protect, getDashboardOverview);

// Appointment routes
router.get("/appointments", protect, getUserAppointments);

// Lab order routes
router.get("/lab-orders", protect, getUserLabOrders);
router.post("/lab-orders", protect, createUserLabOrder);

// Bills routes
router.get("/bills", protect, getUserBills);

// Document routes
router.get("/documents", protect, getUserDocuments);
router.post(
  "/documents",
  protect,
  upload.single("file"),
  uploadDocument,
);
router.post(
  "/documents/upload",
  protect,
  upload.single("file"),
  uploadDocument,
);
router.delete("/documents/:id", protect, deleteDocument);

// Legacy/compatibility routes
router.get("/dashboard/profile", protect, getUserProfile);
router.get("/dashboard/appointments", protect, getUserAppointments);
router.get("/dashboard/documents", protect, getUserDocuments);
router.get("/dashboard/documents/:userId", protect, getDocumentsByUserId);
router.get("/:id", getUserById);
router.get("/users/:id", getUserById);

module.exports = router;
