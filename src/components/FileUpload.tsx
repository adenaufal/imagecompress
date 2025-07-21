import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  isProcessing: boolean;
  hasImages: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing, hasImages }) => {
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

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFileSelect(files);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="mb-8">
      <div
        className={`relative border-2 border-dashed rounded-2xl text-center transition-all duration-300 flex flex-col justify-center ${
          hasImages 
            ? 'p-3 min-h-[60px]' 
            : 'p-12 min-h-[280px]'
        } ${
          isProcessing
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
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
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`${hasImages ? 'p-1' : 'p-4'} rounded-full transition-colors ${
            isProcessing ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {isProcessing ? (
              <div className={`${hasImages ? 'w-3 h-3' : 'w-8 h-8'} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`} />
            ) : (
              <Upload className={`${hasImages ? 'w-3 h-3' : 'w-8 h-8'} text-gray-600`} />
            )}
          </div>
          
          <div className={hasImages ? 'space-y-0' : 'space-y-2'}>
            <h3 className={`${hasImages ? 'text-sm' : 'text-xl'} font-semibold text-gray-900 ${hasImages ? 'mb-0' : 'mb-2'}`}>
              {isProcessing ? 'Processing...' : 'Drop your images here'}
            </h3>
            {!hasImages && (
              <p className="text-gray-600">
                {isProcessing
                  ? 'Compressing your images with advanced algorithms'
                  : 'or click to browse • Supports JPG, PNG, WEBP'}
              </p>
            )}
          </div>

          {!hasImages && (
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <ImageIcon className="w-4 h-4" />
                <span>Multiple files supported</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};