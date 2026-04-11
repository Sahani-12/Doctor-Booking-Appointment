const express = require("express");
const axios = require("axios");
const Doctor = require("../models/Doctor");

const router = express.Router();

// Symptom → Specialization Mapping
const specializationMap = {
  fever: "General Physician",
  cold: "General Physician",
  cough: "General Physician",
  flu: "General Physician",
  "body pain": "Orthopedic",
  pain: "Orthopedic",
  headache: "Neurologist",
  migraine: "Neurologist",
  "chest pain": "Cardiologist",
  heart: "Cardiologist",
  skin: "Dermatologist",
  allergy: "Dermatologist",
  eye: "Ophthalmologist",
  bone: "Orthopedic",
  fracture: "Orthopedic",
  "joint pain": "Orthopedic",
  pregnancy: "Gynecologist",
  period: "Gynecologist",
  dental: "Dentist",
  tooth: "Dentist",
  stomach: "Gastroenterologist",
  diabetes: "Endocrinologist",
};

// Detect specialization
const detectSpecialization = (message) => {
  const text = message.toLowerCase();
  for (const keyword in specializationMap) {
    if (text.includes(keyword)) {
      return specializationMap[keyword];
    }
  }
  return null;
};

// Function to shorten AI response
const getShortReply = (specialization) => {
  return `You should consult a ${specialization}.`;
};

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Please enter a medical query.",
      });
    }

    // Detect specialization
    const specialization = detectSpecialization(message);

    // Restrict non-medical queries
    if (!specialization) {
      return res.json({
        success: false,
        reply:
          "I am a medical assistant. Please ask only health-related questions.",
        doctors: [],
      });
    }

    // Fetch doctors from MongoDB
    const doctors = await Doctor.find({
      specialization: { $regex: `^${specialization}$`, $options: "i" },
    })
      .select("name specialization experience fees rating")
      .limit(5);

    // 🔹 Short and Controlled Reply (No long AI response)
    const reply = getShortReply(specialization);

    res.json({
      success: true,
      reply,
      specialization,
      doctors,
    });
  } catch (error) {
    console.error("AI ERROR:", error.message);
    res.status(500).json({
      success: false,
      reply: "AI service temporarily unavailable.",
      doctors: [],
    });
  }
});

module.exports = router;
