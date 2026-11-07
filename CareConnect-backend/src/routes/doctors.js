const express = require("express");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const asyncHandler = require("express-async-handler");
const {
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorStats,
} = require("../controllers/doctorController");

const router = express.Router();

const uploadAnyImage = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "File upload error" });
    }
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

const handleDoctorUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: "Image uploaded successfully",
    url: fileUrl,
    data: { url: fileUrl },
  });
});

// Upload routes
router.post("/upload", protect, uploadAnyImage, handleDoctorUpload);
router.post("/upload-profile-image", protect, uploadAnyImage, handleDoctorUpload);
router.post("/profile/upload", protect, uploadAnyImage, handleDoctorUpload);

// Doctor routes
router.get("/", getAllDoctors);
router.get("/profile", protect, getDoctorProfile);
router.get("/stats", getDoctorStats);
router.get("/:id", getDoctorById);
router.put("/profile", protect, updateDoctorProfile);
router.put("/update", protect, updateDoctorProfile);
router.put("/:id", protect, updateDoctorProfile);

module.exports = router;
