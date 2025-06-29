import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader, AlertTriangle, Check } from 'lucide-react';
import Button from './Button';
import { uploadImage, deleteImage, validateImageFile, createPreviewUrl, revokePreviewUrl, IMAGE_CONSTRAINTS } from '../../utils/imageUpload';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string | null) => void;
  folder?: 'questions' | 'options';
  placeholder?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  folder = 'questions',
  placeholder = 'Upload image',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const preview = createPreviewUrl(file);
    setPreviewUrl(preview);
    setIsUploading(true);

    try {
      // Upload image
      const result = await uploadImage(file, folder);
      
      if (result.success && result.url) {
        onImageUpload(result.url);
        // Keep preview until component unmounts or new image is selected
      } else {
        setError(result.error || 'Upload failed');
        revokePreviewUrl(preview);
        setPreviewUrl(null);
      }
    } catch (error: any) {
      setError(error.message || 'Upload failed');
      revokePreviewUrl(preview);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      // Try to delete from storage (don't block on failure)
      await deleteImage(currentImageUrl);
    }
    
    if (previewUrl) {
      revokePreviewUrl(previewUrl);
      setPreviewUrl(null);
    }
    
    onImageUpload(null);
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const displayImageUrl = previewUrl || currentImageUrl;
  const hasImage = Boolean(displayImageUrl);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${dragOver ? 'border-primary-orange bg-primary-orange/10' : 'border-primary-gray/50 hover:border-primary-orange/50'}
          ${hasImage ? 'p-2' : 'p-6'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!hasImage ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_CONSTRAINTS.allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {hasImage ? (
          /* Image Preview */
          <div className="relative group">
            <img
              src={displayImageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
              onError={() => setError('Failed to load image')}
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                className="bg-white/20 hover:bg-white/30"
              >
                <Upload size={16} />
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
              >
                <X size={16} />
                Remove
              </Button>
            </div>

            {/* Upload status indicators */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Loader size={20} className="animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                </motion.div>
              )}
              
              {!isUploading && currentImageUrl && !error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-2 right-2 bg-robotic-green rounded-full p-1"
                >
                  <Check size={12} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Upload Prompt */
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-gray/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              {isUploading ? (
                <Loader size={24} className="text-primary-orange animate-spin" />
              ) : (
                <ImageIcon size={24} className="text-primary-gray" />
              )}
            </div>
            
            <p className="text-primary-white font-medium mb-1">
              {isUploading ? 'Uploading...' : placeholder}
            </p>
            
            <p className="text-primary-gray text-sm mb-3">
              Drag & drop or click to browse
            </p>
            
            <div className="text-xs text-primary-gray space-y-1">
              <p>Max size: {IMAGE_CONSTRAINTS.maxSizeBytes / (1024 * 1024)}MB</p>
              <p>Formats: JPG, PNG, GIF</p>
              <p>Max dimensions: {IMAGE_CONSTRAINTS.maxWidth}x{IMAGE_CONSTRAINTS.maxHeight}</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto !p-1 hover:bg-red-500/20"
            >
              <X size={14} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button (when no image) */}
      {!hasImage && !isUploading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={openFileDialog}
          className="w-full border border-primary-gray/30 hover:border-primary-orange/50"
        >
          <Upload size={16} />
          Choose Image
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;