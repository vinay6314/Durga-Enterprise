import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'midnight' | 'cyberpunk' | 'emerald' | 'amethyst' | 'sunset' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themeOptions: { id: Theme; label: string; color: string; gradient: string }[];
}

const themeOptions: { id: Theme; label: string; color: string; gradient: string }[] = [
  { id: 'midnight', label: 'Midnight Slate', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #a855f7)' },
  { id: 'cyberpunk', label: 'Cyber Neon', color: '#00f2fe', gradient: 'linear-gradient(135deg, #00f2fe, #f700a5)' },
  { id: 'emerald', label: 'Emerald Gold', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #f59e0b)' },
  { id: 'amethyst', label: 'Royal Amethyst', color: '#a855f7', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { id: 'sunset', label: 'Sunset Amber', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { id: 'light', label: 'Nordic Light', color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
];

const ThemeContext = createContext<ThemeContextType>({
  theme: 'midnight',
  setTheme: () => {},
  themeOptions,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('erp_theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('erp_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeOptions }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
