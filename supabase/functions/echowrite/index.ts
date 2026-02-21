import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Valid enum values for strict validation
const VALID_ACTIONS = ['variations', 'translate', 'rephrase', 'length-variations', 'generate-visual'] as const;
const VALID_VISUAL_TYPES = ['diagram', 'flowchart', 'mindmap', 'timeline', 'orgchart', 'sequence'] as const;
const VALID_LENGTH_TYPES = ['simple', 'medium', 'long'] as const;
const VALID_STYLES = [
  'Improve Phrasing', 'Professional Email', 'Follow-Up Message', 'Resume/CV Optimizer',
  'Cover Letter', 'Client Proposal', 'Legal Draft', 'Marketing Copy', 'Sales Pitch',
  'Product Description', 'Landing Page Copy', 'Content Writing', 'Social Media Post',
  'Video/Reel Script', 'Humanizer', 'Simplify Language', 'Polite & Respectful',
  'Academic Writing', 'Technical Doc', 'Complaint/Request Letter', 'Negotiation Message',
  'Casual Message', 'Grammar Fix', 'Phrasing Improve', 'Creative Writing', 'Summary', 'Bullet Points'
] as const;

// Max string lengths for validation
const MAX_TEXT_LENGTH = 10000;
const MAX_STYLE_LENGTH = 100;
const MAX_LANGUAGE_LENGTH = 50;

interface WriteRequest {
  action: typeof VALID_ACTIONS[number];
  text: string;
  style?: string;
  targetLanguage?: string;
  lengthType?: typeof VALID_LENGTH_TYPES[number];
  visualType?: typeof VALID_VISUAL_TYPES[number];
}

// Sanitize string for use in prompts - removes control characters and limits length
function sanitizeString(input: string, maxLength: number): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()
    .slice(0, maxLength);
}

// Validate enum value against allowed list
function isValidEnum<T extends readonly string[]>(value: unknown, validValues: T): value is T[number] {
  return typeof value === 'string' && validValues.includes(value as T[number]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing authentication token" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the JWT by getting user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error("JWT validation failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log(`Authenticated request from user: ${userId}`);

    // Check user's usage limits from database
    const { data: usageData, error: usageError } = await supabase
      .rpc('get_user_usage', { _user_id: userId });

    if (usageError) {
      console.error("Usage check failed:", usageError.code);
      // Continue with request - usage tracking is non-blocking
    }

    const userUsage = usageData?.[0];
    
    // Check if user has exceeded their usage limit (premium users have no limit)
    if (userUsage && userUsage.role !== 'premium' && userUsage.usage_count >= userUsage.max_usage) {
      return new Response(
        JSON.stringify({ error: "Usage limit exceeded. Upgrade to premium for unlimited access." }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("API key configuration error");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let requestBody: WriteRequest;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, text, style, targetLanguage, lengthType, visualType } = requestBody;

    // Validate required fields
    if (!text || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate action enum
    if (!isValidEnum(action, VALID_ACTIONS)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize text input
    if (typeof text !== 'string' || text.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Text exceeds maximum allowed length" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const sanitizedText = sanitizeString(text, MAX_TEXT_LENGTH);

    // Validate optional enum fields
    if (visualType !== undefined && !isValidEnum(visualType, VALID_VISUAL_TYPES)) {
      return new Response(
        JSON.stringify({ error: "Invalid visual type" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (lengthType !== undefined && !isValidEnum(lengthType, VALID_LENGTH_TYPES)) {
      return new Response(
        JSON.stringify({ error: "Invalid length type" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize optional string parameters
    const sanitizedStyle = style ? sanitizeString(style, MAX_STYLE_LENGTH) : undefined;
    const sanitizedLanguage = targetLanguage ? sanitizeString(targetLanguage, MAX_LANGUAGE_LENGTH) : undefined;

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case 'variations':
        systemPrompt = `You are an elite writing suite with 20 writing style specializations.
Generate 8 distinct variations of the user's text for the goal: ${sanitizedStyle || 'Improve Phrasing'}.

Style-specific guidance:
- Professional Email: Include Subject Line, Greeting, Body, Closing
- Follow-Up Message: Confident reminders without being pushy
- Resume/CV Optimizer: ATS-friendly, achievement-focused
- Cover Letter: Role-specific, persuasive applications
- Client Proposal: Value-driven, scope-clear business proposals
- Legal Draft: Formal legal tone for notices, agreements, policies
- Marketing Copy: Benefit-focused, persuasive messaging
- Sales Pitch: Short, confident, objection-aware text
- Product Description: Convert features into buyer value
- Landing Page Copy: Headline → subtext → CTA structure
- Content Writing: Structured, readable long-form content
- Social Media Post: Platform-ready, engaging tone
- Video/Reel Script: Hook-based scripts for creators
- Humanizer: Remove robotic or AI-sounding text
- Simplify Language: Turn complex ideas into plain English
- Polite & Respectful: Fix messages that sound rude or harsh
- Academic Writing: Formal, structured, citation-ready tone
- Technical Doc: Clear, step-by-step explanations
- Complaint/Request Letter: Firm, professional, effective
- Negotiation Message: Salary, pricing, deadline negotiations

Return ONLY a valid JSON object with a 'variations' array. Each item has:
- 'id': unique string (v1, v2, v3, v4, v5, v6, v7, v8)
- 'label': e.g. 'Standard Polished', 'Formal', 'Friendly', 'Concise', 'Persuasive', 'Casual', 'Executive', 'Creative'
- 'suggestedText': the full refined text
- 'tone': short description of the tone
- 'changes': array of {field: string, reason: string} explaining key changes

IMPORTANT: Return ONLY the JSON, no markdown code blocks, no extra text.`;
        userPrompt = `Refine this text into 8 variations for "${sanitizedStyle || 'Improve Phrasing'}":\n\n${sanitizedText}`;
        break;

      case 'length-variations':
        systemPrompt = `You are an elite writing suite.
Generate 5 variations for each length type (simple, medium, long) of the user's text.

For SIMPLE: Create 5 short, concise versions (1-2 sentences each)
For MEDIUM: Create 5 moderate length versions (3-5 sentences each)
For LONG: Create 5 detailed, comprehensive versions (6+ sentences each)

Return ONLY a valid JSON object with this structure:
{
  "simple": [
    {"id": "s1", "text": "...", "wordCount": 10},
    {"id": "s2", "text": "...", "wordCount": 12},
    {"id": "s3", "text": "...", "wordCount": 8},
    {"id": "s4", "text": "...", "wordCount": 15},
    {"id": "s5", "text": "...", "wordCount": 11}
  ],
  "medium": [
    {"id": "m1", "text": "...", "wordCount": 40},
    {"id": "m2", "text": "...", "wordCount": 45},
    {"id": "m3", "text": "...", "wordCount": 38},
    {"id": "m4", "text": "...", "wordCount": 42},
    {"id": "m5", "text": "...", "wordCount": 50}
  ],
  "long": [
    {"id": "l1", "text": "...", "wordCount": 100},
    {"id": "l2", "text": "...", "wordCount": 120},
    {"id": "l3", "text": "...", "wordCount": 95},
    {"id": "l4", "text": "...", "wordCount": 110},
    {"id": "l5", "text": "...", "wordCount": 130}
  ]
}

IMPORTANT: Return ONLY the JSON, no markdown code blocks, no extra text.`;
        userPrompt = `Create 5 variations for each length type (simple, medium, long) of this text:\n\n${sanitizedText}`;
        break;

      case 'generate-visual':
        const visualPrompts: Record<string, string> = {
          diagram: `Create a simple Mermaid.js diagram representing the concepts in the text.
Use graph TD format. Keep node names simple (single words or short phrases, no special characters).
Example format:
graph TD
    A[Main Concept] --> B[Related Idea]
    A --> C[Another Idea]
    B --> D[Detail]`,
          flowchart: `Create a simple Mermaid.js flowchart showing the process or workflow.
Use flowchart TD format. Keep labels simple, avoid special characters.
Example format:
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
          mindmap: `Create a simple Mermaid.js mindmap with the main concept in the center.
Use mindmap format. Keep all text simple and short.
Example format:
mindmap
  root((Central Topic))
    Branch1
      SubBranch1
      SubBranch2
    Branch2
      SubBranch3
    Branch3`,
          timeline: `Create a simple Mermaid.js timeline showing events chronologically.
Use timeline format. Keep descriptions very short.
Example format:
timeline
    title Timeline
    section Phase 1
        Event1 : Description
        Event2 : Description
    section Phase 2
        Event3 : Description`
        };
        
        systemPrompt = `You are a visual content generator. ${visualPrompts[visualType || 'diagram']}

CRITICAL RULES:
1. Use ONLY simple alphanumeric characters and basic punctuation in node labels
2. Do NOT use quotes, apostrophes, or special characters in labels
3. Keep all labels short (2-4 words max)
4. Use simple node IDs like A, B, C or Step1, Step2
5. Always include the proper Mermaid syntax declaration at the start

Return ONLY a valid JSON object with this structure:
{
  "title": "A short descriptive title",
  "mermaidCode": "THE_MERMAID_CODE_HERE",
  "description": "Brief description of what this visual represents"
}

IMPORTANT: 
- The mermaidCode must be valid and renderable
- Return ONLY the JSON, no markdown code blocks
- Escape newlines properly in the JSON string`;
        userPrompt = `Generate a ${visualType || 'diagram'} for this content:\n\n${sanitizedText}`;
        break;

      case 'translate':
        systemPrompt = `You are a professional translator. Translate the given text to ${sanitizedLanguage || 'English'}. 
Keep the same tone, formatting, and meaning. Return ONLY the translated text, nothing else.`;
        userPrompt = sanitizedText;
        break;

      case 'rephrase':
        const rephrasePrompts: Record<string, string> = {
          simple: "Rewrite this text to be shorter and much simpler. Use plain language and be very concise.",
          medium: "Rewrite this text to be of moderate length. Ensure it is balanced, professional, and clear.",
          long: "Rewrite this text to be more detailed and comprehensive. Expand on the points while maintaining the same core message."
        };
        systemPrompt = rephrasePrompts[lengthType || 'medium'] + " Return ONLY the rephrased text, nothing else.";
        userPrompt = sanitizedText;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Increment usage count before processing (only if user has usage data)
    if (userUsage) {
      const { error: incrementError } = await supabase
        .rpc('increment_user_usage', { _user_id: userId });

      if (incrementError) {
        console.error("Usage increment failed");
      }
    }

    // Try primary model, fallback to secondary on failure
    const models = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
    let aiResponse = null;
    let lastError = "";

    for (const model of models) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          aiResponse = await response.json();
          break;
        }

        const errorText = await response.text().catch(() => '');
        lastError = `${response.status}: ${errorText}`;
        console.error(`Model ${model} failed:`, response.status);

        if (response.status === 429) {
          // Rate limited — try next model
          continue;
        }
        if (response.status === 402) {
          // Credits exhausted — try next model
          continue;
        }
        // Other errors — try next model
        continue;
      } catch (fetchErr) {
        console.error(`Fetch error for model ${model}:`, fetchErr);
        lastError = String(fetchErr);
        continue;
      }
    }

    if (!aiResponse) {
      console.error("All models failed. Last error:", lastError);
      return new Response(
        JSON.stringify({ error: "Service temporarily busy. Please try again in a moment." }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const content = aiResponse.choices?.[0]?.message?.content || "";

    let result;
    if (action === 'variations' || action === 'length-variations' || action === 'generate-visual') {
      try {
        // Clean the response - remove markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.slice(7);
        }
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith('```')) {
          cleanContent = cleanContent.slice(0, -3);
        }
        cleanContent = cleanContent.trim();
        
        result = JSON.parse(cleanContent);
        
        // For visual content, ensure mermaidCode has proper newlines
        if (action === 'generate-visual' && result.mermaidCode) {
          // Replace literal \n with actual newlines if needed
          result.mermaidCode = result.mermaidCode.replace(/\\n/g, '\n');
        }
      } catch {
        // Fallback responses for parse failures
        if (action === 'variations') {
          result = {
            variations: [{
              id: "v1",
              label: "Refined",
              suggestedText: content,
              tone: "Professional",
              changes: [{ field: "overall", reason: "AI-enhanced content" }]
            }]
          };
        } else if (action === 'length-variations') {
          result = {
            simple: [{ id: "s1", text: content.substring(0, 100), wordCount: 15 }],
            medium: [{ id: "m1", text: content.substring(0, 300), wordCount: 50 }],
            long: [{ id: "l1", text: content, wordCount: 100 }]
          };
        } else {
          // Generate a simple fallback diagram using sanitized text
          const safeLabel = sanitizedText.split(' ').slice(0, 3).join(' ').replace(/[^\w\s]/g, '');
          result = {
            title: "Generated Visual",
            mermaidCode: `graph TD\n    A[${safeLabel || 'Content'}] --> B[Analysis]\n    B --> C[Result]`,
            description: "Auto-generated diagram based on your content"
          };
        }
      }
    } else {
      result = { text: content };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Edge function error:", error instanceof Error ? error.message : "unknown");
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
