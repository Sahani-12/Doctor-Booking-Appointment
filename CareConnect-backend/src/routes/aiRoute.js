const express = require("express");
const Doctor = require("../models/Doctor");
const { getAICompletion } = require("../utils/aiHelper");

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

// Fallback reply if AI provider is unreachable
const getFallbackReply = (message, specialization) => {
  const text = message.toLowerCase();
  if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("namaste")) {
    return "Hello! I am your CareConnect AI Assistant. How can I assist you with your health or doctor appointments today?";
  }
  if (specialization) {
    return `Thank you for sharing your symptoms. Based on "${specialization}", I recommend consulting a specialist below for proper evaluation.`;
  }
  return "I am here to help you navigate CareConnect. You can ask about symptoms, find specialist doctors, or book appointments!";
};

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Please enter a message.",
      });
    }

    // Detect specialization for doctor suggestions
    const specialization = detectSpecialization(message);

    let doctors = [];
    if (specialization) {
      try {
        const foundDocs = await Doctor.find({
          specialization: { $regex: `^${specialization}$`, $options: "i" },
        })
          .select("fullname specialization experience fee rating profileImage")
          .limit(5);

        doctors = foundDocs.map((doc) => ({
          _id: doc._id,
          name: doc.fullname,
          fullname: doc.fullname,
          specialization: Array.isArray(doc.specialization)
            ? doc.specialization.join(", ")
            : doc.specialization,
          experience: doc.experience || "N/A",
          fees: doc.fee || 0,
          fee: doc.fee || 0,
          rating: doc.rating || 0,
          profileImage: doc.profileImage || "",
        }));
      } catch (err) {
        console.warn("Error fetching doctors for AI response:", err.message);
      }
    }

    // Natural AI Prompt
    const systemPrompt = `
You are CareConnect AI, a friendly, intelligent, and professional healthcare assistant for a Doctor Booking System.

Guidelines:
- Speak naturally, empathetically, and conversationally.
- Help users with healthcare advice, symptom understanding, doctor appointments, and platform navigation.
- Provide accurate general medical advice without providing formal prescriptions or definitive diagnoses.
- Respond in the same language as the user (e.g. English, Hindi, Hinglish).
`;

    let aiReply = "";

    try {
      aiReply = await getAICompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        { temperature: 0.7, max_tokens: 250 }
      );
    } catch (aiError) {
      console.error("Groq AI Error (using fallback):", aiError.message);
      aiReply = getFallbackReply(message, specialization);
    }

    res.json({
      success: true,
      reply: aiReply,
      specialization,
      doctors,
    });
  } catch (error) {
    console.error("AI ROUTE ERROR:", error.message);
    res.status(500).json({
      success: false,
      reply: "Hello! CareConnect AI is active. How can I help you today?",
      doctors: [],
    });
  }
});

module.exports = router;
