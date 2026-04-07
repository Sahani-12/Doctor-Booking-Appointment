const express = require("express");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const {
  getAllUsers,
  getAllDoctorsAdmin,
  getAllAppointments,
  updateUser,
  approveDoctor,
  deleteUser,
  deleteDoctor,
  getAdminStats,
  getUsersAnalytics,
  getPendingDoctors,
  getDashboard,
  getPayments,
  getSettings,
  updateSettings,
} = require("../controllers/adminController");

const router = express.Router();

// Protect all admin routes with authentication and authorization
router.use(protect, authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// User management
// Specific routes BEFORE generic routes
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/users", getAllUsers);

// Doctor management
// Specific routes BEFORE generic routes
router.get("/doctors/pending", getPendingDoctors);
router.put("/doctors/:id/approve", approveDoctor);
router.delete("/doctors/:id", deleteDoctor);
router.get("/doctors", getAllDoctorsAdmin);

// Appointment management
router.get("/appointments", getAllAppointments);

// Payments
router.get("/payments", getPayments);

// Settings
router.get("/settings", getSettings);
router.post("/settings", updateSettings);

// Statistics
router.get("/stats", getAdminStats);
router.get("/analytics/users-report", getUsersAnalytics);

module.exports = router;
