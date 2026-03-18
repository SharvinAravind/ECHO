import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserTier } from '@/types/echowrite';

const FREE_DAILY_LIMIT = 10;
const PREMIUM_DAILY_LIMIT = 99999;
const TRIAL_LIMIT = 5;
const TRIAL_AFTER_SIGNUP = 10;

export const isTrialUser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('echowrite_trial_used') === 'true';
};

export const getTrialCount = (): number => {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem('echowrite_trial_count');
  return count ? parseInt(count, 10) : 0;
};

export const incrementTrialCount = (): number => {
  if (typeof window === 'undefined') return 0;
  const count = getTrialCount();
  const newCount = count + 1;
  localStorage.setItem('echowrite_trial_count', newCount.toString());
  return newCount;
};

export const setTrialAfterSignup = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('echowrite_trial_count', TRIAL_AFTER_SIGNUP.toString());
  localStorage.setItem('echowrite_trial_used', 'true');
};

export const clearTrial = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('echowrite_trial_used');
  localStorage.removeItem('echowrite_trial_count');
};

// Check if running in Capacitor native platform
const isNativePlatform = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.() || 
         /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const roleToTier = (email?: string | null): UserTier => {
  if (email === 'demo@echowrite.com') return 'premium';
  if (typeof window !== 'undefined' && localStorage.getItem('echowrite_premium') === 'true') {
    return 'premium';
  }
  return 'free';
};

const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getDailyUsage = (): { date: string; count: number } => {
  if (typeof window === 'undefined') return { date: getTodayKey(), count: 0 };
  
  const stored = localStorage.getItem('echowrite_daily_usage');
  const today = getTodayKey();
  
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) {
      return data;
    }
  }
  
  return { date: today, count: 0 };
};

export const incrementUsage = (): number => {
  if (typeof window === 'undefined') return 0;
  
  // If in trial mode, decrement trial count instead of daily usage
  if (isTrialUser()) {
    return incrementTrialCount();
  }
  
  const usage = getDailyUsage();
  usage.count += 1;
  localStorage.setItem('echowrite_daily_usage', JSON.stringify(usage));
  return usage.count;
};

export const getRemainingUsage = (): { remaining: number; limit: number; isPremium: boolean; isTrial: boolean } => {
  if (typeof window === 'undefined') return { remaining: 0, limit: FREE_DAILY_LIMIT, isPremium: false, isTrial: false };
  
  const isPremium = roleToTier(null) === 'premium';
  const isTrial = isTrialUser();
  const usage = getDailyUsage();
  
  let limit: number;
  let remaining: number;
  
  if (isTrial) {
    const trialCount = getTrialCount();
    limit = trialCount;
    remaining = Math.max(0, trialCount);
  } else if (isPremium) {
    limit = PREMIUM_DAILY_LIMIT;
    remaining = Math.max(0, limit - usage.count);
  } else {
    limit = FREE_DAILY_LIMIT;
    remaining = Math.max(0, limit - usage.count);
  }
  
  return {
    remaining,
    limit,
    isPremium,
    isTrial
  };
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  usageCount: number;
  maxUsage: number;
}

export const dispatchPremiumActivated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('echowrite-premium-activated'));
  }
};

export const useAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const formatUserData = useCallback((user: any) => {
    if (!user) return null;

    const email = user.email || '';
    const name = user.displayName || email.split('@')[0] || 'User';

    const tier = roleToTier(email);
    const usage = getDailyUsage();
    const limit = tier === 'premium' ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
    
    return {
      id: user.uid,
      email: email,
      name: name,
      tier,
      usageCount: usage.count,
      maxUsage: limit,
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setAuthUser(formatUserData(user));
      } else {
        setAuthUser(null);
      }
      setLoading(false);
    });

    // Check for pending redirect sign-in result (important for mobile & Vercel)
    const checkPendingRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Google redirect sign-in successful');
          // Dispatch event to notify components
          window.dispatchEvent(new CustomEvent('google-signin-success'));
        }
      } catch (error: any) {
        // Handle specific redirect errors
        if (error.code === 'auth/redirect-cancelled-by-user' || 
            error.code === 'auth/popup-closed-by-user') {
          console.log('User cancelled redirect');
        } else if (error.code === 'auth/no-auth-event') {
          // This is normal - no pending redirect
        } else if (error.code === 'auth/unauthorized-domain') {
          console.error('Domain not authorized in Firebase Console');
        } else {
          console.error('Redirect sign-in error:', error.code, error.message);
        }
      }
    };
    
    checkPendingRedirect();

    return () => unsubscribe();
  }, [formatUserData, refreshFlag]);

  useEffect(() => {
    const handler = () => setRefreshFlag((f) => f + 1);
    window.addEventListener('echowrite-premium-activated', handler);
    return () => window.removeEventListener('echowrite-premium-activated', handler);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setTrialAfterSignup();
      return { data: userCredential, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { data: userCredential, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const isMobile = isNativePlatform();
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log('Google Sign-In starting...', { isMobile, isLocalhost, hostname: window.location.hostname });
      
      if (isMobile || isLocalhost) {
        // For mobile and localhost, use redirect instead of popup
        // Popup doesn't work well in webviews due to sessionStorage issues
        await signInWithRedirect(auth, provider);
        return { data: null, error: null };
      } else {
        // For web (production), try popup first, fallback to redirect
        try {
          const userCredential = await signInWithPopup(auth, provider);
          setTrialAfterSignup();
          return { data: userCredential, error: null };
        } catch (popupError: any) {
          // If popup fails (e.g., blocked by popup blocker), use redirect
          if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
            console.log('Popup blocked, falling back to redirect...');
            await signInWithRedirect(auth, provider);
            return { data: null, error: null };
          }
          throw popupError;
        }
      }
    } catch (error: any) {
      // Handle specific errors gracefully
      const errorCode = error.code;
      const errorMessage = error.message;
      
      console.error('Google Sign-In Error:', errorCode, errorMessage);
      
      // These are not real errors - user cancelled
      if (errorCode === 'auth/popup-closed-by-user' ||
          errorCode === 'auth/redirect-cancelled-by-user' ||
          errorCode === 'auth/cancelled' ||
          errorCode === 'auth/no-auth-event') {
        return { data: null, error: null };
      }
      
      // Log helpful messages for common errors
      if (errorCode === 'auth/unauthorized-domain') {
        console.error('Domain not authorized. Add to Firebase Console > Authentication > Sign-in method > Google > Authorized domains');
      } else if (errorCode === 'auth/operation-not-allowed') {
        console.error('Google Sign-In not enabled. Enable in Firebase Console > Authentication > Sign-in method > Google');
      }
      
      return { data: null, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem('echowrite_history');
      localStorage.removeItem('echowrite_user');
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }, []);

  return {
    user: firebaseUser,
    authUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };
};
