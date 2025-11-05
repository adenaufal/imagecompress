import { useState, useEffect, useCallback } from 'react';

export interface HistorySession {
  id: string;
  timestamp: number;
  images: {
    fileName: string;
    originalSize: number;
    compressedSize?: number;
    compressionRatio?: number;
  }[];
  settings: {
    quality: number;
    maxWidth: number;
    format: 'jpeg' | 'png' | 'webp';
  };
}

const STORAGE_KEY = 'imagecompress_history';
const MAX_HISTORY_ITEMS = 20;

export const useCompressionHistory = () => {
  const [history, setHistory] = useState<HistorySession[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistorySession[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }, [history]);

  const addSession = useCallback(
    (
      images: Array<{
        file: File;
        result?: {
          compressedSize: number;
          compressionRatio: number;
        };
      }>,
      settings: {
        quality: number;
        maxWidth: number;
        format: 'jpeg' | 'png' | 'webp';
      }
    ) => {
      const session: HistorySession = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        images: images.map((img) => ({
          fileName: img.file.name,
          originalSize: img.file.size,
          compressedSize: img.result?.compressedSize,
          compressionRatio: img.result?.compressionRatio,
        })),
        settings,
      };

      setHistory((prev) => {
        const newHistory = [session, ...prev];
        // Keep only the most recent MAX_HISTORY_ITEMS
        return newHistory.slice(0, MAX_HISTORY_ITEMS);
      });

      return session.id;
    },
    []
  );

  const deleteSession = useCallback((id: string) => {
    setHistory((prev) => prev.filter((session) => session.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getSession = useCallback(
    (id: string) => {
      return history.find((session) => session.id === id);
    },
    [history]
  );

  return {
    history,
    addSession,
    deleteSession,
    clearHistory,
    getSession,
  };
};
