import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'dark' | 'light';
export type FontSize = 'default' | 'medium' | 'large';

interface ThemeState {
  mode: ThemeMode;
  fontSize: FontSize;
  isLoading: boolean;
  error: string | null;
}

// Get initial state from localStorage if available
const getInitialState = (): ThemeState => {
  if (typeof window !== 'undefined') {
    try {
      const savedTheme = localStorage.getItem('themeSettings');
      if (savedTheme) {
        return JSON.parse(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
    }
  }
  
  return {
    mode: 'dark',
    fontSize: 'default',
    isLoading: false,
    error: null
  };
};

const initialState: ThemeState = getInitialState();

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeSettings', JSON.stringify(state));
      }
    },
    setFontSize: (state, action: PayloadAction<FontSize>) => {
      state.fontSize = action.payload;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeSettings', JSON.stringify(state));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetTheme: (state) => {
      state.mode = 'dark';
      state.fontSize = 'default';
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('themeSettings', JSON.stringify(state));
      }
    }
  }
});

export const { 
  setThemeMode, 
  setFontSize, 
  setLoading, 
  setError, 
  resetTheme 
} = themeSlice.actions;

export default themeSlice.reducer;