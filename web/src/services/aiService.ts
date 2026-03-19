import { WritingStyle, WritingVariation } from "@/types/echowrite";

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GenerationState {
  status: GenerationStatus;
  progress: number;
  error: string | null;
}

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY ?? "";
  const trimmed = typeof key === "string" ? key.trim() : "";
  console.log('[AI Service] Gemini API Key present:', !!trimmed, '| Model:', MODEL_NAME);
  if (!trimmed || trimmed.length < 10) {
    console.error('[AI Service] API Key missing. VITE_GEMINI_API_KEY not found in environment.');
  }
  return trimmed;
};

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1/models";
const MODEL_NAME = "gemini-2.5-flash";
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 500;

export interface LengthVariation {
  id: string;
  text: string;
  wordCount: number;
}

export interface LengthVariations {
  simple: LengthVariation[];
  medium: LengthVariation[];
  long: LengthVariation[];
  detailed: LengthVariation[];
}

export interface VisualContent {
  title: string;
  mermaidCode: string;
  description: string;
}

export interface ContentFormat {
  id: string;
  name: string;
  description: string;
}

export const CONTENT_FORMATS: ContentFormat[] = [
  { id: "structured", name: "Structured Text", description: "Well-organized paragraphs with clear sections" },
  { id: "marketing", name: "Marketing Copy", description: "Persuasive and engaging marketing content" },
  { id: "blog", name: "Blog Style", description: "Informal, reader-friendly blog posts" },
  { id: "social", name: "Social Media", description: "Short, punchy social media posts" },
  { id: "visual", name: "Visual Descriptions", description: "Detailed visual content descriptions" },
];

export const WRITING_STYLES: { id: string; name: string; description: string }[] = [
  { id: "professional_email", name: "Professional", description: "Formal business communication" },
  { id: "casual", name: "Casual", description: "Relaxed and friendly tone" },
  { id: "creative", name: "Creative", description: "Imaginative and expressive writing" },
  { id: "marketing", name: "Marketing", description: "Persuasive sales copy" },
  { id: "academic", name: "Academic", description: "Scholarly and research-focused" },
  { id: "storytelling", name: "Storytelling", description: "Narrative and story-driven content" },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callGeminiWithRetry = async (
  prompt: string,
  options?: {
    model?: string;
    maxRetries?: number;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.length < 10) {
    const errMsg = "Gemini API key missing. Please add VITE_GEMINI_API_KEY to .env file and rebuild the app.";
    console.error('[AI Service] ERROR:', errMsg);
    throw new Error(errMsg);
  }

  const model = options?.model || MODEL_NAME;
  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  const temperature = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens ?? 4096;

  console.log('[AI Service] Calling Gemini API with model:', model);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
      console.log('[AI Service] Request URL:', url.replace(apiKey, '***'));
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      });

      console.log('[AI Service] Response status:', response.status);
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = body?.error?.message || response.statusText;
        const status = response.status;
        console.error('[AI Service] API Error:', status, msg);

        if ((status === 429 || status === 503) && attempt < maxRetries) {
          console.log('[AI Service] Rate limited, retrying in', RETRY_DELAY_BASE * Math.pow(2, attempt), 'ms');
          await sleep(RETRY_DELAY_BASE * Math.pow(2, attempt));
          continue;
        }

        if (status === 401 || status === 403) {
          throw new Error(`Invalid API key. Check VITE_GEMINI_API_KEY in .env`);
        }

        if (status === 404) {
          throw new Error(`Model not found: ${model}. Please check the model name.`);
        }

        throw new Error(`Gemini API error (${status}): ${msg}`);
      }

      const text = body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        console.warn('[AI Service] Empty response from API');
        throw new Error("No content generated - empty response");
      }

      console.log('[AI Service] Generated content length:', text.length);
      return text;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[AI Service] Attempt', attempt + 1, 'error:', error.message);

      if (attempt < maxRetries && /429|503|ECONNRESET|fetch failed|timeout/i.test(error.message)) {
        await sleep(RETRY_DELAY_BASE * Math.pow(2, attempt));
        continue;
      }

      if (/api key|invalid|401|403|unauthorized/i.test(error.message)) {
        throw new Error("Invalid or missing Gemini API key. Please check VITE_GEMINI_API_KEY in .env");
      }
      if (/network|fetch|failed/i.test(error.message)) {
        throw new Error("Network error. Check your internet connection.");
      }
      throw new Error(`Generation failed: ${error.message}`);
    }
  }

  throw new Error("Generation failed after all retries.");
};

const STYLE_TITLES: Record<string, string[]> = {
  professional_email: ["Formal", "Business", "Corporate", "Executive", "Official", "Professional", "Formal Brief", "Business Note"],
  casual: ["Friendly", "Casual", "Relaxed", "Simple", "Easy", "Light", "Friendly Chat", "Quick Note"],
  creative: ["Creative", "Artistic", "Expressive", "Imaginative", "Innovative", "Fresh", "Unique", "Creative Spin"],
  marketing: ["Sales", "Promo", "Ad Copy", "Brand", "Marketing", "Engaging", "Persuasive", "Catchy"],
  academic: ["Scholarly", "Academic", "Research", "Formal", "Analytical", "Detailed", "Technical", "Scientific"],
  storytelling: ["Story", "Narrative", "Creative", "Descriptive", "Engaging", "Detailed", "Simple", "Vivid"],
};

const handleVariations = async (
  text: string,
  style: WritingStyle,
  format?: string
): Promise<{ variations: WritingVariation[] }> => {
  const formatHint = format ? `\nFormat type: ${format}` : "";
  const styleTitles = STYLE_TITLES[style] || STYLE_TITLES.professional_email;
  
  const prompt = `Transform the following text into 8 unique variations using the "${style}" writing style.${formatHint}
IMPORTANT: Preserve the original meaning and message. Only change the style/tone, not the content.
Each variation must have a short 1-2 word title that describes its tone. NO generic labels like "Variation 1".

Return ONLY a JSON array with this exact structure: 
[{"id": "1", "title": "Tone", "suggestedText": "...", "tone": "Tone description", "changes": [{"field": "style", "reason": "Description"}]}, ...]

Use these titles: ${styleTitles.join(", ")}

Original text: "${text}"
Writing style: ${style}
${formatHint}

Return ONLY valid JSON, no other text or explanations.`;

  const response = await callGeminiWithRetry(prompt, { temperature: 0.8, maxTokens: 4096 });

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const raw = JSON.parse(jsonMatch[0]);
      if (Array.isArray(raw) && raw.length > 0) {
        const variations: WritingVariation[] = raw.map((v: any, i: number) => ({
          id: String(v?.id ?? i + 1),
          label: v?.label ?? v?.title ?? styleTitles[i % styleTitles.length],
          suggestedText: v?.suggestedText ?? v?.text ?? text,
          tone: v?.tone ?? style.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          changes: Array.isArray(v?.changes) ? v.changes : [{ field: "style", reason: "Applied writing style variation" }],
        }));
        return { variations };
      }
    }
  } catch {
    // fallback below
  }

  return {
    variations: Array(8).fill(null).map((_, i) => ({
      id: `${i + 1}`,
      label: `Variation ${i + 1}`,
      suggestedText: text,
      tone: "Professional",
      changes: [{ field: "style", reason: "Applied writing style variation" }],
    })),
  };
};

const handleLengthVariations = async (
  text: string,
  lengths: string[] = ["short", "medium", "long", "detailed"]
): Promise<LengthVariations> => {
  const prompt = `Generate 5 variations of the following text in four lengths (ALL OUTPUT IN ENGLISH): 
- SHORT: Very concise (under 30 words)
- MEDIUM: Moderate length (30-60 words)  
- LONG: Detailed (60-100 words)
- DETAILED: Comprehensive (100-150 words)

IMPORTANT: All titles, labels, and content must be in English.

Text: "${text}"

Return ONLY a JSON object with this exact structure:
{
  "simple": [{"id": "s1", "text": "...", "wordCount": 20}, ...],
  "medium": [{"id": "m1", "text": "...", "wordCount": 45}, ...],
  "long": [{"id": "l1", "text": "...", "wordCount": 80}, ...],
  "detailed": [{"id": "d1", "text": "...", "wordCount": 120}, ...]
}

Each array should have exactly 5 variations. Return ONLY valid JSON.`;

  const response = await callGeminiWithRetry(prompt, { temperature: 0.7, maxTokens: 6144 });
  const wc = text.split(/\s+/).filter(Boolean).length;
  const def = { id: "1", text, wordCount: wc };

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        simple: Array.isArray(parsed.simple) && parsed.simple.length ? parsed.simple : [def],
        medium: Array.isArray(parsed.medium) && parsed.medium.length ? parsed.medium : [def],
        long: Array.isArray(parsed.long) && parsed.long.length ? parsed.long : [def],
        detailed: Array.isArray(parsed.detailed) && parsed.detailed.length ? parsed.detailed : [def],
      };
    }
  } catch {
    // fallback
  }

  return { simple: [def], medium: [def], long: [def], detailed: [def] };
};

const handleVisualContent = async (
  text: string,
  visualType: string
): Promise<VisualContent> => {
  const visualTypeHints: Record<string, string> = {
    diagram: "Create a clear flowchart or process diagram showing the main concepts and their relationships",
    flowchart: "Create a decision tree or process flow showing step-by-step progression",
    mindmap: "Create a hierarchical mind map showing central topic and branching ideas",
    timeline: "Create a chronological timeline showing events or phases in order",
    orgchart: "Create an organizational structure showing hierarchy and reporting lines",
    sequence: "Create a sequence diagram showing the order of interactions or steps",
  };
  
  const hint = visualTypeHints[visualType] || visualTypeHints.diagram;
  
  const prompt = `${hint} based on the following text. 

Text: "${text}"

IMPORTANT: 
1. The mermaidCode MUST use valid Mermaid syntax for ${visualType}
2. Use clear, descriptive labels that directly relate to the content
3. Include at least 3-5 nodes/elements for meaningful visualization
4. Use proper Mermaid graph types (graph TD, flowchart TB, mindmap, timeline, etc.)

Return ONLY a JSON object with this exact structure:
{
  "title": "Clear, descriptive title in English",
  "mermaidCode": "Valid Mermaid syntax here",
  "description": "Brief English description of what the diagram shows"
}

Return ONLY valid JSON, no explanations.`;

  const response = await callGeminiWithRetry(prompt, { temperature: 0.5, maxTokens: 2048 });
  const safeTitle = text.substring(0, 30).replace(/"/g, "'");

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.mermaidCode || parsed.title) {
        return {
          title: parsed.title || `${visualType} Diagram`,
          mermaidCode: parsed.mermaidCode || `graph TD\nA[${safeTitle}]-->B[Concept]`,
          description: parsed.description || "Visual representation",
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    title: `${visualType} Diagram`,
    mermaidCode: `graph TD\nA[${safeTitle}]-->B[Process]\nB-->C[End]`,
    description: "Basic diagram structure",
  };
};

const handleFormatConversion = async (
  text: string,
  format: string
): Promise<string> => {
  const formatDescriptions: Record<string, string> = {
    structured: "Convert to well-organized structured text with clear headings and paragraphs",
    marketing: "Rewrite as persuasive marketing copy with strong calls-to-action",
    blog: "Convert to engaging, reader-friendly blog style content",
    social: "Create short, punchy social media optimized content",
    visual: "Write detailed visual descriptions suitable for images/videos",
  };

  const prompt = `${formatDescriptions[format] || "Rewrite"} the following text:\n\n"${text}"\n\nReturn ONLY the converted text, no explanations.`;
  return callGeminiWithRetry(prompt, { temperature: 0.7, maxTokens: 2048 });
};

const handleTranslate = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translation.

Text: "${text}"

Translation:`;
  return callGeminiWithRetry(prompt, { temperature: 0.5, maxTokens: 2048 });
};

const handleRephrase = async (
  text: string,
  lengthType: string
): Promise<string> => {
  const instructions: Record<string, string> = {
    short: "Make very concise (under 30 words)",
    medium: "Keep moderate length (30-60 words)",
    long: "Expand with more details (60-100 words)",
    detailed: "Comprehensive expansion (100-150 words)",
  };
  const prompt = `Rephrase: ${instructions[lengthType] || instructions.medium}. Return ONLY rephrased text.

Text: "${text}"

Rephrased:`;
  return callGeminiWithRetry(prompt, { temperature: 0.7, maxTokens: 2048 });
};

export const getWritingVariations = async (
  text: string,
  style: WritingStyle,
  format?: string
): Promise<{ variations: WritingVariation[] }> => {
  return handleVariations(text, style, format);
};

export const getLengthVariations = async (
  text: string,
  lengths?: string[]
): Promise<LengthVariations> => {
  return handleLengthVariations(text, lengths);
};

export const generateVisualContent = async (
  text: string,
  visualType: "diagram" | "flowchart" | "mindmap" | "timeline" | "orgchart" | "sequence"
): Promise<VisualContent> => {
  return handleVisualContent(text, visualType);
};

export const convertFormat = async (
  text: string,
  format: string
): Promise<string> => {
  return handleFormatConversion(text, format);
};

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  return handleTranslate(text, targetLanguage);
};

export const rephraseText = async (
  text: string,
  lengthType: string
): Promise<string> => {
  return handleRephrase(text, lengthType);
};

export const generateContent = async (
  text: string,
  options: {
    style?: WritingStyle;
    lengths?: string[];
    formats?: string[];
    visualTypes?: string[];
  } = {}
): Promise<{
  variations?: WritingVariation[];
  lengthVariations?: LengthVariations;
  visualContent?: VisualContent[];
  formattedContent?: Record<string, string>;
}> => {
  const results: any = {};
  const tasks: Promise<any>[] = [];

  if (options.style) {
    tasks.push(
      getWritingVariations(text, options.style, options.formats?.[0]).then(r => {
        results.variations = r.variations;
      })
    );
  }

  if (options.lengths) {
    tasks.push(
      getLengthVariations(text, options.lengths).then(r => {
        results.lengthVariations = r;
      })
    );
  }

  if (options.visualTypes) {
    const visualTasks = options.visualTypes.map(type => 
      generateVisualContent(text, type as any)
    );
    tasks.push(
      Promise.all(visualTasks).then(r => {
        results.visualContent = r;
      })
    );
  }

  if (options.formats && options.formats.length > 1) {
    options.formats.slice(1).forEach(format => {
      tasks.push(
        convertFormat(text, format).then(r => {
          results.formattedContent = results.formattedContent || {};
          results.formattedContent[format] = r;
        })
      );
    });
  }

  await Promise.allSettled(tasks);
  return results;
};
