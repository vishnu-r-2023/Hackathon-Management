import { useEffect } from 'react';
import { useUIStore } from '../store/store';

export const ThemeSync = () => {
  const darkMode = useUIStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!darkMode);
  }, [darkMode]);

  return null;
};

