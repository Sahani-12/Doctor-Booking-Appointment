// Backend: src/routes/video.js
const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const { protect } = require("../middleware/auth");

// Create video room
router.post("/create-room", protect, videoController.createVideoRoom);

// Join video session
router.post("/join-session", protect, videoController.joinVideoSession);

// End video session
router.post("/end-session", protect, videoController.endVideoSession);

// Get session history
router.get("/history", protect, videoController.getSessionHistory);

// Get session details
router.get(
  "/session/:videoSessionId",
  protect,
  videoController.getSessionDetails,
);

// Save prescription
router.post("/save-prescription", protect, videoController.savePrescription);

module.exports = router;
