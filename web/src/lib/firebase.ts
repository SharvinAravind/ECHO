import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize auth and functions
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Only initialize analytics in browser (not needed for mobile app)
if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
    // Only run analytics in browser, not in Capacitor webview
    const isCapacitor = window.Capacitor?.isNativePlatform?.() ?? false;
    if (!isCapacitor) {
        getAnalytics(app);
    }
}

export default app;
