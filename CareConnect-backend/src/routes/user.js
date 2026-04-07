const express = require("express");
const multer = require("multer");
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
} = require("../controllers/userController");

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// User profile routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.get("/dashboard/overview", protect, getDashboardOverview);

// Appointment routes
router.get("/appointments", protect, getUserAppointments);

// Document routes
router.get("/documents", protect, getUserDocuments);
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
router.post(
  "/dashboard/documents/upload",
  protect,
  upload.single("file"),
  uploadDocument,
);
router.get("/:id", getUserById);
router.get("/users/:id", getUserById);

module.exports = router;
