import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Type, Plus, Minus } from 'lucide-react';
import { RootState } from '../../store';
import { setFontSize, FontSize } from '../../store/slices/themeSlice';

interface FontSizeControlProps {
  showLabel?: boolean;
  compact?: boolean;
}

const FontSizeControl: React.FC<FontSizeControlProps> = ({ 
  showLabel = false,
  compact = false
}) => {
  const dispatch = useDispatch();
  const { fontSize } = useSelector((state: RootState) => state.theme);
  
  const handleFontSizeChange = (newSize: FontSize) => {
    dispatch(setFontSize(newSize));
  };
  
  const fontSizes: FontSize[] = ['default', 'medium', 'large'];
  const currentIndex = fontSizes.indexOf(fontSize);
  
  const decreaseFontSize = () => {
    if (currentIndex > 0) {
      handleFontSizeChange(fontSizes[currentIndex - 1]);
    }
  };
  
  const increaseFontSize = () => {
    if (currentIndex < fontSizes.length - 1) {
      handleFontSizeChange(fontSizes[currentIndex + 1]);
    }
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-primary-gray/20 rounded-lg p-1">
        <button
          onClick={decreaseFontSize}
          disabled={currentIndex === 0}
          className={`p-1 rounded ${
            currentIndex === 0 
              ? 'text-primary-gray/50 cursor-not-allowed' 
              : 'text-primary-white hover:bg-primary-gray/30'
          }`}
          aria-label="Decrease font size"
        >
          <Minus size={14} />
        </button>
        
        <div className="flex items-center px-1">
          <Type size={14} className="text-primary-white" />
        </div>
        
        <button
          onClick={increaseFontSize}
          disabled={currentIndex === fontSizes.length - 1}
          className={`p-1 rounded ${
            currentIndex === fontSizes.length - 1 
              ? 'text-primary-gray/50 cursor-not-allowed' 
              : 'text-primary-white hover:bg-primary-gray/30'
          }`}
          aria-label="Increase font size"
        >
          <Plus size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-primary-white text-sm">Font Size:</span>
      )}
      
      <div className="flex items-center gap-1 bg-primary-gray/20 rounded-lg p-1">
        <button
          onClick={decreaseFontSize}
          disabled={currentIndex === 0}
          className={`p-1 rounded ${
            currentIndex === 0 
              ? 'text-primary-gray/50 cursor-not-allowed' 
              : 'text-primary-white hover:bg-primary-gray/30'
          }`}
          aria-label="Decrease font size"
        >
          <Minus size={16} />
        </button>
        
        <div className="flex items-center gap-1 px-2">
          <Type size={16} className="text-primary-white" />
          <span className="text-primary-white text-sm">
            {fontSize === 'default' ? 'Default' : fontSize === 'medium' ? 'Medium' : 'Large'}
          </span>
        </div>
        
        <button
          onClick={increaseFontSize}
          disabled={currentIndex === fontSizes.length - 1}
          className={`p-1 rounded ${
            currentIndex === fontSizes.length - 1 
              ? 'text-primary-gray/50 cursor-not-allowed' 
              : 'text-primary-white hover:bg-primary-gray/30'
          }`}
          aria-label="Increase font size"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default FontSizeControl;