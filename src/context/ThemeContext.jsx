import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

    // Update CSS variables
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--primary', '#90CAF9');
      root.style.setProperty('--secondary', '#FFD54F');
      root.style.setProperty('--background', '#121212');
      root.style.setProperty('--surface', '#1E1E1E');
      root.style.setProperty('--text', '#FFFFFF');
      root.style.setProperty('--text-secondary', '#B0B0B0');
      root.style.setProperty('--border', '#333333');
      root.style.setProperty('--success', '#66BB6A');
      root.style.setProperty('--warning', '#FFA726');
      root.style.setProperty('--error', '#EF5350');
    } else {
      root.style.setProperty('--primary', '#2196F3');
      root.style.setProperty('--secondary', '#FFC107');
      root.style.setProperty('--background', '#F5F7FA');
      root.style.setProperty('--surface', '#FFFFFF');
      root.style.setProperty('--text', '#212121');
      root.style.setProperty('--text-secondary', '#757575');
      root.style.setProperty('--border', '#E0E0E0');
      root.style.setProperty('--success', '#4CAF50');
      root.style.setProperty('--warning', '#FF9800');
      root.style.setProperty('--error', '#F44336');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
