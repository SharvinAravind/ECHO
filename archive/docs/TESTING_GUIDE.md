# 🎯 Testing Guide - EchoWrite Fixes

## Quick Test Procedure (5 minutes)

### Step 1: Start the Application
```bash
npm run dev
```
The app should start on http://localhost:8081

---

### Step 2: Test Authentication

#### Test Email/Password Sign-Up
1. On login screen, click "Don't have an account? Sign up"
2. Enter email: `test@example.com`
3. Enter password: `TestPass123!`
4. Click "Create Account"
5. ✅ **Expected:** Success toast, redirected to main app
6. ❌ **If error:** Check Firebase Console → Authentication → Users

#### Test Email/Password Sign-In
1. Log out (Settings → Logout)
2. Enter same credentials
3. Click "Sign In"
4. ✅ **Expected:** Welcome back message

#### Test Google Sign-In
1. Click "Continue with Google" button
2. Select a Google account
3. ✅ **Expected:** Successfully signed in
4. ❌ **If "unauthorized domain" error:**
   - Go to Firebase Console
   - Authentication → Settings → Authorized domains
   - Add `localhost` and `127.0.0.1`

---

### Step 3: Test Microphone (Auto-Start)

1. After logging in
2. ✅ **Expected:** Microphone starts automatically
3. ✅ **Expected:** Toast shows "🎤 Microphone active. Start speaking!"
4. ✅ **Expected:** Recording indicator appears with timer
5. Speak something
6. ✅ **Expected:** Your words appear in workspace

**Voice Commands Test:**
- Say "**Stop dictation**" → Microphone should stop
- Say "**Clear workspace**" → Text should clear
- Say "**Open history**" → History sidebar opens

---

### Step 4: Test Content Generation

#### Test Style Variations ⭐

**Input Text:**
```
The quick brown fox jumps over the lazy dog
```

**Steps:**
1. Enter text above in workspace
2. Select writing style: "Professional Email"
3. Press Enter or click "GENERATE ALL"
4. Wait for generation (2-5 seconds)

**✅ Expected Results:**
- 8 variation cards appear
- Each has unique label: "Variation 1", "Variation 2", etc.
- Different text content in each
- Tone indicator shown
- Changes explanation provided
- Can click to select any variation
- "Apply to Workspace" button works

**❌ If Fails:**
- Check browser console for errors
- Verify GEMINI_API_KEY in `.env`
- Run: `node test-gemini.js` to test API directly

#### Test Length Variations Panel

**After generating style variations:**
1. Scroll to "Length Variations — Simple | Medium | Long" panel
2. Click "Generate Lengths" button
3. Wait for generation

**✅ Expected Results:**
- Three tabs appear: Simple, Medium, Long
- Each tab has 5 variations (adjustable with slider)
- Word counts differ between lengths
- Slider adjusts number of visible variations (1-5)
- Can copy, translate, download as PDF
- "Apply to Workspace" works

**Test Each Tab:**
- **Simple:** Short versions (~30 words)
- **Medium:** Moderate length (~45 words)
- **Long:** Detailed versions (~80 words)

#### Test Visual Diagrams

**Input Text:**
```
A software development process where requirements are gathered, 
design is created, code is written, tested, and deployed to production
with continuous feedback loops.
```

**Steps:**
1. Enter text above
2. Scroll to "Visual Content Creation" section
3. Click "Generate Visuals" button
4. Wait for generation

**✅ Expected Results:**
- Multiple diagram types generated
- Can switch between tabs:
  - 📊 Diagrams
  - 🔀 Flowcharts  
  - 🧠 Mind Maps
  - ⏱️ Timelines
- Mermaid diagrams render correctly
- Can click to fullscreen
- Can download SVG
- Title and description shown for each

**Test Download:**
1. Hover over any diagram
2. Click download icon
3. ✅ SVG file should download

#### Test Translation

**After generating any variation:**
1. Select a language from dropdown (e.g., Spanish 🇪🇸)
2. Click translate button (Languages icon)
3. ✅ **Expected:** Text translates to selected language
4. ✅ **Expected:** Word count updates

#### Test Rephrasing

**With text in workspace:**
1. Generate length variations
2. Select Simple/Medium/Long tab
3. Click generate
4. ✅ **Expected:** New version with adjusted length

---

### Step 5: Test All Features Integration

**Complete Workflow Test:**

1. **Login** with email/password
2. **Enable microphone** (should auto-start)
3. **Dictate text:** "Artificial intelligence is transforming how we write and communicate"
4. **Stop dictation** (voice command or button)
5. **Select style:** "Marketing Copy"
6. **Press Enter** to generate
7. ✅ Verify 8 style variations appear
8. ✅ Verify length variations panel populated
9. ✅ Click "Generate Visuals"
10. ✅ Verify diagrams render
11. **Select best variation** and apply to workspace
12. **Translate** to another language
13. **Download** as PDF

---

## Debugging Tools

### Browser Console Commands

Open DevTools (F12) and check Console tab for:

```javascript
// Check if environment variables loaded
console.log(import.meta.env.VITE_FIREBASE_API_KEY);
console.log(import.meta.env.GEMINI_API_KEY);

// Test Gemini API directly
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + 'YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Say hello!' }] }]
  })
}).then(r => r.json()).then(console.log);
```

### Terminal Tests

```bash
# Test Gemini API connectivity
node test-gemini.js

# Check Firebase configuration
firebase functions:list

# View logs (if functions deployed)
firebase functions:log --only echowrite
```

---

## Common Issues & Quick Fixes

### Issue 1: "Failed to generate" Error

**Symptoms:**
- Red error toast when clicking Generate
- No variations appear

**Quick Fix:**
```bash
# 1. Verify API key exists
grep GEMINI_API_KEY .env

# 2. Test API directly
node test-gemini.js

# 3. Check internet connection
ping google.com
```

**If API key invalid:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Update `.env` file
4. Restart dev server

### Issue 2: Microphone Not Auto-Starting

**Symptoms:**
- No microphone icon animation
- No recording indicator

**Quick Fix:**
1. Check browser permissions (lock icon in address bar)
2. Allow microphone access
3. Refresh page
4. Manually click microphone button

**macOS Specific:**
- System Preferences → Security & Privacy → Microphone
- Ensure browser is checked

### Issue 3: Google Sign-In Domain Error

**Error Message:**
"The current domain is not authorized to use this service."

**Fix:**
1. Visit [Firebase Console](https://console.firebase.google.com/project/echowrite-pro/authentication/providers)
2. Click "Sign-in method" tab
3. Select "Google"
4. Scroll to "Authorized domains"
5. Add:
   - `localhost`
   - `127.0.0.1`
   - Your production domain (if applicable)
6. Save changes
7. Wait 1 minute
8. Refresh browser

### Issue 4: Diagrams Not Rendering

**Symptoms:**
- Empty boxes instead of diagrams
- Loading spinner forever

**Fix:**
1. Check browser console for Mermaid errors
2. Verify text input is descriptive enough
3. Try simpler text first
4. Clear browser cache (Cmd+Shift+R)

### Issue 5: Variations Show Default Text

**Symptoms:**
- All 8 variations identical
- Same as input text

**Cause:**
- Gemini API returned unparsable JSON
- Fallback to defaults activated

**Fix:**
1. Check network tab in DevTools
2. Look at Gemini API response
3. Verify API key has quota remaining
4. Try again with different text

---

## Performance Benchmarks

### Expected Load Times

| Action | Expected Time | Notes |
|--------|--------------|-------|
| Page Load | < 2 seconds | First load |
| Microphone Start | < 1 second | Auto or manual |
| Voice Recognition | Real-time | < 500ms latency |
| Style Generation | 5-15 seconds | Via Gemini API |
| Length Variations | 5-10 seconds | 15 total variations |
| Visual Diagrams | 10-20 seconds | 6 diagram types |
| Translation | 3-8 seconds | Per language |

### Resource Usage

- **Memory:** ~150-200 MB (normal)
- **CPU:** < 10% (idle), 30-50% (during generation)
- **Network:** ~50 KB requests, ~500 KB responses

---

## Success Criteria Checklist

Use this to verify everything works:

### Authentication ✅
- [ ] Email signup works
- [ ] Email signin works
- [ ] Google signin works
- [ ] Password reset works
- [ ] Demo button removed
- [ ] Proper error messages shown

### Microphone ✅
- [ ] Auto-starts on load
- [ ] Manual start/stop works
- [ ] Pause/resume works
- [ ] Timer displays correctly
- [ ] Voice wave animates
- [ ] Interim text fades
- [ ] Final text commits
- [ ] Voice commands recognized

### Style Variiations ✅
- [ ] Generates 8 variations
- [ ] Each variation unique
- [ ] Labels display correctly
- [ ] Tone indicators shown
- [ ] Changes explained
- [ ] Can select variations
- [ ] Apply to workspace works

### Length Variations ✅
- [ ] Simple tab works
- [ ] Medium tab works
- [ ] Long tab works
- [ ] Slider adjusts count (1-5)
- [ ] Word counts accurate
- [ ] Copy button works
- [ ] Translate button works
- [ ] PDF download works
- [ ] Share options work

### Visual Diagrams ✅
- [ ] Diagrams tab renders
- [ ] Flowcharts tab renders
- [ ] Mind maps tab renders
- [ ] Timelines tab renders
- [ ] Fullscreen mode works
- [ ] SVG download works
- [ ] Titles/descriptions shown

### Overall UX ✅
- [ ] No console errors
- [ ] Toast notifications helpful
- [ ] Loading states clear
- [ ] Error messages actionable
- [ ] Responsive on mobile
- [ ] Smooth animations
- [ ] No crashes/freezes

---

## Report Template

If you encounter issues, use this template:

```
**Issue:** [Brief description]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [etc.]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Environment:**
- Browser: [Chrome/Firefox/Safari/etc.]
- OS: [Windows/Mac/Linux]
- URL: [localhost:8081 or production URL]

**Console Errors:**
[Paste any errors from browser console]

**Screenshots:**
[Attach if applicable]

**Tried Solutions:**
[What you've already tried]
```

---

## Next Steps After Testing

### If Everything Passes:
1. ✅ Deploy Firebase Functions for production
2. ✅ Set up monitoring and logging
3. ✅ Configure rate limiting
4. ✅ Add analytics tracking

### If Issues Found:
1. Document in issue tracker
2. Check FIXES_APPLIED.md for context
3. Review implementation in aiService.ts
4. Test with debug tools above

---

**Testing Status:** Ready for QA ✅  
**Last Updated:** Current session  
**Estimated Test Time:** 5-10 minutes
