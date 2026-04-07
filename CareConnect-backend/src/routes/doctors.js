const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorStats,
} = require("../controllers/doctorController");

const router = express.Router();

// Doctor routes
router.get("/", getAllDoctors);
router.get("/profile", protect, getDoctorProfile);
router.get("/stats", getDoctorStats);
router.get("/:id", getDoctorById);
router.put("/profile", protect, updateDoctorProfile);

module.exports = router;
