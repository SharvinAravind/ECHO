import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/echowrite';

const USER_STORAGE_KEY = 'echowrite_user';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load user:", e);
    }
  }, []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn("Failed to save user:", e);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to remove user:", e);
    }
  }, []);

  const upgradeToPremium = useCallback(() => {
    if (user) {
      const upgradedUser = { ...user, tier: 'premium' as const };
      setUser(upgradedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(upgradedUser));
      } catch (e) {
        console.warn("Failed to save upgraded user:", e);
      }
    }
  }, [user]);

  return {
    user,
    login,
    logout,
    upgradeToPremium
  };
};
