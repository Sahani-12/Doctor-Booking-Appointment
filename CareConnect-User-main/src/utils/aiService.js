const BASE_URL = import.meta.env.VITE_API_URL;

export const getAIResponse = async (message) => {
  try {
    const response = await fetch(`${BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply || "No response from AI.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "AI service is currently unavailable.";
  }
};