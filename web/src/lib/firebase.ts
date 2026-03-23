import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Firebase configuration
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

// Initialize auth - only in browser
let auth: ReturnType<typeof getAuth> | null = null;

if (typeof window !== "undefined") {
    auth = getAuth(app);
    
    // Clear any tenant ID (use default Firebase project)
    auth.tenantId = null;
    
    // Set browser session persistence BEFORE any auth operations
    setPersistence(auth, browserSessionPersistence).catch((error) => {
        console.error("Firebase persistence error:", error);
    });
}

// Initialize functions
export const functions = getFunctions(app);

// Only initialize analytics in browser (not needed for mobile app)
if (typeof window !== "undefined") {
    const isCapacitor = (window as any).Capacitor?.isNativePlatform?.() ?? false;
    if (!isCapacitor && app) {
        try {
            getAnalytics(app);
        } catch (e) {
            console.log("Analytics not available");
        }
    }
}

export { app, auth };
export default app;
