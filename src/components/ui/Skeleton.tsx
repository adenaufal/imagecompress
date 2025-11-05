import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClass = 'bg-gray-200 dark:bg-gray-700';

  const variantClass = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }[variant];

  const animationClass = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  }[animation];

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClass} ${variantClass} ${animationClass} ${className}`}
      style={style}
    />
  );
};

// Skeleton Card for Image Preview
export const ImageCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-lg md:rounded-xl p-2 md:p-4 shadow-lg border border-gray-100 dark:border-dark-border animate-fade-in">
      <div className="flex justify-between items-start mb-1 md:mb-3">
        <Skeleton className="h-4 md:h-5 w-32" variant="text" />
        <Skeleton className="w-3 h-3 md:w-4 md:h-4" variant="circular" />
      </div>

      {/* Image placeholder */}
      <Skeleton className="aspect-video mb-2 md:mb-4 w-full" />

      {/* Stats placeholders */}
      <div className="space-y-1 md:space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" variant="text" />
          <Skeleton className="h-3 w-12" variant="text" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" variant="text" />
          <Skeleton className="h-3 w-16" variant="text" />
        </div>

        {/* Processing indicator */}
        <div className="flex items-center space-x-2 mt-2">
          <Skeleton className="w-4 h-4" variant="circular" />
          <Skeleton className="h-3 w-24" variant="text" />
        </div>
      </div>
    </div>
  );
};

// Skeleton for compression summary
export const SummarySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in">
      <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-border">
        <Skeleton className="h-4 w-24 mb-3" variant="text" />
        <Skeleton className="h-8 w-32" variant="text" />
      </div>
      <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg border border-gray-100 dark:border-dark-border">
        <Skeleton className="h-4 w-24 mb-3" variant="text" />
        <Skeleton className="h-8 w-32" variant="text" />
      </div>
    </div>
  );
};

// Skeleton for control panel sections
export const ControlSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Skeleton className="h-5 w-32 mb-3" variant="text" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-5 w-24 mb-3" variant="text" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-5 w-28 mb-3" variant="text" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
};
