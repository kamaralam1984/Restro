'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light' | 'colorblind';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'restro-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Initial load: read from localStorage or prefers-color-scheme
    try {
      const stored = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) : null;
      if (stored === 'dark' || stored === 'light' || stored === 'colorblind') {
        setThemeState(stored);
        applyThemeClass(stored);
        return;
      }
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const initial: ThemeMode = prefersDark ? 'dark' : 'light';
      setThemeState(initial);
      applyThemeClass(initial);
    }
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // ignore
      }
    }
    applyThemeClass(mode);
  };

  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'colorblind' : 'dark');
  };

  const value: ThemeContextValue = { theme, setTheme, cycleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function applyThemeClass(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light', 'theme-colorblind');
  if (mode === 'dark') root.classList.add('theme-dark');
  if (mode === 'light') root.classList.add('theme-light');
  if (mode === 'colorblind') root.classList.add('theme-colorblind');
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

