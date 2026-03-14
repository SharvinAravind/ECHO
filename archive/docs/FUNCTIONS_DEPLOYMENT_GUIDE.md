# EchoWrite Firebase Functions Deployment Guide

## Quick Start (Recommended)

Run the automated deployment script:

```bash
./deploy-functions.sh
```

This script will guide you through the entire process.

---

## Manual Step-by-Step Deployment

### Step 1: Login to Firebase

```bash
firebase login
```

This will open your browser. Login with your Google account that has access to the `echowrite-pro` Firebase project.

### Step 2: Verify Project Configuration

Make sure you're using the correct Firebase project:

```bash
firebase use echowrite-pro
```

If the project doesn't exist, you'll need to create it first in the [Firebase Console](https://console.firebase.google.com/).

### Step 3: Set Gemini API Key as Secret

Securely store your Gemini API key:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

When prompted, paste your API key: `AIzaSyC3wZmi_IdPMdLSz86zLhL2zTTRjgLOSoQ`

**Important:** The key will be stored securely and never exposed in your code.

### Step 4: Build the Functions

```bash
cd functions
npm run build
cd ..
```

You should see "Build successful!" if TypeScript compilation succeeds.

### Step 5: Deploy to Firebase

```bash
firebase deploy --only functions:echowrite
```

This will:
1. Upload your function code to Firebase
2. Build the TypeScript code
3. Deploy the `echowrite` function
4. Provide you with a function URL

After successful deployment, you'll see output like:
```
✔  functions[echowrite(us-central1)] Successful create operation.
●  Function URL (echowrite): https://us-central1-echowrite-pro.cloudfunctions.net/echowrite
```

---

## Testing the Deployment

### Test via Terminal

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"variations","text":"Hello world","style":"Professional"}' \
  https://us-central1-echowrite-pro.cloudfunctions.net/echowrite
```

Replace the URL with your actual function URL.

### Test in the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:8080`

3. Try generating content - it should use the deployed Firebase Function

---

## Troubleshooting

### Function Returns 503 Error

**Check if function is deployed:**
```bash
firebase functions:list
```

**Check logs:**
```bash
firebase functions:log
```

**Common issues:**
- API key not set: `firebase functions:secrets:set GEMINI_API_KEY`
- Function failed to build: Check TypeScript errors in build output
- Network timeout: Retry deployment

### CORS Errors

The function already includes CORS headers. If you see CORS errors:
1. Clear your browser cache
2. Check browser console for specific error messages
3. Verify the function URL matches what's in your frontend config

### Build Errors

If TypeScript compilation fails:
```bash
cd functions
npm install
npm run build
```

Check for TypeScript errors in the output.

### Function Timeout

If generation times out (Gemini API can be slow):
1. Go to Firebase Console → Functions
2. Click on `echowrite`
3. Increase timeout to 60 seconds

Or update the function configuration in `src/index.ts`:
```typescript
export const echowrite = functions
  .region('us-central1')
  .runWith({ timeoutSeconds: 60 })
  .https.onRequest(...)
```

Then redeploy.

---

## Monitoring & Maintenance

### View Logs

```bash
firebase functions:log
```

Filter to just your function:
```bash
firebase functions:log --only echowrite
```

### Update Function

After making changes to `functions/src/index.ts`:

```bash
npm --prefix functions run build
firebase deploy --only functions:echowrite
```

### Delete Function

```bash
firebase functions:delete echowrite
```

---

## Cost Estimation

Firebase Cloud Functions **free tier** includes:
- ✅ 2 million invocations/month
- ✅ 400,000 GB-seconds compute time
- ✅ 200,000 CPU-seconds

**Typical EchoWrite usage** (10-20 generations/day):
- ~600 invocations/month
- Well within free tier limits!

**Gemini API costs:**
- Free tier: 60 requests/minute
- Paid tier: $0.0002 per 1K tokens

Estimated monthly cost for moderate usage: **FREE** 🎉

---

## Security Checklist

✅ API key stored as Firebase secret (not hardcoded)  
✅ CORS enabled for all origins (restrict in production)  
✅ Input validation on all requests  
✅ Error handling prevents information leakage  
✅ HTTPS-only communication  
✅ No sensitive data in logs  

---

## Next Steps After Deployment

1. ✅ **Test Generation Features**
   - Style variations
   - Length variations
   - Visual content (diagrams)
   - Translation
   - Rephrasing

2. ✅ **Verify Microphone**
   - Auto-start should work on page load
   - Voice-to-text should transcribe accurately
   - Voice commands should work

3. ✅ **Monitor Usage**
   - Check Firebase Console for function invocations
   - Monitor Gemini API usage
   - Set up billing alerts (if needed)

4. ✅ **Production Hardening** (Optional)
   - Restrict CORS to your domain only
   - Add rate limiting
   - Implement user quotas
   - Add request logging

---

## Support

**Firebase Documentation:**
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Function Secrets](https://firebase.google.com/docs/functions/config-env#secret-parameters)

**Gemini API Documentation:**
- [Gemini API Reference](https://ai.google.dev/api)

**Need Help?**
Check the logs first: `firebase functions:log`
