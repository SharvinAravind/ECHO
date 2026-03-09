# EchoWrite Generation Troubleshooting

## Root Cause Summary

Generation was failing due to:

1. **Firebase-first flow** — The app tried Firebase `httpsCallable` first, which fails because `echowrite` is an `onRequest` HTTP function, not an `onCall` callable. Every request waited for that failure before falling back to Gemini.
2. **API key not reaching client** — Vite only exposes env vars with `VITE_` prefix. `GEMINI_API_KEY` was not available at runtime.
3. **No retry logic** — Transient failures (429 rate limit, 503 overloaded) caused immediate errors.
4. **Rate limiting** — Visual generation sent 6 parallel Gemini requests, triggering 429s.

## Fixes Applied

- **Direct Gemini only** — Removed Firebase from the generation path for speed and reliability.
- **API key handling** — Added `VITE_GEMINI_API_KEY` to `.env`; `vite.config` injects it into the client.
- **Retries and model fallback** — Automatic retries on 429/503; fallback from `gemini-2.0-flash` to `gemini-1.5-flash` / `gemini-1.5-pro`.
- **Visual concurrency** — Limit to 2 concurrent visual API calls to avoid rate limits.
- **Clear error messages** — Errors now point to the specific fix (e.g., API key, network).

---

## Permanent Resolution Steps

### 1. API Key Missing / Invalid

**Symptom:** "API key missing" or "Invalid API key" / 401 / 403

**Fix:**
1. Get a free key: https://aistudio.google.com/apikey
2. Add to `.env`:
   ```
   VITE_GEMINI_API_KEY="your_key_here"
   GEMINI_API_KEY="your_key_here"
   ```
3. Restart dev server: `npm run dev`

### 2. Network Errors

**Symptom:** "Network error" / "fetch failed" / "ECONNRESET"

**Fix:**
- Check internet connection
- Confirm firewall/proxy allows `generativelanguage.googleapis.com`
- Try again after a short wait

### 3. Rate Limited (429)

**Symptom:** "Rate limited" or "429" errors

**Fix:**
- Wait 30–60 seconds before retrying
- Free tier has limited requests per minute
- Visual generation uses 2-at-a-time concurrency to reduce load

### 4. Empty / Blocked Response

**Symptom:** "No content generated" or blank output

**Fix:**
- Try different input text
- Avoid content that might trigger safety filters
- Ensure input is at least 3 characters

### 5. Still Failing After Above

1. Open browser DevTools → Console
2. Run: `console.log(!!import.meta.env.VITE_GEMINI_API_KEY, !!import.meta.env.GEMINI_API_KEY)`
   - Should show `true true` or at least one `true`
3. Run: `npm run build` and check for env-related errors
4. Confirm `.env` is in project root (not in `src/`)

---

## Verify Setup

```bash
# Check .env has the key
grep GEMINI .env

# Restart dev server
npm run dev
```

Then: enter text → click **GENERATE ALL** → all three sections (style, length, visual) should populate without errors.
