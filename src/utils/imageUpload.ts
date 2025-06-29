import { supabase } from '../lib/supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

// Image validation constants
export const IMAGE_CONSTRAINTS = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  maxWidth: 1920,
  maxHeight: 1080,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
};

/**
 * Validates an image file against our constraints
 */
export const validateImageFile = async (file: File): Promise<ImageValidationResult> => {
  // Check file size
  if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes) {
    return {
      isValid: false,
      error: `Image size must be less than ${IMAGE_CONSTRAINTS.maxSizeBytes / (1024 * 1024)}MB`
    };
  }

  // Check file type
  if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPG, JPEG, PNG, and GIF images are allowed'
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!IMAGE_CONSTRAINTS.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'Invalid file extension. Use .jpg, .jpeg, .png, or .gif'
    };
  }

  // Check image dimensions
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width > IMAGE_CONSTRAINTS.maxWidth || dimensions.height > IMAGE_CONSTRAINTS.maxHeight) {
      return {
        isValid: false,
        error: `Image dimensions must be ${IMAGE_CONSTRAINTS.maxWidth}x${IMAGE_CONSTRAINTS.maxHeight} or smaller`
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Unable to read image file'
    };
  }

  return { isValid: true };
};

/**
 * Gets image dimensions from a file
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Generates a unique filename for uploaded images
 */
const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
  return `${timestamp}_${randomString}${extension}`;
};

/**
 * Uploads an image to Supabase storage
 */
export const uploadImage = async (
  file: File,
  folder: 'questions' | 'options' = 'questions'
): Promise<ImageUploadResult> => {
  try {
    // Validate the image first
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const filePath = `${folder}/${filename}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('imagemanager')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('imagemanager')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error: any) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
};

/**
 * Deletes an image from Supabase storage
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'imagemanager');
    
    if (bucketIndex === -1) {
      console.error('Invalid image URL format');
      return false;
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from('imagemanager')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image deletion error:', error);
    return false;
  }
};

/**
 * Creates a preview URL for a file (for immediate preview before upload)
 */
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revokes a preview URL to free up memory
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};