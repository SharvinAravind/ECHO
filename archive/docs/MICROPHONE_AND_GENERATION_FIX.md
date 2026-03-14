# 🎤 Microphone & Generation Fix Guide

## Issues Identified

### 1. Microphone Not Auto-Starting
**Problem:** The microphone is not automatically enabling when users access the application.

**Root Cause:** Missing auto-start logic in `EchoWrite.tsx`

### 2. Content Generation Failing  
**Problem:** "Failed to generate" errors for style, length, and visual content

**Root Cause:** AI service fallback may need enhancement or Gemini API key issues

---

## ✅ Solution 1: Auto-Start Microphone

### File to Modify: `src/pages/EchoWrite.tsx`

Add these state variables after line 43 (after `interimText` state):

```typescript
const [autoDictationEnabled, setAutoDictationEnabled] = useState(() => {
  // Load from localStorage or default to true
  try {
    const saved = localStorage.getItem('echowrite-auto-dictation');
    return saved ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
});
const [dictationAttempted, setDictationAttempted] = useState(false);
```

Add this effect after the dictation hook initialization (after line 112):

```typescript
// Auto-start dictation when component mounts or autoDictationEnabled changes
useEffect(() => {
  // Only attempt to start dictation once per session
  if (autoDictationEnabled && !dictationAttempted && !dictation.isDictating) {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      try {
        dictation.start();
        setDictationAttempted(true);
      } catch (error) {
        console.error('Failed to auto-start dictation:', error);
        setDictationAttempted(true); // Don't retry if it fails
      }
    }, 500);
    return () => clearTimeout(timer);
  }
}, [autoDictationEnabled]); // Only run when autoDictationEnabled changes

// Save auto-dictation preference
useEffect(() => {
  localStorage.setItem('echowrite-auto-dictation', JSON.stringify(autoDictationEnabled));
}, [autoDictationEnabled]);
```

### Add Toggle to Settings Panel

In `SettingsPanel.tsx`, add this prop to the interface (around line 43):

```typescript
autoDictationEnabled?: boolean;
onAutoDictationChange?: (enabled: boolean) => void;
```

Then add this row in the Voice Input section (after line 446):

```typescript
<SettingRow 
  label="Auto-start Dictation" 
  description="Automatically enable microphone on app load"
>
  <Switch 
    checked={autoDictationEnabled} 
    onCheckedChange={onAutoDictationChange} 
  />
</SettingRow>
```

In `EchoWrite.tsx`, add the toggle handler (around line 186):

```typescript
const toggleAutoDictation = (enabled: boolean) => {
  setAutoDictationEnabled(enabled);
  if (!enabled) {
    dictation.stop();
    toast.success("Auto-dictation disabled");
  } else {
    toast.success("Auto-dictation enabled - Microphone will start automatically");
    setDictationAttempted(false); // Allow re-start
  }
};
```

Pass the props to SettingsPanel (update the component call around line 454):

```typescript
<SettingsPanel 
  isOpen={settingsOpen} 
  onClose={() => setSettingsOpen(false)} 
  user={user} 
  currentTheme={currentTheme} 
  onThemeChange={setCurrentTheme} 
  onUpgrade={handleUpgrade} 
  onLogout={handleLogout}
  autoDictationEnabled={autoDictationEnabled}
  onAutoDictationChange={toggleAutoDictation}
/>
```

---

## ✅ Solution 2: Fix Content Generation

### Enhanced Error Messages in AI Service

The AI service already has fallback logic, but let's make the error messages more helpful.

In `src/services/aiService.ts`, update the error handling (around line 79):

```typescript
} catch (geminiError: any) {
  console.error("Direct Gemini API also failed:", geminiError.message);
  
  // More specific error messages
  let helpfulMessage = "Generation failed. ";
  
  if (geminiError.message.includes('API key')) {
    helpfulMessage += "Please check your Gemini API key configuration.";
  } else if (geminiError.message.includes('quota') || geminiError.message.includes('limit')) {
    helpfulMessage += "API quota exceeded. Please try again later.";
  } else if (geminiError.message.includes('network') || geminiError.message.includes('fetch')) {
    helpfulMessage += "Network error. Please check your internet connection.";
  } else if (geminiError.message.includes('parse') || geminiError.message.includes('JSON')) {
    helpfulMessage += "Failed to parse AI response. Please try again.";
  } else {
    helpfulMessage += geminiError.message;
  }
  
  throw new Error(helpfulMessage);
}
```

### Test Generation with Simple Prompts

Update the prompts in `aiService.ts` to be more reliable:

For **style variations** (around line 100), use this optimized prompt:

```typescript
const prompt = `You are a professional writing assistant. Transform the following text into exactly 8 different variations using the ${style} writing style.

Text to transform: "${text}"

Writing style: ${style}

Return ONLY a valid JSON array with this exact structure:
[
  {"id": "1", "label": "Professional Version", "suggestedText": "...", "tone": "Professional", "changes": [{"field": "style", "reason": "Applied professional tone"}]},
  {"id": "2", "label": "Casual Version", "suggestedText": "...", "tone": "Casual", "changes": [{"field": "style", "reason": "Applied casual tone"}]},
  ... (8 total variations)
]

Each variation must have unique content. Return ONLY the JSON array, no other text.`;
```

For **length variations** (around line 137), use this optimized prompt:

```typescript
const prompt = `Generate exactly 5 variations of the following text in three lengths.

Text: "${text}"

Create a JSON object with this exact structure:
{
  "simple": [
    {"id": "s1", "text": "...", "wordCount": 20},
    {"id": "s2", "text": "...", "wordCount": 25},
    {"id": "s3", "text": "...", "wordCount": 22},
    {"id": "s4", "text": "...", "wordCount": 28},
    {"id": "s5", "text": "...", "wordCount": 24}
  ],
  "medium": [
    {"id": "m1", "text": "...", "wordCount": 45},
    {"id": "m2", "text": "...", "wordCount": 50},
    {"id": "m3", "text": "...", "wordCount": 42},
    {"id": "m4", "text": "...", "wordCount": 48},
    {"id": "m5", "text": "...", "wordCount": 46}
  ],
  "long": [
    {"id": "l1", "text": "...", "wordCount": 80},
    {"id": "l2", "text": "...", "wordCount": 85},
    {"id": "l3", "text": "...", "wordCount": 78},
    {"id": "l4", "text": "...", "wordCount": 82},
    {"id": "l5", "text": "...", "wordCount": 79}
  ]
}

Simple versions should be under 30 words.
Medium versions should be 30-60 words.
Long versions should be 60-100 words.

Return ONLY the JSON object, no other text.`;
```

For **visual diagrams** (around line 176), use this optimized prompt:

```typescript
const prompt = `Create a Mermaid.js ${visualType} diagram based on the following text.

Text: "${text}"

Return ONLY a JSON object with this exact structure:
{
  "title": "Diagram Title",
  "mermaidCode": "graph TD\\nA[Start]-->B[Process]\\nB-->C[End]",
  "description": "Brief description of what the diagram shows"
}

The mermaidCode must be valid Mermaid syntax. Use proper escaping (\\\\n for newlines).
Return ONLY the JSON object, no other text.`;
```

---

## 🧪 Testing Procedures

### Test 1: Microphone Auto-Start

1. Open the application at http://localhost:8083
2. Log in with your account
3. **Expected:** Within 1-2 seconds, you should see:
   - Toast notification: "🎤 Microphone active. Start speaking!"
   - Recording indicator appears (red dot + "REC")
   - Timer starts counting
   - Voice wave animation visible
4. Speak something
5. **Expected:** Your words appear in the workspace in real-time

**If microphone doesn't start:**
- Check browser console (F12) for errors
- Look for "Failed to auto-start dictation" message
- Verify browser has microphone permission
- Try Chrome or Edge browser (best support)

### Test 2: Manual Microphone Control

1. Click the "Dictate" button in workspace
2. **Expected:** Microphone starts immediately
3. Speak and verify text appears
4. Click "Pause" button
5. **Expected:** Microphone pauses, timer stops
6. Click "Resume" button
7. **Expected:** Microphone resumes
8. Click "Stop" button
9. **Expected:** Microphone stops, UI clears

### Test 3: Voice Commands

While microphone is active, say clearly:

1. "**Stop dictation**" → Microphone should stop
2. "**Clear workspace**" → Text should clear
3. "**Open history**" → History sidebar opens
4. "**Generate content**" → Generation triggers

### Test 4: Style Variations Generation

1. Enter text: "The quick brown fox jumps over the lazy dog"
   OR speak this into the microphone
2. Select writing style: "Professional Email"
3. Press Enter key OR click "GENERATE ALL" button
4. **Expected Results:**
   - Loading state appears (5-15 seconds)
   - 8 variation cards display
   - Each card has:
     - Unique label (Variation 1, 2, 3...)
     - Different suggested text
     - Tone indicator
     - Changes explanation
   - Success toast: "Generated 8 variations!"
5. Click on any variation to select it
6. Click "Apply to Workspace" to use it

**If generation fails:**
- Check browser console for specific error
- Verify GEMINI_API_KEY in `.env`
- Run: `node test-gemini.js` to test API
- Check network tab for API response

### Test 5: Length Variations Panel

1. After generating style variations
2. Scroll to "Length Variations — Simple | Medium | Long" panel
3. Click "Generate Lengths" button
4. **Expected Results:**
   - Loading state (5-10 seconds)
   - Three tabs appear: Simple, Medium, Long
   - Each tab shows 5 variations (adjustable with slider)
   - Word counts display accurately
   - Slider adjusts count from 1-5
5. Click Simple tab → Short versions (~30 words)
6. Click Medium tab → Moderate versions (~45 words)
7. Click Long tab → Detailed versions (~80 words)
8. Adjust slider to show fewer/more variations
9. Click copy icon on any variation
10. **Expected:** Text copied to clipboard

**Additional features to test:**
- Translate button (select language first)
- PDF download button
- Share to WhatsApp/Email
- Apply to Workspace button

### Test 6: Visual Diagrams Generation

1. Enter descriptive text about a process:
   ```
   A software development process where requirements are gathered,
   design is created, code is written, tested, and deployed to production
   with continuous feedback loops.
   ```
2. Scroll to "Visual Content Creation" section
3. Click "Generate Visuals" button
4. **Expected Results:**
   - Loading state (10-20 seconds)
   - Multiple diagram types generated
   - Can switch between tabs:
     - 📊 Diagrams
     - 🔀 Flowcharts
     - 🧠 Mind Maps
     - ⏱️ Timelines
   - Mermaid diagrams render correctly
   - Titles and descriptions shown
5. Hover over any diagram
6. **Expected:** Action buttons appear (download, fullscreen)
7. Click download icon
8. **Expected:** SVG file downloads
9. Click fullscreen icon
10. **Expected:** Diagram opens in fullscreen modal

**If diagrams don't render:**
- Check browser console for Mermaid errors
- Verify text input is descriptive enough
- Try simpler text first
- Clear browser cache (Cmd+Shift+R)

### Test 7: Complete Workflow

Full integration test:

1. **Login** → Use email/password or Google sign-in
2. **Microphone auto-starts** → Verify within 1-2 seconds
3. **Dictate text:** "Artificial intelligence is transforming how we write and communicate in business"
4. **Stop dictation** → Say voice command or click stop
5. **Select style:** "Marketing Copy"
6. **Press Enter** → Generate style variations
7. **Verify:** 8 style variations appear
8. **Scroll down** → Click "Generate Lengths"
9. **Verify:** Length variations panel populated
10. **Click "Generate Visuals"** → Diagrams generate
11. **Verify:** All three sections working
12. **Select best variation** → Apply to workspace
13. **Translate** → Choose Spanish, translate
14. **Download** → Export as PDF

**Expected:** Smooth workflow with no errors

---

## 🔧 Debugging Tools

### Browser Console Tests

Open DevTools (F12) → Console tab:

```javascript
// Check if SpeechRecognition is available
console.log('SpeechRecognition:', window.SpeechRecognition || window.webkitSpeechRecognition);

// Check environment variables
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});
console.log('Gemini API Key configured:', !!import.meta.env.GEMINI_API_KEY);

// Manually test dictation start
const sr = window.SpeechRecognition || window.webkitSpeechRecognition;
if (sr) {
  const recognition = new sr();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (e) => console.log('Result:', e);
  recognition.start();
  console.log('Manual dictation started!');
} else {
  console.error('SpeechRecognition not supported in this browser');
}

// Test Gemini API directly
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + import.meta.env.GEMINI_API_KEY, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Say "Hello from EchoWrite!"' }] }]
  })
}).then(r => r.json()).then(d => console.log('Gemini Response:', d));
```

### Terminal Tests

```bash
# Test Gemini API connectivity
cd /Users/aravind/echo/New/Antigravity-ECHOWRITE/ECHOWRITE-1
node test-gemini.js

# Check .env file
cat .env | grep -E "(GEMINI|FIREBASE)"

# View browser network tab
# Look for failed requests to Firebase or Gemini API
```

### Network Tab Analysis

1. Open DevTools (F12) → Network tab
2. Clear existing logs
3. Click "GENERATE ALL" button
4. Look for requests to:
   - `firebasefunctions.com` (Firebase Functions)
   - `generativelanguage.googleapis.com` (Gemini API)
5. Check status codes:
   - ✅ 200 OK = Success
   - ❌ 403 Forbidden = API key issue
   - ❌ 503 Service Unavailable = API down
   - ❌ CORS errors = Configuration issue

---

## 🚨 Common Issues & Solutions

### Issue 1: "SpeechRecognition not defined"

**Cause:** Browser doesn't support Web Speech API

**Solution:**
- Use Chrome or Edge (best support)
- Firefox has limited support
- Safari has very poor support - avoid

### Issue 2: Microphone Permission Denied

**Cause:** Browser blocked microphone access

**Solution:**
1. Click lock icon in address bar
2. Allow microphone permission
3. Refresh page
4. Or manually grant in browser settings

**macOS Specific:**
- System Preferences → Security & Privacy → Microphone
- Ensure browser is checked
- Restart browser after enabling

### Issue 3: "Failed to auto-start dictation"

**Cause:** Trying to start before component ready

**Solution:** Already handled with 500ms delay and try-catch. Check console for specific error.

### Issue 4: Generation Returns Default/Fallback Content

**Cause:** Gemini API returned invalid JSON or failed

**Solution:**
1. Check API key validity: `node test-gemini.js`
2. Verify API has quota remaining
3. Check network connection
4. Review browser console for parsing errors

### Issue 5: "Generation failed" Toast

**Cause:** AI service threw an error

**Solution:**
1. Read the full error message in toast
2. Check browser console for detailed error
3. Verify API key in `.env`
4. Test with simple text first
5. Try different writing style

### Issue 6: Infinite Loading State

**Cause:** Generation promise never resolved/rejected

**Solution:**
1. Check network tab for hanging requests
2. Cancel request (click elsewhere)
3. Retry with simpler text
4. Check Firebase function logs if deployed

---

## 📊 Expected Performance Metrics

### Microphone Performance
- **Auto-start time:** < 1 second after page load
- **Permission prompt:** Immediate (if first time)
- **Voice-to-text latency:** < 500ms
- **Voice command recognition:** < 1 second

### Generation Performance
- **Style variations:** 5-15 seconds
- **Length variations:** 5-10 seconds
- **Visual diagrams:** 10-20 seconds
- **Translation:** 3-8 seconds
- **Success rate:** > 95% with fallback

### Resource Usage
- **Memory:** 150-250 MB (normal operation)
- **CPU:** < 10% idle, 30-50% during generation
- **Network:** ~50 KB requests, ~500 KB responses

---

## ✅ Success Criteria

All features working when:

### Microphone ✅
- [ ] Auto-starts within 1-2 seconds of login
- [ ] Toast notification appears
- [ ] Recording indicator visible
- [ ] Voice wave animates while speaking
- [ ] Text appears in real-time
- [ ] Voice commands recognized
- [ ] Pause/Resume/Stop work correctly
- [ ] Can manually start/stop anytime

### Style Variations ✅
- [ ] Generates exactly 8 variations
- [ ] Each variation has unique content
- [ ] Labels, tones, and changes displayed
- [ ] Can select and apply to workspace
- [ ] Works with both typed and spoken input
- [ ] No "failed to generate" errors

### Length Variations ✅
- [ ] Simple/Medium/Long tabs all work
- [ ] 5 variations per tab (adjustable)
- [ ] Accurate word counts displayed
- [ ] Slider adjusts count smoothly
- [ ] Copy/Translate/Download work
- [ ] Apply to workspace works
- [ ] No "failed to generate" errors

### Visual Diagrams ✅
- [ ] All 6 diagram types generate
- [ ] Mermaid code renders correctly
- [ ] Titles and descriptions shown
- [ ] Download SVG works
- [ ] Fullscreen mode works
- [ ] Based on user input content
- [ ] No "failed to generate" errors

### Overall UX ✅
- [ ] No console errors
- [ ] No network errors
- [ ] Toast notifications helpful
- [ ] Loading states clear
- [ ] Smooth animations
- [ ] Responsive on mobile
- [ ] No crashes or freezes

---

## 🎯 Quick Fix Checklist

If nothing is working, do this in order:

1. **Check .env file:**
   ```bash
   cat .env | grep GEMINI
   ```
   Should show your API key

2. **Test Gemini API:**
   ```bash
   node test-gemini.js
   ```
   Should show "✅ API Connection Successful!"

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for red errors
   - Fix whatever the first error is

4. **Verify microphone permission:**
   - Click lock icon in browser address bar
   - Ensure microphone is allowed

5. **Clear cache and restart:**
   ```bash
   # Stop dev server (Ctrl+C)
   # Clear browser cache (Cmd+Shift+R)
   npm run dev
   ```

6. **Check network tab:**
   - Open DevTools → Network
   - Look for failed requests
   - Fix CORS or API key issues

7. **Try different browser:**
   - Use Chrome or Edge
   - Avoid Safari for testing

---

## 📞 Support Resources

- **TESTING_GUIDE.md** - Comprehensive testing procedures
- **FIXES_APPLIED.md** - Technical implementation details
- **COMPLETE_FIX_SUMMARY.md** - Overall fix summary
- **QUICK_START.md** - Getting started guide

**Debug Commands:**
```bash
# Test API
node test-gemini.js

# View logs
firebase functions:log

# Redeploy functions
firebase deploy --only functions
```

---

**Status:** Ready for testing ✅  
**Estimated Fix Time:** 10-15 minutes  
**Confidence Level:** High
