// hooks/theme-context.ts
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ───────── types ───────── */
export type AppTheme = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  inputBg: string;
  inputBorder: string;
  error: string;
  button: string;
  buttonText: string;
  placeholder: string;
  timestamp: string;
};
type ThemeMode = 'light' | 'dark';
interface ThemeContextType {
  theme: AppTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
}

/* ───────── palette ─────────
   Brand colour: indigo-600 (#6366F1) with teal accent.
   Greys: Tailwind’s neutral ramp → good contrast out-of-box             */
// Add this inside AppTheme type:

// Light theme
const lightTheme: AppTheme = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  subtext: '#64748B',
  inputBg: '#F1F5F9',
  inputBorder: '#CBD5E1',
  error: '#EF4444',
  button: '#3B82F6',
  buttonText: '#FFFFFF',
  placeholder: '#94A3B8',
  timestamp: '#94A3B8', // NEW - Slate gray (good for time inside bubble)
};

// Dark theme
const darkTheme: AppTheme = {
  background: '#0F172A',
  card: '#1E293B',
  text: '#E2E8F0',
  subtext: '#94A3B8',
  inputBg: '#1E293B',
  inputBorder: '#334155',
  error: '#F87171',
  button: '#60A5FA',
  buttonText: '#0F172A',
  placeholder: '#64748B',
  timestamp: '#CBD5E1', // NEW - Slightly brighter gray (good for dark)
};

/* ───────── provider ───────── */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  /* hydrate from storage or system */
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('appTheme');
      if (stored === 'dark' || stored === 'light') {
        setMode(stored);
      } else {
        setMode(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
      }
    })();
  }, []);

  const toggleTheme = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    AsyncStorage.setItem('appTheme', next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: mode === 'dark' ? darkTheme : lightTheme,
        mode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

/* ───────── hook ───────── */
export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
};
