import React from 'react';
import { Settings, Zap, Download, Copy } from 'lucide-react';

interface CompressionControlsProps {
  quality: number;
  onQualityChange: (quality: number) => void;
  maxWidth: number;
  onMaxWidthChange: (width: number) => void;
  format: 'jpeg' | 'png' | 'webp';
  onFormatChange: (format: 'jpeg' | 'png' | 'webp') => void;
  onCompress: () => void;
  onDownloadAll: () => void;
  onCopyAll: () => void;
  isProcessing: boolean;
  hasImages: boolean;
  hasResults: boolean;
}

export const CompressionControls: React.FC<CompressionControlsProps> = ({
  quality,
  onQualityChange,
  maxWidth,
  onMaxWidthChange,
  format,
  onFormatChange,
  onCompress,
  onDownloadAll,
  onCopyAll,
  isProcessing,
  hasImages,
  hasResults,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Compression Settings</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quality: {Math.round(quality * 100)}%
          </label>
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={quality}
              onChange={(e) => onQualityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>High compression</span>
              <span>Best quality</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Max Width: {maxWidth}px
          </label>
          <select
            value={maxWidth}
            onChange={(e) => onMaxWidthChange(parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={800}>800px (Small)</option>
            <option value={1200}>1200px (Medium)</option>
            <option value={1920}>1920px (Large)</option>
            <option value={2560}>2560px (Extra Large)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Output Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => onFormatChange(fmt)}
                className={`p-3 text-sm font-medium rounded-lg transition-colors ${
                  format === fmt
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={onCompress}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>{isProcessing ? 'Compressing...' : 'Compress Images'}</span>
          </button>

          {hasResults && (
            <div className="flex gap-2">
              <button
                onClick={onCopyAll}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy All</span>
              </button>
              <button
                onClick={onDownloadAll}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download All</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};