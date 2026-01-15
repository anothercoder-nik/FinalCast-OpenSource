import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_SUGGESTIONS = [
  { type: "topic", content: "Ask about their biggest failure and what they learned." },
  { type: "pacing", content: "The energy is dropping. Try a rapid-fire round." }
];

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });
  }

  async generateSuggestionsFromContext(context) {
    if (!process.env.GEMINI_API_KEY) {
      return this.getMockSuggestions();
    }

    if (!context || context.length < 50) {
      return this.getMockSuggestions();
    }

    const prompt = `
You are an experienced podcast producer.
Based on the recent conversation, give 3 useful cues to improve the show.

Conversation:
"${context}"

Return exactly 3 items as JSON:
[
  { "type": "topic", "content": "..." },
  { "type": "pacing", "content": "..." },
  { "type": "fact_check", "content": "..." }
]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, "").trim();

      const suggestions = JSON.parse(text);

      return suggestions.map((item, index) => ({
        ...item,
        id: Date.now() + index
      }));
    } catch (err) {
      return this.getMockSuggestions();
    }
  }

  async getMockSuggestions() {
    return FALLBACK_SUGGESTIONS.map((item, index) => ({
      ...item,
      id: Date.now() + index
    }));
  }
}

export default new AIService();
