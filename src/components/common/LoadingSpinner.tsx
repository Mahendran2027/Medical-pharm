import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  message,
  className = '',
}) => {
  const displayLabel = label || message;
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-emerald-600 border-t-transparent ${sizeClasses[size]}`}
        role="status"
        aria-label="loading"
      />
      {displayLabel && <p className="text-sm font-medium text-slate-600">{displayLabel}</p>}
    </div>
  );
};

export default LoadingSpinner;
