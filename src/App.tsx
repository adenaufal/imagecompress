import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { CompressionControls } from './components/CompressionControls';
import { ImagePreview } from './components/ImagePreview';
import { compressImage, downloadFile } from './utils/imageCompression';

interface CompressionResult {
  file: File;
  result?: {
    blob: Blob;
    url: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
  isProcessing?: boolean;
}

function App() {
  const [images, setImages] = useState<CompressionResult[]>([]);
  const [quality, setQuality] = useState(0.7);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback((files: File[]) => {
    const newImages = files.map(file => ({ file }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCompress = useCallback(async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    
    // Mark all images as processing
    setImages(prev => prev.map(img => ({ ...img, isProcessing: true, result: undefined })));

    try {
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

          return { ...image, result };
        } catch (error) {
          console.error('Compression failed for', image.file.name, error);
          setImages(prev => prev.map((img, i) => 
            i === index 
              ? { ...img, isProcessing: false }
              : img
          ));
          return image;
        }
      });

      await Promise.all(compressionPromises);
    } finally {
      setIsProcessing(false);
    }
  }, [images, quality, maxWidth, format]);

  const handleDownloadAll = useCallback(() => {
    images.forEach((image) => {
      if (image.result) {
        const filename = image.file.name.replace(/\.[^/.]+$/, '') + '_compressed.jpg';
        downloadFile(image.result.blob, filename);
      }
    });
  }, [images]);

  const hasResults = images.some(img => img.result);
  const totalOriginalSize = images.reduce((sum, img) => sum + img.file.size, 0);
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.result?.compressedSize || 0), 0);
  const overallCompressionRatio = totalOriginalSize > 0 
    ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-satoshi">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <FileUpload 
                onFileSelect={handleFileSelect} 
                isProcessing={isProcessing}
                hasImages={images.length > 0}
              />
              
              {images.length > 0 && (
                <ImagePreview 
                  images={images} 
                  onRemove={handleRemoveImage}
                />
              )}

              {hasResults && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200 animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Compression Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Original Size:</span>
                      <div className="font-semibold text-gray-900">
                        {(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Compressed Size:</span>
                      <div className="font-semibold text-green-600">
                        {(totalCompressedSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Overall Space Saved:</span>
                      <div className="font-bold text-green-600 text-lg">
                        {overallCompressionRatio.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <CompressionControls
                quality={quality}
                onQualityChange={setQuality}
                maxWidth={maxWidth}
                onMaxWidthChange={setMaxWidth}
                format={format}
                onFormatChange={setFormat}
                onCompress={handleCompress}
                onDownloadAll={handleDownloadAll}
                isProcessing={isProcessing}
                hasResults={hasResults}
              />
            </div>
          </div>
        </div>

        <footer className="text-center mt-16 py-8 text-gray-500 text-sm">
          <p>
            Built with ❤️ by{' '}
            <a 
              href="https://github.com/adenaufal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 transition-colors"
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