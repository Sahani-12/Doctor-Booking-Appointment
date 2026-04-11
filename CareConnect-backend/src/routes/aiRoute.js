const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Message is required.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        reply: "GROQ_API_KEY is missing.",
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an AI medical assistant for a Doctor Booking System. Provide short and clear responses and suggest appropriate doctors. Do not prescribe medicines.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.4,
        max_tokens: 80,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json({
      success: true,
      reply: response.data.choices[0].message.content.trim(),
    });
  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      reply: "AI service temporarily unavailable.",
    });
  }
});

module.exports = router;
