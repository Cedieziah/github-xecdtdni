import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Type, 
  Check, 
  RotateCcw,
  Eye
} from 'lucide-react';
import { RootState } from '../../store';
import { 
  setThemeMode, 
  setFontSize, 
  resetTheme,
  ThemeMode,
  FontSize
} from '../../store/slices/themeSlice';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ThemePreview from './ThemePreview';
import useTheme from '../../hooks/useTheme'; 
import toast from 'react-hot-toast';

const ThemeSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { mode, fontSize } = useSelector((state: RootState) => state.theme);
  const [previewMode, setPreviewMode] = useState<ThemeMode | null>(null);
  const [previewFontSize, setPreviewFontSize] = useState<FontSize | null>(null);
  const { updateGlobalThemeSettings } = useTheme(); 

  const handleThemeChange = (newMode: ThemeMode) => {
    setPreviewMode(newMode);
  };

  const handleFontSizeChange = (newSize: FontSize) => {
    setPreviewFontSize(newSize);
  };

  const applyChanges = async () => {
    if (previewMode && previewMode !== mode) {
      dispatch(setThemeMode(previewMode));
    }
    
    if (previewFontSize && previewFontSize !== fontSize) {
      dispatch(setFontSize(previewFontSize));
    }
    
    // If there are changes, update global settings
    if (previewMode !== mode || previewFontSize !== fontSize) {
      const success = await updateGlobalThemeSettings(
        previewMode || undefined,
        previewFontSize || undefined
      );
      
      if (success) {
        toast.success('Theme settings updated successfully for all users');
      }
    }
  };

  const cancelChanges = () => {
    setPreviewMode(null);
    setPreviewFontSize(null);
  };

  const resetSettings = () => {
    dispatch(resetTheme());
    setPreviewMode(null);
    setPreviewFontSize(null);
    toast.success('Theme settings reset to defaults');
  };

  const hasChanges = (previewMode !== null && previewMode !== mode) || 
                    (previewFontSize !== null && previewFontSize !== fontSize);

  // Determine which values to display in the preview
  const displayMode = previewMode !== null ? previewMode : mode;
  const displayFontSize = previewFontSize !== null ? previewFontSize : fontSize;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-primary-white">Theme Settings</h3>
      <p className="text-primary-gray">
        Customize the appearance of the platform for all users
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Mode Selection */}
        <Card className={`${mode === 'light' ? 'border-gray-200 shadow-sm' : ''}`}>
          <h4 className="text-lg font-semibold text-primary-white mb-4">
            Color Theme
          </h4>
          <div className="flex gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                displayMode === 'light'
                  ? 'border-primary-orange bg-primary-orange/10 shadow-sm'
                  : mode === 'light' 
                    ? 'border-gray-300 hover:border-primary-orange/50 shadow-sm' 
                    : 'border-primary-gray/30 hover:border-primary-orange/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Sun size={24} className="text-yellow-500" />
                </div>
                <span className={`font-medium ${
                  displayMode === 'light' ? 'text-primary-orange' : 'text-primary-white'
                }`}>
                  Light Mode
                </span>
              </div>
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                displayMode === 'dark'
                  ? 'border-primary-orange bg-primary-orange/10 shadow-sm'
                  : mode === 'light' 
                    ? 'border-gray-300 hover:border-primary-orange/50 shadow-sm' 
                    : 'border-primary-gray/30 hover:border-primary-orange/50'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary-dark rounded-full flex items-center justify-center">
                  <Moon size={24} className="text-robotic-blue" />
                </div>
                <span className={`font-medium ${
                  displayMode === 'dark' ? 'text-primary-orange' : 'text-primary-white'
                }`}>
                  Dark Mode
                </span>
              </div>
            </button>
          </div>
        </Card>

        {/* Font Size Selection */}
        <Card className={`${mode === 'light' ? 'border-gray-200 shadow-sm' : ''}`}>
          <h4 className="text-lg font-semibold text-primary-white mb-4">
            Font Size
          </h4>
          <div className="space-y-3">
            {[
              { id: 'default', label: 'Default', description: 'Standard text size' },
              { id: 'medium', label: 'Medium', description: '15% larger than default' },
              { id: 'large', label: 'Large', description: '25% larger than default' }
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => handleFontSizeChange(size.id as FontSize)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  displayFontSize === size.id
                    ? 'border-primary-orange bg-primary-orange/10 shadow-sm'
                    : mode === 'light' 
                      ? 'border-gray-300 hover:border-primary-orange/50 shadow-sm' 
                      : 'border-primary-gray/30 hover:border-primary-orange/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Type size={displayFontSize === size.id ? 24 : 20} className={
                    displayFontSize === size.id ? 'text-primary-orange' : 'text-primary-gray'
                  } />
                  <div className="text-left">
                    <p className={`font-medium ${
                      displayFontSize === size.id ? 'text-primary-orange' : 'text-primary-white'
                    }`}>
                      {size.label}
                    </p>
                    <p className="text-sm text-primary-gray">
                      {size.description}
                    </p>
                  </div>
                </div>
                {displayFontSize === size.id && (
                  <Check size={20} className="text-primary-orange" />
                )}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Preview Section */}
      {hasChanges ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`bg-primary-orange/10 ${mode === 'light' ? 'border-primary-orange/30 shadow-sm' : 'border-primary-orange/30'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-primary-white flex items-center gap-2">
                <Eye size={20} className="text-primary-orange" />
                Preview
              </h4>
              <div className="text-sm text-primary-gray">
                Changes will apply to all users
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${
              displayMode === 'light' 
                ? 'bg-white text-gray-800' 
                : 'bg-primary-black text-primary-white border border-primary-gray/30'
            }`}>
              <h5 className={`text-lg font-semibold mb-2 ${
                displayMode === 'light' ? 'text-gray-900' : 'text-primary-white'
              }`}>
                Sample Content
              </h5>
              <p className={`mb-3 ${
                displayMode === 'light' ? 'text-gray-700' : 'text-primary-gray'
              }`} style={{ 
                fontSize: displayFontSize === 'medium' ? '1.15rem' : 
                          displayFontSize === 'large' ? '1.25rem' : '1rem' 
              }}>
                This is how your content will appear with the selected theme settings.
                The font size and color scheme will be applied across the entire platform.
              </p>
              <div className="flex gap-2">
                <div className={`px-3 py-1 rounded ${
                  displayMode === 'light' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-robotic-blue/20 text-robotic-blue'
                }`}>
                  Sample Tag
                </div>
                <div className={`px-3 py-1 rounded ${
                  displayMode === 'light' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-robotic-green/20 text-robotic-green'
                }`}>
                  Another Tag
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <Card className={`${mode === 'light' ? 'border-gray-200 shadow-sm' : ''}`}>
          <h4 className="text-lg font-semibold text-primary-white mb-4">Current Theme Preview</h4>
          <ThemePreview mode={mode} fontSize={fontSize} />
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={resetSettings}
          className="text-red-400 hover:bg-red-500/20"
        >
          <RotateCcw size={16} />
          Reset to Defaults
        </Button>
        
        {hasChanges && (
          <>
            <Button variant="ghost" onClick={cancelChanges}>
              Cancel
            </Button>
            <Button variant="primary" onClick={applyChanges}>
              Apply Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ThemeSettings;