import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { themes, type ThemePalette } from '../lib/theme';

export type ThemeMode = 'dark' | 'light' | 'system';

type ThemeContextValue = {
  theme: ThemePalette;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  /** @deprecated use setMode instead */
  toggleTheme: () => void;
};

const ThemeCtx = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = 'yomy-ramadan-theme';

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
}

function loadThemeMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'dark';
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === 'dark' || v === 'light' || v === 'system') return v;
    // Migrate old boolean format
    if (v === 'true') return 'dark';
    if (v === 'false') return 'light';
  } catch {
    // ignore
  }
  return 'dark';
}

function saveThemeMode(m: ThemeMode): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_STORAGE_KEY, m);
  } catch {
    // ignore
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeRaw] = useState<ThemeMode>(loadThemeMode);
  const [systemDark, setSystemDark] = useState(getSystemDark);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemDark);
  const theme = isDark ? themes.dark : themes.light;

  const setMode = useCallback((m: ThemeMode) => {
    setModeRaw(m);
    saveThemeMode(m);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(isDark ? 'light' : 'dark');
  }, [isDark, setMode]);

  const value = useMemo(
    () => ({ theme, isDark, mode, setMode, toggleTheme }),
    [theme, isDark, mode, setMode, toggleTheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): ThemePalette {
  const ctx = useContext(ThemeCtx);
  if (!ctx) return themes.dark;
  return ctx.theme;
}

export function useThemeToggle() {
  const ctx = useContext(ThemeCtx);
  return ctx?.toggleTheme ?? (() => {});
}

export function useIsDark() {
  const ctx = useContext(ThemeCtx);
  return ctx?.isDark ?? true;
}

export function useThemeMode(): [ThemeMode, (m: ThemeMode) => void] {
  const ctx = useContext(ThemeCtx);
  return [ctx?.mode ?? 'dark', ctx?.setMode ?? (() => {})];
}
