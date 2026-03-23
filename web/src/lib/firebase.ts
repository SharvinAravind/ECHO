import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const getAuthDomain = (): string => {
    let envDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    
    if (envDomain) {
        envDomain = envDomain.trim().replace(/\s+/g, '');
        if (envDomain) return envDomain;
    }
    
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname.trim().replace(/\s+/g, '');
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'echowrite-pro.vercel.app';
        }
        if (hostname.includes('vercel.app')) {
            return hostname;
        }
        return 'echowrite-pro.vercel.app';
    }
    return 'echowrite-pro.vercel.app';
};

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
    authDomain: getAuthDomain(),
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim()
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
