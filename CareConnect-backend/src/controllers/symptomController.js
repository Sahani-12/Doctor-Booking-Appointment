const groq = require("../config/groq");

const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Symptoms are required",
      });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional medical AI assistant. Respond strictly in JSON format.",
        },
        {
          role: "user",
          content: `Analyze the following symptoms: ${symptoms}
Return ONLY valid JSON:
{
  "possibleDiseases": [],
  "severity": "Low | Medium | High",
  "recommendedSpecialist": "",
  "precautions": [],
  "advice": ""
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    if (!response || !response.choices) {
      throw new Error("Invalid response from Groq API");
    }

    let aiText = response.choices[0].message.content.trim();
    aiText = aiText.replace(/```json|```/g, "").trim();

    const result = JSON.parse(aiText);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Groq AI Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to analyze symptoms",
      error: error.message,
    });
  }
};

module.exports = { analyzeSymptoms };
