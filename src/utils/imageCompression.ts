interface CompressionOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  onProgress?: (progress: number) => void;
}

interface CompressionResult {
  blob: Blob;
  url: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  originalWidth: number;
  originalHeight: number;
}

// Device detection utility
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Get device-specific compression settings
const getDeviceCompressionSettings = (baseOptions: CompressionOptions) => {
  const deviceType = baseOptions.deviceType || getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return {
        ...baseOptions,
        quality: Math.max(0.4, baseOptions.quality - 0.2), // More aggressive compression
        maxWidth: Math.min(baseOptions.maxWidth || 800, 800),
        maxHeight: Math.min(baseOptions.maxHeight || 600, 600)
      };
    case 'tablet':
      return {
        ...baseOptions,
        quality: Math.max(0.5, baseOptions.quality - 0.1), // Moderate compression
        maxWidth: Math.min(baseOptions.maxWidth || 1200, 1200),
        maxHeight: Math.min(baseOptions.maxHeight || 900, 900)
      };
    default: // desktop
      return baseOptions; // Preserve original quality for desktop
  }
};

export const compressImage = (
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Report initial progress
    options.onProgress?.(10);

    img.onload = () => {
      // Image loaded
      options.onProgress?.(30);

      // Store original dimensions
      const originalWidth = img.width;
      const originalHeight = img.height;

      // Get device-specific settings
      const deviceSettings = getDeviceCompressionSettings(options);

      // Calculate new dimensions
      let { width, height } = img;
      const maxWidth = deviceSettings.maxWidth || 1920;
      const maxHeight = deviceSettings.maxHeight || 1080;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Canvas ready
      options.onProgress?.(50);

      // Draw and compress
      ctx!.drawImage(img, 0, 0, width, height);

      // Drawing complete
      options.onProgress?.(70);

      // Determine output format
      let outputFormat = 'image/jpeg';
      if (deviceSettings.format === 'png') outputFormat = 'image/png';
      if (deviceSettings.format === 'webp') outputFormat = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }

          // Encoding complete
          options.onProgress?.(90);

          const compressionRatio = ((file.size - blob.size) / file.size) * 100;

          // Finalizing
          options.onProgress?.(100);

          resolve({
            blob,
            url: URL.createObjectURL(blob),
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio,
            originalWidth,
            originalHeight,
          });
        },
        outputFormat,
        deviceSettings.quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const downloadFile = (blob: Blob, filename: string, format: 'jpeg' | 'png' | 'webp') => {
  // Get file extension based on format
  const getExtension = (fmt: 'jpeg' | 'png' | 'webp') => {
    switch (fmt) {
      case 'jpeg': return '.jpg';
      case 'png': return '.png';
      case 'webp': return '.webp';
      default: return '.jpg';
    }
  };
  
  // Remove existing extension and add new one
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const finalFilename = nameWithoutExt + '_compressed' + getExtension(format);
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Copy image to clipboard
export const copyImageToClipboard = async (blob: Blob): Promise<void> => {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported');
    }
    
    const clipboardItem = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([clipboardItem]);
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    throw error;
  }
};

// Copy multiple images to clipboard
export const copyAllImagesToClipboard = async (blobs: Blob[]): Promise<void> => {
  try {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported');
    }
    
    const clipboardItems = blobs.map(blob => new ClipboardItem({ [blob.type]: blob }));
    
    // Copy images one by one since clipboard can only hold one item at a time
    for (const item of clipboardItems) {
      await navigator.clipboard.write([item]);
      // Small delay between copies
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Failed to copy images to clipboard:', error);
    throw error;
  }
};