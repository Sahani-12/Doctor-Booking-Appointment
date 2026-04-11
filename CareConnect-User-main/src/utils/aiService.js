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

    const data = await response.json();
    return data; // पूरा object लौटाएँ
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      success: false,
      reply: "AI service is currently unavailable.",
      doctors: [],
    };
  }
};
