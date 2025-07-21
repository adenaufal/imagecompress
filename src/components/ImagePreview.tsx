import React from 'react';
import { Download, X, TrendingDown } from 'lucide-react';
import { formatFileSize, downloadFile } from '../utils/imageCompression';

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

interface ImagePreviewProps {
  images: CompressionResult[];
  onRemove: (index: number) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ images, onRemove }) => {
  const handleDownload = (image: CompressionResult) => {
    if (!image.result) return;
    
    const filename = image.file.name.replace(/\.[^/.]+$/, '') + '_compressed.jpg';
    downloadFile(image.result.blob, filename);
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Images</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 animate-slide-up">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900 truncate pr-2">
                {image.file.name}
              </h4>
              <button
                onClick={() => onRemove(index)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <img
                src={image.result?.url || URL.createObjectURL(image.file)}
                alt={image.file.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original:</span>
                <span className="font-medium">{formatFileSize(image.file.size)}</span>
              </div>

              {image.isProcessing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              )}

              {image.result && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Compressed:</span>
                    <span className="font-medium text-green-600">
                      {formatFileSize(image.result.compressedSize)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {image.result.compressionRatio.toFixed(1)}% smaller
                      </span>
                    </div>

                    <button
                      onClick={() => handleDownload(image)}
                      className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
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