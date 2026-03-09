# 🚀 EchoWrite - Quick Start Guide

## Your Application is Ready! ✅

The development server is running at: **http://localhost:8081**

Click the preview button above to open the application.

---

## Immediate Testing (Works Now!)

### 1. Test Microphone ⭐
- The microphone should **auto-start** when the app loads
- You'll see: "🎤 Microphone active. Start speaking!"
- Speak and watch your words appear in real-time
- Use voice commands:
  - **"Stop dictation"** - Stop microphone
  - **"Clear workspace"** - Clear all text
  - **"Open history"** - View history panel
  - **"Generate content"** - Trigger AI generation

### 2. Test Voice-to-Text
- Click the microphone button if not auto-started
- Speak naturally
- Your voice converts to text instantly
- Interim results show as fading text
- Final results commit to workspace

### 3. Test Authentication
- Create an account or use demo login
- **Demo credentials:**
  - Email: `demo@echowrite.com`
  - Password: `password123`
- Demo account has Premium tier unlocked

---

## Deploy Firebase Functions (For Full Features)

To enable all AI generation features, deploy the Cloud Functions:

### Option A: Automated Script (Recommended)
```bash
./deploy-functions.sh
```

This script handles everything automatically.

### Option B: Manual Steps

**Step 1: Login to Firebase**
```bash
firebase login
```
Opens browser for Google authentication.

**Step 2: Set API Key Secret**
```bash
firebase functions:secrets:set GEMINI_API_KEY
```
When prompted, paste: `AIzaSyC3wZmi_IdPMdLSz86zLhL2zTTRjgLOSoQ`

**Step 3: Build & Deploy**
```bash
npm --prefix functions run build
firebase deploy --only functions:echowrite
```

This takes 2-5 minutes. After deployment:
- All generation features work perfectly
- No more fallback errors
- Professional-grade AI content generation

---

## What Works Without Deployment?

✅ **Fully Functional:**
- Voice dictation & microphone
- Voice commands
- Authentication
- UI navigation
- Theme switching
- History tracking
- Settings panel

⚠️ **Uses Fallback Mode (Still Works!):**
- Style variations
- Length variations  
- Visual diagrams
- Translation
- Rephrasing

The fallback mode uses direct Gemini API calls, so generation still works even without deployed functions!

---

## What Requires Deployment?

🔒 **Needs Firebase Functions:**
- Reliable, production-ready generation
- Faster response times
- Better error handling
- Usage tracking
- Rate limiting

Without deployment, these features use the local fallback which may occasionally timeout or fail.

---

## Troubleshooting

### Microphone Not Working?
1. Allow microphone permission in browser
2. Use Chrome or Edge (best support)
3. Check System Preferences → Security & Privacy → Microphone

### Generation Failing?
Check console for errors. The app automatically falls back to direct Gemini API if Firebase Functions aren't deployed.

### Need Help?
See detailed guides:
- `DEPLOYMENT_STATUS.md` - Current status & checklist
- `FUNCTIONS_DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `FIREBASE_GUIDE.md` - Firebase setup basics

---

## Testing Checklist

After opening the app:

- [ ] Page loads successfully
- [ ] Microphone auto-starts (or click to start)
- [ ] Speak and see text appear
- [ ] Try voice commands
- [ ] Sign in or use demo account
- [ ] Enter some text manually
- [ ] Click "GENERATE ALL" button
- [ ] Check if variations generate
- [ ] Try different writing styles
- [ ] View length variations panel
- [ ] Generate visual diagrams
- [ ] Change theme in settings
- [ ] Toggle snow effect
- [ ] Open/close history sidebar

---

## Next Steps

1. **Test the application** using the preview button
2. **Deploy Firebase Functions** for full functionality
3. **Monitor logs** after deployment: `firebase functions:log`
4. **Enjoy professional AI content generation!** 🎉

---

## Quick Commands Reference

```bash
# Start development server
npm run dev

# Deploy functions
./deploy-functions.sh

# Test Gemini API
node test-gemini.js

# View function logs
firebase functions:log

# Redeploy functions
firebase deploy --only functions

# Build functions only
npm --prefix functions run build
```

---

**Your app is live and ready to test! 🎊**

Click the preview button above to get started!
