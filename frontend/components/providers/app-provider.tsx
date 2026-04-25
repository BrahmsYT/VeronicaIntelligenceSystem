'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import az from '@/messages/az';
import en from '@/messages/en';
import tr from '@/messages/tr';
import { Locale, ThemePreset, User } from '@/lib/types';
import { removeCookie, setCookie } from '@/lib/utils';

const dictionaries = { az, en, tr };

const themePresets: ThemePreset[] = ['light', 'dark', 'ocean', 'neon', 'lava'];

type AppContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: ThemePreset;
  setTheme: (theme: ThemePreset) => void;
  themes: ThemePreset[];
  t: typeof az;
  user: User | null;
  token: string | null;
  setAuth: (payload: { user: User; token: string } | null, options?: { rememberMe?: boolean }) => void;
  isHydrated: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

function applyThemeToDocument(theme: ThemePreset) {
  const doc = (globalThis as any)?.document;
  if (!doc?.documentElement) return;
  doc.documentElement.dataset.theme = theme;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('az');
  const [theme, setThemeState] = useState<ThemePreset>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedLocale = (localStorage.getItem('azcon_locale') as Locale | null) ?? 'az';
    const storedTheme = (localStorage.getItem('azcon_theme') as ThemePreset | null) ?? 'dark';
    const raw = localStorage.getItem('azcon_auth') ?? sessionStorage.getItem('azcon_auth');
    const remembered = localStorage.getItem('azcon_remember_me') === 'true';
    setLocaleState(storedLocale);
    setThemeState(storedTheme);
    applyThemeToDocument(storedTheme);
    if (raw) {
      const parsed = JSON.parse(raw) as { user: User; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
      setCookie('azcon_role', parsed.user.role, remembered ? 7 : undefined);
      setCookie('azcon_token', parsed.token, remembered ? 7 : undefined);
      if (parsed.user.theme) {
        setThemeState(parsed.user.theme);
        applyThemeToDocument(parsed.user.theme);
      }
    }
    setIsHydrated(true);
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    localStorage.setItem('azcon_locale', nextLocale);
  };

  const setTheme = (nextTheme: ThemePreset) => {
    setThemeState(nextTheme);
    localStorage.setItem('azcon_theme', nextTheme);
    applyThemeToDocument(nextTheme);
  };

  const setAuth = (payload: { user: User; token: string } | null, options?: { rememberMe?: boolean }) => {
    if (!payload) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('azcon_auth');
      localStorage.removeItem('azcon_remember_me');
      sessionStorage.removeItem('azcon_auth');
      removeCookie('azcon_role');
      removeCookie('azcon_token');
      return;
    }

    const rememberMe = options?.rememberMe ?? true;

    setUser(payload.user);
    setToken(payload.token);
    if (rememberMe) {
      localStorage.setItem('azcon_auth', JSON.stringify(payload));
      localStorage.setItem('azcon_remember_me', 'true');
      sessionStorage.removeItem('azcon_auth');
    } else {
      sessionStorage.setItem('azcon_auth', JSON.stringify(payload));
      localStorage.removeItem('azcon_auth');
      localStorage.removeItem('azcon_remember_me');
    }

    setCookie('azcon_role', payload.user.role, rememberMe ? 7 : undefined);
    setCookie('azcon_token', payload.token, rememberMe ? 7 : undefined);
    if (payload.user.theme) setTheme(payload.user.theme);
  };

  const value = useMemo(
    () => ({ locale, setLocale, theme, setTheme, themes: themePresets, t: dictionaries[locale], user, token, setAuth, isHydrated }),
    [locale, theme, user, token, isHydrated]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
