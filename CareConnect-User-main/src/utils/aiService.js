import BASE_URL from "@/constants/api";

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
