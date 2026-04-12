const OpenAI = require("openai");
require("dotenv").config();

if (!process.env.GROQ_API_KEY) {
  throw new Error("❌ GROQ_API_KEY is missing in .env file");
}

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

module.exports = groq;
