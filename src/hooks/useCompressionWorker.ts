import { useEffect, useRef, useCallback } from 'react';

interface CompressionOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
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

interface PendingCompression {
  resolve: (result: CompressionResult) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export const useCompressionWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingCompression>>(new Map());
  const supportsWorker = useRef<boolean>(typeof Worker !== 'undefined');

  useEffect(() => {
    // Only create worker if supported
    if (!supportsWorker.current) return;

    try {
      // Create the worker
      workerRef.current = new Worker(
        new URL('../workers/compression.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Handle messages from worker
      workerRef.current.onmessage = (e) => {
        const { type, id, progress, result, error } = e.data;

        const pending = pendingRef.current.get(id);
        if (!pending) return;

        switch (type) {
          case 'progress':
            pending.onProgress?.(progress);
            break;

          case 'result':
            pending.resolve(result);
            pendingRef.current.delete(id);
            break;

          case 'error':
            pending.reject(new Error(error));
            pendingRef.current.delete(id);
            break;
        }
      };

      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        // Reject all pending compressions
        pendingRef.current.forEach((pending) => {
          pending.reject(new Error('Worker error'));
        });
        pendingRef.current.clear();
      };
    } catch (error) {
      console.error('Failed to create worker:', error);
      supportsWorker.current = false;
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingRef.current.clear();
    };
  }, []);

  const compressImage = useCallback(
    (file: File, options: CompressionOptions): Promise<CompressionResult> => {
      return new Promise((resolve, reject) => {
        // If worker not supported, fall back to main thread compression
        if (!supportsWorker.current || !workerRef.current) {
          // Import and use the original compression function
          import('../utils/imageCompression').then(({ compressImage: mainThreadCompress }) => {
            mainThreadCompress(file, options)
              .then(resolve)
              .catch(reject);
          });
          return;
        }

        // Generate unique ID for this compression
        const id = `${Date.now()}-${Math.random()}`;

        // Store the promise handlers
        pendingRef.current.set(id, {
          resolve,
          reject,
          onProgress: options.onProgress,
        });

        // Send message to worker
        workerRef.current.postMessage({
          type: 'compress',
          file,
          options: {
            quality: options.quality,
            maxWidth: options.maxWidth,
            maxHeight: options.maxHeight,
            format: options.format,
          },
          id,
        });
      });
    },
    []
  );

  return {
    compressImage,
    isWorkerSupported: supportsWorker.current,
  };
};
