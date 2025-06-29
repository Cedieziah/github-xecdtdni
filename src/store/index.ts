import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import examSlice from './slices/examSlice';
import adminSlice from './slices/adminSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    exam: examSlice,
    admin: adminSlice,
    ui: uiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;