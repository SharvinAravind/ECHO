# EchoWrite: Firebase Migration Guide

This project has been migrated from Supabase to Firebase for **Authentication** and **Cloud Functions** (Gemini API).

## 1. Setup Firebase Project

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project named **EchoWrite**.
3.  Enable **Authentication** and activate **Email/Password** and **Google** providers.
4.  Enable **Cloud Functions** (requires Blaze Plan, but starts with free limits).
5.  Go to Project Settings and add a **Web App** to get your Firebase configuration.

## 2. Update Environment Variables

Update your `.env` (or `.env.local`) with the values from your Firebase Project Settings:

```env
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

## 3. Setup Cloud Functions (Gemini API)

To deploy the Gemini API integration:

1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Initialize: `firebase init functions`
    -   Select **TypeScript**.
    -   Do **not** overwrite `package.json` if prompted (or just run it in a clean subfolder).
4.  Copy the contents of `firebase-setup/functions_index.ts.template` to `functions/src/index.ts`.
5.  Install `cross-fetch` if node version is < 18 (otherwise fetch is built-in).
6.  Set your Gemini API Key secret:
    ```bash
    firebase functions:secrets:set GEMINI_API_KEY
    # Enter: AIzaSyC3wZmi_IdPMdLSz86zLhL2zTTRjgLOSoQ
    ```
7.  Deploy: `firebase deploy --only functions`

## 4. Demo Login

The **"Login as Demo Admin"** button still works!
-   **Email**: `demo@echowrite.com`
-   **Password**: `password123`
-   **Important**: You must manually create this user in the **Firebase Authentication** dashboard for the button to work.

## 5. Summary of Changes

*   **Supabase Removed**: All Supabase client code and hooks have been replaced.
*   **useAuth**: Now uses `onAuthStateChanged` from Firebase.
*   **aiService**: Now uses `httpsCallable` from Firebase Functions to call the `echowrite` backend.
*   **Gemini API**: No longer called through Supabase Edge Functions. It is now routed through your Firebase Cloud Functions.
