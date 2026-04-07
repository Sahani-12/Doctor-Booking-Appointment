const express = require("express");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const {
  createAppointment,
  getMyAppointments,
  getAvailableSlots,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentStats,
} = require("../controllers/appointmentController");

const router = express.Router();

// Appointment routes
router.post("/", protect, createAppointment);
router.post("/request", protect, createAppointment); // Alias for compatibility
router.get("/my", protect, getMyAppointments);
router.get("/slots/:doctorId/:date", protect, getAvailableSlots);
router.put("/:id/status", protect, updateAppointmentStatus);
router.post("/:id/cancel", protect, cancelAppointment);
router.get(
  "/stats",
  protect,
  authorize("doctor", "admin"),
  getAppointmentStats,
);

module.exports = router;
