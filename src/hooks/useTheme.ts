import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setThemeMode, setFontSize } from '../store/slices/themeSlice';
import { supabase } from '../lib/supabase';

export const useTheme = () => {
  const dispatch = useDispatch();
  const { mode, fontSize } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Fetch global theme settings from the server
  useEffect(() => {
    const fetchGlobalThemeSettings = async () => {
      try {
        // Only fetch if user is authenticated
        if (!user) return;
        
        const { data, error } = await supabase.rpc('get_current_theme_settings');
        
        if (error) {
          console.error('Error fetching theme settings:', error);
          return;
        }
        
        if (data) {
          // Update Redux state with server settings
          if (data.theme_mode && data.theme_mode !== mode) {
            dispatch(setThemeMode(data.theme_mode));
          }
          
          if (data.font_size && data.font_size !== fontSize) {
            dispatch(setFontSize(data.font_size));
          }
        }
      } catch (error) {
        console.error('Error in fetchGlobalThemeSettings:', error);
      }
    };
    
    fetchGlobalThemeSettings();
  }, [user, dispatch]);
  
  // Function to update theme settings on the server
  const updateGlobalThemeSettings = async (newMode?: string, newFontSize?: string) => {
    try {
      // Only update if user is authenticated
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('update_theme_settings', {
        p_theme_mode: newMode || mode,
        p_font_size: newFontSize || fontSize
      });
      
      if (error) {
        console.error('Error updating theme settings:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateGlobalThemeSettings:', error);
      return false;
    }
  };
  
  return {
    mode,
    fontSize,
    updateGlobalThemeSettings
  };
};

export default useTheme;