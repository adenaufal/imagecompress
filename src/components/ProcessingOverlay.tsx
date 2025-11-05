import React from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProcessingOverlayProps {
  isVisible: boolean;
  status?: 'processing' | 'success' | 'error';
  message?: string;
  progress?: number; // 0-100
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isVisible,
  status = 'processing',
  message,
  progress,
}) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-16 h-16 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getMessage = () => {
    if (message) return message;

    switch (status) {
      case 'success':
        return 'Processing complete!';
      case 'error':
        return 'An error occurred';
      default:
        return 'Processing your images...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slide-up">
        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="relative">
            {getIcon()}
            {status === 'processing' && (
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            )}
          </div>

          {/* Message */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {getMessage()}
            </h3>
            {status === 'processing' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we optimize your images
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {progress !== undefined && status === 'processing' && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Animated dots for processing */}
          {status === 'processing' && !progress && (
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
