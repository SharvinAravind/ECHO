import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const getAuthDomain = (): string => {
    const envDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    if (envDomain) return envDomain;
    
    if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'echowrite-pro-flame.vercel.app';
        }
        return window.location.hostname.includes('vercel.app') 
            ? window.location.hostname 
            : 'echowrite-pro-flame.vercel.app';
    }
    return 'echowrite-pro-flame.vercel.app';
};

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: getAuthDomain(),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize auth
export const auth = getAuth(app);

// Clear any tenant ID (use default Firebase project)
auth.tenantId = null;

// Set browser session persistence (default - clears when browser closes)
setPersistence(auth, browserSessionPersistence).catch(console.error);

// Initialize functions
export const functions = getFunctions(app);

// Only initialize analytics in browser (not needed for mobile app)
if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
    const isCapacitor = (window as any).Capacitor?.isNativePlatform?.() ?? false;
    if (!isCapacitor) {
        getAnalytics(app);
    }
}

export default app;
