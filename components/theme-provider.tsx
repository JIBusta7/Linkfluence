'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'linkfluence-theme';

// Script que corre antes del render para evitar el flash de tema incorrecto
// (FOUC = flash of unstyled content). Se inyecta en el <head> del layout
// via dangerouslySetInnerHTML para que se ejecute sincrónicamente antes
// que React hidrate.
export const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // En el primer mount sincronizamos con el localStorage / prefers-color-scheme
  useEffect(() => {
    const stored = (typeof window !== 'undefined' &&
      localStorage.getItem(STORAGE_KEY)) as Theme | null;
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored);
      return;
    }
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }
  }, []);

  // Aplicamos la clase al <html> cada vez que cambia el tema
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // privacy mode o cookies bloqueadas — no rompemos
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Si se usa fuera del provider, devolvemos defaults no-op
    return {
      theme: 'light',
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
