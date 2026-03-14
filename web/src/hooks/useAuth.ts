import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, AuthError } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserTier } from '@/types/echowrite';

const FREE_DAILY_LIMIT = 10;
const PREMIUM_DAILY_LIMIT = 99999;

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
  
  const usage = getDailyUsage();
  usage.count += 1;
  localStorage.setItem('echowrite_daily_usage', JSON.stringify(usage));
  return usage.count;
};

export const getRemainingUsage = (): { remaining: number; limit: number; isPremium: boolean } => {
  if (typeof window === 'undefined') return { remaining: 0, limit: FREE_DAILY_LIMIT, isPremium: false };
  
  const isPremium = roleToTier(null) === 'premium';
  const usage = getDailyUsage();
  const limit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
  
  return {
    remaining: Math.max(0, limit - usage.count),
    limit,
    isPremium
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

    // Check for pending redirect sign-in result (important for mobile)
    const checkPendingRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Google redirect sign-in successful');
        }
      } catch (error: any) {
        // Handle specific redirect errors
        if (error.code === 'auth/redirect-cancelled-by-user') {
          console.log('User cancelled redirect');
        } else if (error.code !== 'auth/no-auth-event') {
          console.error('Redirect sign-in error:', error);
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
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      if (isMobile) {
        // For mobile (Capacitor webview), use redirect instead of popup
        // Popup doesn't work well in webviews due to sessionStorage issues
        await signInWithRedirect(auth, provider);
        return { data: null, error: null };
      } else {
        // For web, use popup
        const userCredential = await signInWithPopup(auth, provider);
        return { data: userCredential, error: null };
      }
    } catch (error: any) {
      // Handle specific errors gracefully
      const errorCode = error.code;
      
      // These are not real errors - user cancelled
      if (errorCode === 'auth/popup-closed-by-user' ||
          errorCode === 'auth/redirect-cancelled-by-user' ||
          errorCode === 'auth/cancelled' ||
          errorCode === 'auth/no-auth-event') {
        return { data: null, error: null };
      }
      
      console.error('Google Sign-In Error:', errorCode, error.message);
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
