'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode, setDarkMode } = useUIStore();

  // On mount, read persisted preference or system preference
  useEffect(() => {
    const stored = localStorage.getItem('nfx-dark-mode');
    if (stored !== null) {
      setDarkMode(stored === 'true');
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, [setDarkMode]);

  // Sync data-theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return <>{children}</>;
}
