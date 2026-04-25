'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import az from '@/messages/az';
import en from '@/messages/en';
import tr from '@/messages/tr';
import { Locale, User } from '@/lib/types';
import { removeCookie, setCookie } from '@/lib/utils';

const dictionaries = { az, en, tr };

type AppContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof az;
  user: User | null;
  token: string | null;
  setAuth: (payload: { user: User; token: string } | null) => void;
  isHydrated: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('az');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedLocale = (localStorage.getItem('azcon_locale') as Locale | null) ?? 'az';
    const raw = localStorage.getItem('azcon_auth');
    setLocaleState(storedLocale);
    if (raw) {
      const parsed = JSON.parse(raw) as { user: User; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
      setCookie('azcon_role', parsed.user.role);
      setCookie('azcon_token', parsed.token);
    }
    setIsHydrated(true);
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    localStorage.setItem('azcon_locale', nextLocale);
  };

  const setAuth = (payload: { user: User; token: string } | null) => {
    if (!payload) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('azcon_auth');
      removeCookie('azcon_role');
      removeCookie('azcon_token');
      return;
    }
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem('azcon_auth', JSON.stringify(payload));
    setCookie('azcon_role', payload.user.role);
    setCookie('azcon_token', payload.token);
  };

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale], user, token, setAuth, isHydrated }),
    [locale, user, token, isHydrated]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
