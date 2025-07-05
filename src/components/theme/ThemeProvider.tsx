import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { mode, fontSize } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    // Apply theme mode
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(`${mode}-mode`);
    
    // Apply font size
    document.documentElement.style.fontSize = getFontSizeValue(fontSize);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        mode === 'dark' ? '#0A192F' : '#ffffff'
      );
    }
  }, [mode, fontSize]);

  return <>{children}</>;
};

// Helper function to get font size value
const getFontSizeValue = (size: string): string => {
  switch (size) {
    case 'medium':
      return '115%';
    case 'large':
      return '125%';
    case 'default':
    default:
      return '100%';
  }
};

export default ThemeProvider;