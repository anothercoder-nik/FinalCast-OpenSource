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

  async generateSummaryFromTranscript(transcript) {
    if (!process.env.GEMINI_API_KEY) {
      return "Summary generation unavailable: API key not configured.";
    }

    if (!transcript || transcript.length === 0) {
      return "No transcript available for summary.";
    }

    // Convert transcript array to text
    const transcriptText = transcript.map(item => item.word).join(' ');

    const prompt = `
You are an expert at summarizing podcast episodes and video sessions.
Based on the following transcript, generate a concise summary highlighting key topics, main points, and any notable insights.

Transcript:
"${transcriptText}"

Provide a summary in 2-3 paragraphs, focusing on the most important content.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const summary = result.response.text().trim();
      return summary;
    } catch (err) {
      console.error('Error generating summary:', err);
      return "Failed to generate summary.";
    }
  }
}

export default new AIService();
