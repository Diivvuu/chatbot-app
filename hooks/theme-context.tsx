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
const lightTheme: AppTheme = {
  background: '#F9FAFB', // gray-50
  card: '#FFFFFF', // white
  text: '#111827', // gray-900
  subtext: '#6B7280', // gray-500
  inputBg: '#F3F4F6', // gray-100
  inputBorder: '#E5E7EB', // gray-200
  error: '#EF4444', // red-500
  button: '#6366F1', // indigo-500
  buttonText: '#FFFFFF',
  placeholder: '#9CA3AF', // gray-400
};

const darkTheme: AppTheme = {
  background: '#0F172A', // gray-900
  card: '#1E293B', // gray-800
  text: '#F8FAFC', // gray-50
  subtext: '#94A3B8', // gray-400
  inputBg: '#334155', // gray-700
  inputBorder: '#475569', // gray-600
  error: '#F87171', // red-400
  button: '#22D3EE', // cyan-400 (teal accent pops on dark)
  buttonText: '#0F172A',
  placeholder: '#64748B', // gray-500
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
