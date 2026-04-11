const express = require("express");
const axios = require("axios");
const Doctor = require("../models/Doctor");

const router = express.Router();

// Symptom → Specialization Mapping (for doctor suggestions)
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
  kidney: "Nephrologist",
  lungs: "Pulmonologist",
};

// Detect specialization from user message
const detectSpecialization = (message) => {
  const text = message.toLowerCase();
  for (const keyword in specializationMap) {
    if (text.includes(keyword)) {
      return specializationMap[keyword];
    }
  }
  return null;
};

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Please enter a message.",
      });
    }

    // Detect specialization for doctor suggestions
    const specialization = detectSpecialization(message);

    let doctors = [];
    if (specialization) {
      doctors = await Doctor.find({
        specialization: { $regex: `^${specialization}$`, $options: "i" },
      })
        .select("name specialization experience fees rating")
        .limit(5);
    }

    // Natural AI Prompt (No Restrictions)
    const systemPrompt = `
You are CareConnect AI, a friendly, intelligent, and professional assistant
for a Doctor Booking System.

Guidelines:
- Speak naturally and conversationally.
- Help users with healthcare, appointments, and general questions.
- Provide accurate medical information when asked.
- Suggest doctors when relevant.
- Do not prescribe medicines or provide diagnoses.
- Respond in the same language as the user.
`;

    // Call Groq API
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 120,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const aiReply = aiResponse.data.choices[0].message.content.trim();

    res.json({
      success: true,
      reply: aiReply,
      specialization,
      doctors,
    });
  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      reply: "AI service temporarily unavailable.",
      doctors: [],
    });
  }
});

module.exports = router;
