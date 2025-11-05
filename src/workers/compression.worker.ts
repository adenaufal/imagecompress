// Web Worker for image compression
// This runs in a separate thread to avoid blocking the UI

interface CompressionMessage {
  type: 'compress';
  file: File;
  options: {
    quality: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'png' | 'webp';
  };
  id: string;
}

interface ProgressMessage {
  type: 'progress';
  id: string;
  progress: number;
}

interface ResultMessage {
  type: 'result';
  id: string;
  result: {
    blob: Blob;
    url: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    originalWidth: number;
    originalHeight: number;
  };
}

interface ErrorMessage {
  type: 'error';
  id: string;
  error: string;
}

type WorkerResponse = ProgressMessage | ResultMessage | ErrorMessage;

// Device detection utility
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  // In worker context, we don't have access to window
  // We'll use a default or receive it from the main thread
  return 'desktop';
};

// Get device-specific compression settings
const getDeviceCompressionSettings = (baseOptions: CompressionMessage['options']) => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'mobile':
      return {
        ...baseOptions,
        quality: Math.max(0.4, baseOptions.quality - 0.2),
        maxWidth: Math.min(baseOptions.maxWidth || 800, 800),
        maxHeight: Math.min(baseOptions.maxHeight || 600, 600),
      };
    case 'tablet':
      return {
        ...baseOptions,
        quality: Math.max(0.5, baseOptions.quality - 0.1),
        maxWidth: Math.min(baseOptions.maxWidth || 1200, 1200),
        maxHeight: Math.min(baseOptions.maxHeight || 900, 900),
      };
    default:
      return baseOptions;
  }
};

const compressImage = async (
  file: File,
  options: CompressionMessage['options'],
  id: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Report initial progress
    self.postMessage({
      type: 'progress',
      id,
      progress: 10,
    } as ProgressMessage);

    img.onload = async () => {
      try {
        // Image loaded
        self.postMessage({
          type: 'progress',
          id,
          progress: 30,
        } as ProgressMessage);

        // Store original dimensions
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Get device-specific settings
        const deviceSettings = getDeviceCompressionSettings(options);

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
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
        self.postMessage({
          type: 'progress',
          id,
          progress: 50,
        } as ProgressMessage);

        // Draw image
        ctx!.drawImage(img, 0, 0, width, height);

        // Drawing complete
        self.postMessage({
          type: 'progress',
          id,
          progress: 70,
        } as ProgressMessage);

        // Determine output format
        let outputFormat = 'image/jpeg';
        if (deviceSettings.format === 'png') outputFormat = 'image/png';
        if (deviceSettings.format === 'webp') outputFormat = 'image/webp';

        // Convert to blob
        const blob = await canvas.convertToBlob({
          type: outputFormat,
          quality: deviceSettings.quality,
        });

        // Encoding complete
        self.postMessage({
          type: 'progress',
          id,
          progress: 90,
        } as ProgressMessage);

        const compressionRatio = ((file.size - blob.size) / file.size) * 100;

        // Finalizing
        self.postMessage({
          type: 'progress',
          id,
          progress: 100,
        } as ProgressMessage);

        // Send result
        self.postMessage({
          type: 'result',
          id,
          result: {
            blob,
            url: URL.createObjectURL(blob),
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio,
            originalWidth,
            originalHeight,
          },
        } as ResultMessage);

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

// Listen for messages from the main thread
self.onmessage = async (e: MessageEvent<CompressionMessage>) => {
  const { type, file, options, id } = e.data;

  if (type === 'compress') {
    try {
      await compressImage(file, options, id);
    } catch (error) {
      self.postMessage({
        type: 'error',
        id,
        error: error instanceof Error ? error.message : 'Compression failed',
      } as ErrorMessage);
    }
  }
};

export {};
