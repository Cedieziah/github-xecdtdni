import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import examSlice from './slices/examSlice';
import adminSlice from './slices/adminSlice';
import uiSlice from './slices/uiSlice';
import themeSlice from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    exam: examSlice,
    admin: adminSlice,
    ui: uiSlice,
    theme: themeSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;