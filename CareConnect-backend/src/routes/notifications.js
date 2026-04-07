// Backend: src/routes/notifications.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// Register device token
router.post("/register", protect, async (req, res) => {
  res.json({
    success: true,
    message: "Notification registration - Coming soon!",
  });
});

// Send notification
router.post("/send", protect, async (req, res) => {
  res.json({ success: true, message: "Send notification - Coming soon!" });
});

// Get notifications
router.get("/", protect, async (req, res) => {
  res.json({ success: true, message: "Get notifications - Coming soon!" });
});

// Update preferences
router.put("/preferences", protect, async (req, res) => {
  res.json({ success: true, message: "Update preferences - Coming soon!" });
});

module.exports = router;
