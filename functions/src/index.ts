import * as functions from "firebase-functions";
import * as cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHandler = cors({ origin: true });

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY not set!");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const echowrite = functions.https.onRequest(async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    return res.status(204).send("");
  }

  // Handle actual requests
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { action, text, style, visualType, targetLanguage, lengthType } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      let prompt = "";
      let parseResponse: (response: string) => any = (response) => response;

      switch (action) {
        case "variations": {
          prompt = `Transform the following text into 8 different variations using the ${style} writing style. Each variation should be unique but maintain the core message. Return ONLY a JSON array with this exact structure: [{"id": "1", "title": "Variation 1", "suggestedText": "..."}, ...]

Text to transform: "${text}"

Writing style: ${style}

Return ONLY valid JSON, no other text.`;
          
          parseResponse = (response) => {
            try {
              const jsonMatch = response.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                const variations = JSON.parse(jsonMatch[0]);
                return { variations };
              }
            } catch (e) {
              console.error("Failed to parse variations JSON:", e);
            }
            return { variations: [{ id: "1", title: "Professional Version", suggestedText: text }] };
          };
          break;
        }

        case "length-variations": {
          prompt = `Generate 5 variations of the following text in three lengths: SIMPLE (very short, under 30 words), MEDIUM (moderate length, 30-60 words), and LONG (detailed, 60-100 words).

Text: "${text}"

Return ONLY a JSON object with this exact structure:
{
  "simple": [{"id": "s1", "text": "...", "wordCount": 20}, ...],
  "medium": [{"id": "m1", "text": "...", "wordCount": 45}, ...],
  "long": [{"id": "l1", "text": "...", "wordCount": 80}, ...]
}

Each array should have exactly 5 variations. Return ONLY valid JSON.`;
          break;
        }

        case "generate-visual": {
          prompt = `Create a Mermaid.js ${visualType} diagram based on the following text. 

Text: "${text}"

Return ONLY a JSON object with this exact structure:
{
  "title": "Diagram Title",
  "mermaidCode": "graph TD\\nA-->B",
  "description": "Brief description of what the diagram shows"
}

The mermaidCode should be valid Mermaid syntax for a ${visualType}. Return ONLY valid JSON.`;
          break;
        }

        case "translate": {
          prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translation, no explanations.

Text: "${text}"

Translation:`;
          
          parseResponse = (response) => ({ text: response });
          break;
        }

        case "rephrase": {
          const lengthInstructions: Record<string, string> = {
            simple: 'Make it very concise (under 30 words)',
            medium: 'Keep it moderate length (30-60 words)',
            long: 'Expand it with more details (60-100 words)'
          };
          
          prompt = `Rephrase the following text. ${lengthInstructions[lengthType] || lengthInstructions.medium}.

Text: "${text}"

Rephrased version:`;
          
          parseResponse = (response) => ({ text: response });
          break;
        }

        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      
      const parsed = parseResponse(response);
      
      // Set CORS headers for successful responses
      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json(parsed);

    } catch (error: any) {
      console.error("Error in echowrite function:", error);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(500).json({ 
        error: error.message || "Failed to process request",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
});
