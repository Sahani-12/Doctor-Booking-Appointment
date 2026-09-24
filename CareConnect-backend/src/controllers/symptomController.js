const { getAICompletion } = require("../utils/aiHelper");

// Fallback rule engine for symptom analysis if AI API is unreachable
const fallbackSymptomAnalysis = (symptoms) => {
  const text = symptoms.toLowerCase();
  let possibleDiseases = ["General Malaise", "Viral Syndrome"];
  let severity = "Low";
  let recommendedSpecialist = "General Physician";
  let precautions = [
    "Get adequate rest and sleep",
    "Stay hydrated with water and warm fluids",
    "Monitor symptoms closely",
  ];
  let advice = "If symptoms persist for more than 2-3 days or worsen, please consult a healthcare professional.";

  if (text.includes("fever") || text.includes("chills")) {
    possibleDiseases = ["Viral Fever", "Flu (Influenza)", "Common Cold"];
    severity = text.includes("high") || text.includes("severe") ? "High" : "Medium";
    recommendedSpecialist = "General Physician";
    precautions.push("Take body temperature readings regularly", "Avoid cold beverages");
  } else if (text.includes("chest") || text.includes("heart") || text.includes("breath")) {
    possibleDiseases = ["Angina", "Cardiovascular Strain", "Bronchial Spasm"];
    severity = "High";
    recommendedSpecialist = "Cardiologist";
    precautions.push("Avoid strenuous activity immediately", "Keep emergency contact numbers handy");
    advice = "Chest symptoms can be serious. Please seek immediate medical evaluation.";
  } else if (text.includes("headache") || text.includes("migraine")) {
    possibleDiseases = ["Tension Headache", "Migraine", "Sinusitis"];
    severity = text.includes("severe") ? "Medium" : "Low";
    recommendedSpecialist = "Neurologist";
    precautions.push("Rest in a quiet, dark room", "Reduce screen time");
  } else if (text.includes("skin") || text.includes("rash") || text.includes("itch")) {
    possibleDiseases = ["Contact Dermatitis", "Allergic Reaction", "Eczema"];
    severity = "Low";
    recommendedSpecialist = "Dermatologist";
    precautions.push("Do not scratch affected skin", "Use mild fragrance-free soap");
  } else if (text.includes("stomach") || text.includes("abdominal") || text.includes("vomit") || text.includes("nausea")) {
    possibleDiseases = ["Gastritis", "Food Poisoning", "Indigestion"];
    severity = "Medium";
    recommendedSpecialist = "Gastroenterologist";
    precautions.push("Eat bland foods (BRAT diet)", "Avoid oily, spicy foods");
  }

  return {
    possibleDiseases,
    severity,
    recommendedSpecialist,
    precautions,
    advice,
  };
};

const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required",
      });
    }

    const systemPrompt = `You are a professional medical AI assistant. Respond strictly in JSON format.`;
    const userPrompt = `Analyze the following symptoms: "${symptoms}"
Return ONLY valid JSON without markdown quotes or explanation in this exact structure:
{
  "possibleDiseases": ["Disease 1", "Disease 2"],
  "severity": "Low" | "Medium" | "High",
  "recommendedSpecialist": "General Physician",
  "precautions": ["Precaution 1", "Precaution 2"],
  "advice": "General medical advice"
}`;

    let result = null;

    try {
      const aiText = await getAICompletion(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        { temperature: 0.3, max_tokens: 500 }
      );

      // Clean JSON formatting if code blocks exist
      const cleanJson = aiText.replace(/```json|```/g, "").trim();
      result = JSON.parse(cleanJson);
    } catch (aiError) {
      console.warn("AI Symptom Analysis Error (using fallback):", aiError.message);
      result = fallbackSymptomAnalysis(symptoms);
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Symptom Controller Error:", error.message);
    const fallbackData = fallbackSymptomAnalysis(req.body?.symptoms || "");
    return res.status(200).json({
      success: true,
      data: fallbackData,
    });
  }
};

module.exports = { analyzeSymptoms };
