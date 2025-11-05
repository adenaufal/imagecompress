import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { CompressionControls } from './components/CompressionControls';
import { ImagePreview } from './components/ImagePreview';
import { compressImage, downloadFile, formatFileSize, copyAllImagesToClipboard } from './utils/imageCompression';
import { getDefaultPreset } from './utils/presets';
import { exportToZip, changeFileExtension } from './utils/zipExport';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

interface CompressionResult {
  file: File;
  result?: {
    blob: Blob;
    url: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    originalWidth: number;
    originalHeight: number;
  };
  isProcessing?: boolean;
}

function App() {
  const defaultPreset = getDefaultPreset();
  const [images, setImages] = useState<CompressionResult[]>([]);
  const [quality, setQuality] = useState(defaultPreset.quality);
  const [maxWidth, setMaxWidth] = useState(defaultPreset.maxWidth);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>(defaultPreset.format);
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset.id);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePresetChange = useCallback((presetId: string) => {
    setSelectedPreset(presetId);
    // Settings will be updated in CompressionControls when preset changes
  }, []);

  const handleFileSelect = useCallback((files: File[]) => {
    const newImages = files.map(file => ({ file }));
    setImages(prev => [...prev, ...newImages]);
    toast.success(`${files.length} image${files.length > 1 ? 's' : ''} added`);
  }, []);

  // Listen for the custom event from the "Add more" button
  useEffect(() => {
    const handleAddMoreImages = (event: CustomEvent) => {
      handleFileSelect(event.detail);
    };

    window.addEventListener('addMoreImages', handleAddMoreImages as EventListener);
    return () => {
      window.removeEventListener('addMoreImages', handleAddMoreImages as EventListener);
    };
  }, [handleFileSelect]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCompress = useCallback(async () => {
    if (images.length === 0) return;

    setIsProcessing(true);

    // Mark all images as processing
    setImages(prev => prev.map(img => ({ ...img, isProcessing: true, result: undefined })));

    const loadingToast = toast.loading(`Compressing ${images.length} image${images.length > 1 ? 's' : ''}...`);

    try {
      let successCount = 0;
      let failureCount = 0;

      const compressionPromises = images.map(async (image, index) => {
        try {
          const result = await compressImage(image.file, {
            quality,
            maxWidth,
            format,
          });

          // Update this specific image with its result
          setImages(prev => prev.map((img, i) =>
            i === index
              ? { ...img, result, isProcessing: false }
              : img
          ));

          successCount++;
          return { ...image, result };
        } catch (error) {
          console.error('Compression failed for', image.file.name, error);
          setImages(prev => prev.map((img, i) =>
            i === index
              ? { ...img, isProcessing: false }
              : img
          ));
          failureCount++;
          return image;
        }
      });

      await Promise.all(compressionPromises);

      toast.dismiss(loadingToast);

      if (failureCount === 0) {
        toast.success(`Successfully compressed ${successCount} image${successCount > 1 ? 's' : ''}!`);
      } else if (successCount > 0) {
        toast.success(`Compressed ${successCount} image${successCount > 1 ? 's' : ''}, ${failureCount} failed`);
      } else {
        toast.error('Compression failed for all images');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An error occurred during compression');
    } finally {
      setIsProcessing(false);
    }
  }, [images, quality, maxWidth, format]);

  const handleDownloadAll = useCallback(() => {
    const downloadCount = images.filter(img => img.result).length;
    images.forEach((image) => {
      if (image.result) {
        downloadFile(image.result.blob, image.file.name, format);
      }
    });
    toast.success(`Downloaded ${downloadCount} image${downloadCount > 1 ? 's' : ''}`);
  }, [images, format]);

  const handleCopyAll = async () => {
    const blobs = images
      .map(image => image.result?.blob)
      .filter((blob): blob is Blob => blob !== undefined);

    if (blobs.length === 0) return;

    try {
      await copyAllImagesToClipboard(blobs);
      toast.success(`Copied ${blobs.length} image${blobs.length > 1 ? 's' : ''} to clipboard!`);
    } catch (error) {
      console.error('Failed to copy all images:', error);
      toast.error('Failed to copy images to clipboard');
    }
  };

  const handleClearAll = () => {
    const imageCount = images.length;
    setImages([]);
    toast.success(`Cleared ${imageCount} image${imageCount > 1 ? 's' : ''}`);
  };

  const handleDownloadAsZip = useCallback(async () => {
    const compressedImages = images
      .filter(img => img.result)
      .map(img => ({
        blob: img.result!.blob,
        filename: changeFileExtension(img.file.name, format),
      }));

    if (compressedImages.length === 0) {
      toast.error('No compressed images to download');
      return;
    }

    try {
      const zipLoadingToast = toast.loading('Creating ZIP file...');
      await exportToZip(compressedImages, 'compressed-images.zip');
      toast.dismiss(zipLoadingToast);
      toast.success(`Downloaded ${compressedImages.length} image${compressedImages.length > 1 ? 's' : ''} as ZIP`);
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      toast.error('Failed to create ZIP file');
    }
  }, [images, format]);

  const hasResults = images.some(img => img.result);
  const totalOriginalSize = images.reduce((sum, img) => sum + img.file.size, 0);
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.result?.compressedSize || 0), 0);
  const overallCompressionRatio = totalOriginalSize > 0
    ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
    : 0;

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrl: true,
      action: () => {
        if (images.length > 0 && !isProcessing) {
          handleCompress();
        }
      },
      description: 'Compress images',
    },
    {
      key: 'z',
      ctrl: true,
      action: () => {
        if (hasResults) {
          handleDownloadAsZip();
        }
      },
      description: 'Download as ZIP',
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      action: () => {
        if (hasResults) {
          handleCopyAll();
        }
      },
      description: 'Copy all images',
    },
    {
      key: 'd',
      ctrl: true,
      shift: true,
      action: () => {
        if (hasResults) {
          handleDownloadAll();
        }
      },
      description: 'Download all images',
    },
    {
      key: 'Delete',
      action: () => {
        if (images.length > 0) {
          handleClearAll();
        }
      },
      description: 'Clear all images',
    },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-bg dark:via-gray-900 dark:to-dark-bg font-satoshi transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <div className="max-w-6xl mx-auto mt-8">
          {/* Compression Controls - Moved to top on mobile/tablet */}
          {images.length > 0 && (
            <div className="lg:hidden mb-8">
              <CompressionControls
                quality={quality}
                onQualityChange={setQuality}
                maxWidth={maxWidth}
                onMaxWidthChange={setMaxWidth}
                format={format}
                onFormatChange={setFormat}
                selectedPreset={selectedPreset}
                onPresetChange={handlePresetChange}
                onCompress={handleCompress}
                onDownloadAll={handleDownloadAll}
                onDownloadAsZip={handleDownloadAsZip}
                onCopyAll={handleCopyAll}
                onClearAll={handleClearAll}
                isProcessing={isProcessing}
                hasImages={images.length > 0}
                hasResults={hasResults}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <FileUpload 
                onFileSelect={handleFileSelect} 
                isProcessing={isProcessing}
                hasImages={images.length > 0}
              />

              {hasResults && (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-sm animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Compression Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Original Size:</span>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Compressed Size:</span>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {(totalCompressedSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">Overall Space Saved:</span>
                      <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                        {overallCompressionRatio.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {images.length > 0 && (
                <ImagePreview
              images={images}
              onRemove={handleRemoveImage}
              format={format}
            />
              )}
            </div>

            {/* Compression Controls - Desktop sidebar */}
            <div className="hidden lg:block">
              <CompressionControls
                quality={quality}
                onQualityChange={setQuality}
                maxWidth={maxWidth}
                onMaxWidthChange={setMaxWidth}
                format={format}
                onFormatChange={setFormat}
                selectedPreset={selectedPreset}
                onPresetChange={handlePresetChange}
                onCompress={handleCompress}
                onDownloadAll={handleDownloadAll}
                onDownloadAsZip={handleDownloadAsZip}
                onCopyAll={handleCopyAll}
                onClearAll={handleClearAll}
                isProcessing={isProcessing}
                hasImages={images.length > 0}
                hasResults={hasResults}
              />
            </div>
          </div>
        </div>

        <footer className="text-center mt-16 py-8 text-gray-500 dark:text-gray-400 text-sm hidden md:block">
          <p>
            Built with ❤️ by{' '}
            <a
              href="https://github.com/adenaufal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              adenaufal
            </a>
            {' '}• All processing happens locally in your browser
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;