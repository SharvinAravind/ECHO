import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserTier } from '@/types/echowrite';

const roleToTier = (email?: string | null): UserTier => {
  if (email === 'demo@echowrite.com') return 'premium';
  // Promo code activation (SWEETY50, ECHOWRITE100) stored client-side
  if (typeof window !== 'undefined' && localStorage.getItem('echowrite_premium') === 'true') {
    return 'premium';
  }
  return 'free';
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  usageCount: number;
  maxUsage: number;
}

/** Dispatch from PaymentModal when user claims free promo to refresh auth tier */
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
    const name = email.split('@')[0] || 'User';

    const tier = roleToTier(email);
    return {
      id: user.uid,
      email: email,
      name: name,
      tier,
      usageCount: 0,
      maxUsage: tier === 'premium' ? 1000 : 10,
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

    return () => unsubscribe();
  }, [formatUserData, refreshFlag]);

  // Listen for promo activation to refresh tier without re-auth
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
    signOut
  };
};
