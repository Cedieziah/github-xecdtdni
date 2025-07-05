import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { RootState } from '../../store';
import { setThemeMode, ThemeMode } from '../../store/slices/themeSlice';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md',
  showLabel = false
}) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);
  
  const toggleTheme = () => {
    const newMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    dispatch(setThemeMode(newMode));
  };
  
  const sizeClasses = {
    sm: 'w-10 h-5',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  };
  
  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-primary-white text-sm">
          {mode === 'dark' ? 'Dark' : 'Light'} Mode
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={`relative ${sizeClasses[size]} rounded-full p-1 bg-primary-gray/30 focus:outline-none focus:ring-2 focus:ring-primary-orange`}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        <motion.div
          animate={{ 
            x: mode === 'dark' ? '0%' : '100%',
            backgroundColor: mode === 'dark' ? '#0A192F' : '#F5F5F5'
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 left-0.5 ${
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-7 h-7'
          } rounded-full flex items-center justify-center`}
        >
          {mode === 'dark' ? (
            <Moon size={iconSizes[size]} className="text-robotic-blue" />
          ) : (
            <Sun size={iconSizes[size]} className="text-yellow-500" />
          )}
        </motion.div>
      </button>
    </div>
  );
};

export default ThemeToggle;