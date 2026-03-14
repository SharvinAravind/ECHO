import { useState, useEffect, useCallback } from 'react';
import { HistoryItem, WritingVariation, WritingStyle } from '@/types/echowrite';

const STORAGE_KEY = 'echowrite_history';
const MAX_HISTORY_ITEMS = 10;

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load history:", e);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveHistory = useCallback((items: HistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save history:", e);
    }
  }, []);

  const addToHistory = useCallback((
    originalText: string,
    style: WritingStyle,
    variations: WritingVariation[]
  ) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      originalText,
      style,
      variations
    };

    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear history:", e);
    }
  }, []);

  return {
    history,
    addToHistory,
    clearHistory
  };
};
