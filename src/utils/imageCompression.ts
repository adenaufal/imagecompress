interface CompressionOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
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

export const compressImage = (
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Store original dimensions
      const originalWidth = img.width;
      const originalHeight = img.height;
      
      // Calculate new dimensions
      let { width, height } = img;
      const maxWidth = options.maxWidth || 1920;
      const maxHeight = options.maxHeight || 1080;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx!.drawImage(img, 0, 0, width, height);

      // Determine output format
      let outputFormat = 'image/jpeg';
      if (options.format === 'png') outputFormat = 'image/png';
      if (options.format === 'webp') outputFormat = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }

          const compressionRatio = ((file.size - blob.size) / file.size) * 100;

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
        options.quality
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