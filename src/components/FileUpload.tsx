import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  isProcessing: boolean;
  hasImages: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, hasImages }) => {
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFileSelect(files);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      
      if (files.length > 0) {
        onFileSelect(files);
      }
    },
    [onFileSelect]
  );

  if (hasImages) {
    return null;
  }

  // Return full upload area when no images
  return (
    <div className="mb-8">
      <div
        className={`relative border-2 border-dashed rounded-2xl text-center p-12 min-h-[280px] flex flex-col justify-center transition-all duration-300 ${
          isProcessing
            ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
          aria-label="Upload images"
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full transition-colors ${
            isProcessing ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            {isProcessing ? (
              <div className="w-8 h-8 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isProcessing ? 'Processing...' : 'Drop your images here'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isProcessing
                ? 'Compressing your images with advanced algorithms'
                : 'or click to browse • Supports JPG, PNG, WEBP'}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <ImageIcon className="w-4 h-4" />
              <span>Multiple files supported</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};