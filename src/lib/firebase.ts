import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

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

// Only initialize analytics and emulators in browser
if (typeof window !== 'undefined') {
    getAnalytics(app);
    
    // Optional: Connect to emulators in development mode
    if (import.meta.env.DEV) {
        // Uncomment these lines if you want to use local emulators
        // connectAuthEmulator(auth, 'http://localhost:9099');
        // connectFunctionsEmulator(functions, 'http://localhost:5001', 'echowrite-pro');
    }
}

export default app;
