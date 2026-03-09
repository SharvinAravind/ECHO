import { WritingStyle, WritingVariation } from "@/types/echowrite";

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY ?? "";
  const trimmed = typeof key === "string" ? key.trim() : "";
  return trimmed;
};

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"] as const;

export interface LengthVariation {
  id: string;
  text: string;
  wordCount: number;
}

export interface LengthVariations {
  simple: LengthVariation[];
  medium: LengthVariation[];
  long: LengthVariation[];
}

export interface VisualContent {
  title: string;
  mermaidCode: string;
  description: string;
}

/** Call Gemini API with retry, model fallback, and clear error reporting */
const callGeminiDirectly = async (
  prompt: string,
  options?: { maxRetries?: number }
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.length < 20) {
    throw new Error(
      "Gemini API key missing. Add VITE_GEMINI_API_KEY=your_key to .env and restart."
    );
  }

  const maxRetries = options?.maxRetries ?? 2;
  let lastError: Error | null = null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              topP: 0.95,
            },
          }),
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
          const msg = body?.error?.message || response.statusText;
          const code = body?.error?.code ?? response.status;

          if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }

          if (response.status === 400 && /model|not found/i.test(String(msg))) {
            lastError = new Error(`Model ${model} unavailable: ${msg}`);
            break;
          }

          if (response.status === 401 || response.status === 403) {
            throw new Error(
              `Invalid API key. Check VITE_GEMINI_API_KEY in .env and get a key from https://aistudio.google.com/apikey`
            );
          }

          throw new Error(`Gemini API (${code}): ${msg}`);
        }

        const text =
          body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

        if (!text) {
          const blockReason =
            body?.candidates?.[0]?.finishReason ||
            body?.candidates?.[0]?.safetyRatings ||
            "empty response";
          throw new Error(`No content generated (${String(blockReason)})`);
        }

        return text;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries && /429|503|ECONNRESET|fetch failed/i.test(lastError.message)) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          continue;
        }
        if (attempt === maxRetries) break;
      }
    }
  }

  const msg = lastError?.message ?? "Unknown error";
  if (/api key|invalid|401|403/i.test(msg)) {
    throw new Error(
      "Invalid or missing Gemini API key. Add VITE_GEMINI_API_KEY to .env and restart the dev server."
    );
  }
  if (/network|fetch|failed/i.test(msg)) {
    throw new Error("Network error. Check your internet connection and try again.");
  }
  throw new Error(`Generation failed: ${msg}`);
};

// Handle variations
const handleVariationsDirect = async (
  text: string,
  style: WritingStyle
): Promise<{ variations: WritingVariation[] }> => {
  const prompt = `Transform the following text into 8 different variations using the ${style} writing style. Each variation should be unique but maintain the core message. Return ONLY a JSON array with this exact structure: [{"id": "1", "title": "Variation 1", "suggestedText": "..."}, ...]

Text to transform: "${text}"

Writing style: ${style}

Return ONLY valid JSON, no other text or explanations.`;

  const response = await callGeminiDirectly(prompt);

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const raw = JSON.parse(jsonMatch[0]);
      if (Array.isArray(raw) && raw.length > 0) {
        const variations: WritingVariation[] = raw.map((v: any, i: number) => ({
          id: String(v?.id ?? i + 1),
          label: v?.label ?? v?.title ?? `Variation ${i + 1}`,
          suggestedText: v?.suggestedText ?? v?.text ?? text,
          tone: v?.tone ?? "Professional",
          changes: Array.isArray(v?.changes) ? v.changes : [{ field: "style", reason: "Applied writing style variation" }],
        }));
        return { variations };
      }
    }
  } catch {
    /* fallback below */
  }

  return {
    variations: Array(8)
      .fill(null)
      .map((_, i) => ({
        id: `${i + 1}`,
        label: `Variation ${i + 1}`,
        suggestedText: text,
        tone: "Professional",
        changes: [{ field: "style", reason: "Applied writing style variation" }],
      })),
  };
};

// Handle length variations
const handleLengthVariationsDirect = async (
  text: string
): Promise<LengthVariations> => {
  const prompt = `Generate 5 variations of the following text in three lengths: SIMPLE (very short, under 30 words), MEDIUM (moderate length, 30-60 words), and LONG (detailed, 60-100 words).

Text: "${text}"

Return ONLY a JSON object with this exact structure:
{
  "simple": [{"id": "s1", "text": "...", "wordCount": 20}, {"id": "s2", "text": "...", "wordCount": 25}, {"id": "s3", "text": "...", "wordCount": 22}, {"id": "s4", "text": "...", "wordCount": 28}, {"id": "s5", "text": "...", "wordCount": 24}],
  "medium": [{"id": "m1", "text": "...", "wordCount": 45}, {"id": "m2", "text": "...", "wordCount": 50}, {"id": "m3", "text": "...", "wordCount": 42}, {"id": "m4", "text": "...", "wordCount": 48}, {"id": "m5", "text": "...", "wordCount": 46}],
  "long": [{"id": "l1", "text": "...", "wordCount": 80}, {"id": "l2", "text": "...", "wordCount": 85}, {"id": "l3", "text": "...", "wordCount": 78}, {"id": "l4", "text": "...", "wordCount": 82}, {"id": "l5", "text": "...", "wordCount": 79}]
}

Each array should have exactly 5 variations. Return ONLY valid JSON, no other text.`;

  const response = await callGeminiDirectly(prompt);
  const wc = text.split(/\s+/).filter(Boolean).length;
  const def = { id: "1", text, wordCount: wc };

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        simple: Array.isArray(parsed.simple) && parsed.simple.length
          ? parsed.simple
          : [def],
        medium: Array.isArray(parsed.medium) && parsed.medium.length
          ? parsed.medium
          : [def],
        long: Array.isArray(parsed.long) && parsed.long.length
          ? parsed.long
          : [def],
      };
    }
  } catch {
    /* fallback below */
  }

  return { simple: [def], medium: [def], long: [def] };
};

// Handle visual content
const handleVisualDirect = async (
  text: string,
  visualType: string
): Promise<VisualContent> => {
  const prompt = `Create a Mermaid.js ${visualType} diagram based on the following text.

Text: "${text}"

Return ONLY a JSON object with this exact structure:
{
  "title": "Diagram Title",
  "mermaidCode": "graph TD\\nA-->B",
  "description": "Brief description of what the diagram shows"
}

The mermaidCode must be valid Mermaid syntax for a ${visualType}. Return ONLY valid JSON, no other text.`;

  const response = await callGeminiDirectly(prompt);
  const safeTitle = text.substring(0, 30).replace(/"/g, "'");

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.mermaidCode || parsed.title) {
        return {
          title: parsed.title || `${visualType} Diagram`,
          mermaidCode:
            parsed.mermaidCode ||
            `graph TD\nA[${safeTitle}]-->B[Concept]`,
          description: parsed.description || "Visual representation",
        };
      }
    }
  } catch {
    /* fallback below */
  }

  return {
    title: `${visualType} Diagram`,
    mermaidCode: `graph TD\nA[${safeTitle}]-->B[Process]\nB-->C[End]`,
    description: "Basic diagram structure",
  };
};

const handleTranslateDirect = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translation, no explanations.

Text: "${text}"

Translation:`;
  return callGeminiDirectly(prompt);
};

const handleRephraseDirect = async (
  text: string,
  lengthType: string
): Promise<string> => {
  const instructions: Record<string, string> = {
    simple: "Make it very concise (under 30 words)",
    medium: "Keep it moderate length (30-60 words)",
    long: "Expand with more details (60-100 words)",
  };
  const prompt = `Rephrase the following text. ${instructions[lengthType] ?? instructions.medium}. Return ONLY the rephrased text.

Text: "${text}"

Rephrased:`;
  return callGeminiDirectly(prompt);
};

// Public API - direct Gemini only (no Firebase) for speed and reliability
export const getWritingVariations = async (
  text: string,
  style: WritingStyle
): Promise<{ variations: WritingVariation[] }> => {
  return handleVariationsDirect(text, style);
};

export const getLengthVariations = async (
  text: string
): Promise<LengthVariations> => {
  return handleLengthVariationsDirect(text);
};

export const generateVisualContent = async (
  text: string,
  visualType:
    | "diagram"
    | "flowchart"
    | "mindmap"
    | "timeline"
    | "orgchart"
    | "sequence"
): Promise<VisualContent> => {
  return handleVisualDirect(text, visualType);
};

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  return handleTranslateDirect(text, targetLanguage);
};

export const rephraseText = async (
  text: string,
  lengthType: "simple" | "medium" | "long"
): Promise<string> => {
  return handleRephraseDirect(text, lengthType);
};
