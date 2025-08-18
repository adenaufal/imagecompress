import React, { useEffect } from 'react';
import { Download, X, TrendingDown, Upload, Copy } from 'lucide-react';
import { formatFileSize, downloadFile, copyImageToClipboard } from '../utils/imageCompression';

interface CompressionResult {
  file: File;
  result?: {
    blob: Blob;
    url: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    originalWidth?: number;
    originalHeight?: number;
  };
  isProcessing?: boolean;
}

interface ImagePreviewProps {
  images: CompressionResult[];
  onRemove: (index: number) => void;
  format: 'jpeg' | 'png' | 'webp';
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove, format }) => {
  const [copyStatus, setCopyStatus] = React.useState<{ [key: number]: 'idle' | 'copying' | 'success' | 'error' }>({});
  const [objectUrls, setObjectUrls] = React.useState<{ [key: number]: string }>({});

  // Create and cleanup object URLs to prevent memory leaks
  useEffect(() => {
    const newObjectUrls: { [key: number]: string } = {};
    
    images.forEach((image, index) => {
      if (!image.result?.url) {
        newObjectUrls[index] = URL.createObjectURL(image.file);
      }
    });
    
    setObjectUrls(prev => {
      // Revoke old URLs that are no longer needed
      Object.values(prev).forEach(url => URL.revokeObjectURL(url));
      return newObjectUrls;
    });
    
    // Cleanup on unmount
    return () => {
      Object.values(newObjectUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleDownload = (image: CompressionResult) => {
    if (!image.result) return;
    
    downloadFile(image.result.blob, image.file.name, format);
  };

  const handleCopyImage = async (image: CompressionResult, index: number) => {
    if (!image.result) return;
    
    setCopyStatus(prev => ({ ...prev, [index]: 'copying' }));
    try {
      await copyImageToClipboard(image.result.blob);
      setCopyStatus(prev => ({ ...prev, [index]: 'success' }));
      setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: 'idle' })), 2000);
    } catch (error) {
      setCopyStatus(prev => ({ ...prev, [index]: 'error' }));
      setTimeout(() => setCopyStatus(prev => ({ ...prev, [index]: 'idle' })), 2000);
    }
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Images</h3>
        <div className="relative inline-block">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                window.dispatchEvent(new CustomEvent('addMoreImages', { detail: files }));
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Upload className="w-3 h-3" />
            <span>Add more</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {images.map((image, index) => (
          <div key={index} className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-lg border border-gray-100 animate-slide-up">
            <div className="flex justify-between items-start mb-1 md:mb-3">
              <h4 className="font-medium text-gray-900 truncate pr-1 text-xs md:text-base">
                {image.file.name}
              </h4>
              <button
                onClick={() => onRemove(index)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>

            <div className="aspect-video bg-gray-100 rounded-md md:rounded-lg mb-2 md:mb-4 overflow-hidden">
              <img
                src={image.result?.url || objectUrls[index] || ''}
                alt={image.file.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1 md:space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Original:</span>
                <span className="font-medium">{formatFileSize(image.file.size)}</span>
              </div>

              {image.result?.originalWidth && image.result?.originalHeight && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Resolution:</span>
                  <span className="font-medium">{image.result.originalWidth} × {image.result.originalHeight}</span>
                </div>
              )}

              {image.isProcessing && (
                <div className="flex items-center space-x-1 md:space-x-2 text-blue-600">
                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Processing...</span>
                </div>
              )}

              {image.result && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Compressed:</span>
                    <span className="font-medium text-green-600">
                      {formatFileSize(image.result.compressedSize)}
                    </span>
                  </div>

                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingDown className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {image.result.compressionRatio.toFixed(1)}% smaller
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 md:gap-2">
                      <button
                        onClick={() => handleCopyImage(image, index)}
                        disabled={copyStatus[index] === 'copying'}
                        className={`flex items-center justify-center space-x-1 px-1 md:px-2 py-1 md:py-1.5 rounded-md md:rounded-lg text-xs font-medium transition-colors ${
                          copyStatus[index] === 'success'
                            ? 'text-green-600 bg-green-50'
                            : copyStatus[index] === 'error'
                            ? 'text-red-600 bg-red-50'
                            : 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                        } ${copyStatus[index] === 'copying' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={copyStatus[index] === 'success' ? 'Copied!' : copyStatus[index] === 'error' ? 'Copy failed' : 'Copy image to clipboard'}
                      >
                        <Copy className="w-3 h-3" />
                        <span className="hidden md:inline">{copyStatus[index] === 'success' ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleDownload(image)}
                        className="flex items-center justify-center space-x-1 bg-blue-600 text-white px-1 md:px-2 py-1 md:py-1.5 rounded-md md:rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden md:inline">Download</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};