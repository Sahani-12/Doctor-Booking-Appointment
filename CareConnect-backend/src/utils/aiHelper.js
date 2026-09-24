const axios = require("axios");

// List of supported Groq models in priority order
const MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant"
];

/**
 * Executes a chat completion with automatic model fallbacks.
 * @param {Array} messages - Array of message objects [{role, content}]
 * @param {Object} options - Additional options like temperature, max_tokens
 * @returns {Promise<string>} The AI response text
 */
const getAICompletion = async (messages, options = {}) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing from environment variables.");
  }

  let lastError = null;

  for (const model of MODELS) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 500,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.warn(`[AI Helper] Model '${model}' failed: ${errorMsg}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Groq AI models failed.");
};

module.exports = {
  MODELS,
  getAICompletion,
};
