import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import toast from 'react-hot-toast';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { mode, fontSize } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    console.log(`Applying theme: ${mode} with font size ${fontSize}`);
    
    // Apply theme mode
    if (mode === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#F5F5F5';
    } else {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
      document.body.style.backgroundColor = '#0A192F';
    }
    
    // Apply font size
    document.documentElement.style.fontSize = getFontSizeValue(fontSize);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        mode === 'dark' ? '#0A192F' : '#ffffff'
      );
    } else {
      // Create meta theme-color if it doesn't exist
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = mode === 'dark' ? '#0A192F' : '#ffffff';
      document.head.appendChild(meta);
    }
    
    // Log theme change for debugging
    console.log(`Theme changed to ${mode} mode with font size ${fontSize}`);
    
    // Apply theme to toast notifications
    if (mode === 'light') {
      toast.dismiss(); // Clear any existing toasts
    }
  }, [mode, fontSize]);

  return <>{children}</>;
};

// Helper function to get font size value
const getFontSizeValue = (size: string): string => {
  switch (size) {
    case 'medium':
      return '112%';
    case 'large':
      return '120%';
    case 'default':
    default:
      return '100%';
  }
};

export default ThemeProvider;