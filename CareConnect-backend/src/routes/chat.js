// Backend: src/routes/chat.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// Get conversations
router.get("/conversations", protect, async (req, res) => {
  res.json({ success: true, message: "Chat feature - Coming soon!" });
});

// Get chat history
router.get("/messages/:conversationId", protect, async (req, res) => {
  res.json({ success: true, message: "Chat feature - Coming soon!" });
});

// Send message
router.post("/send", protect, async (req, res) => {
  res.json({ success: true, message: "Chat feature - Coming soon!" });
});

module.exports = router;
