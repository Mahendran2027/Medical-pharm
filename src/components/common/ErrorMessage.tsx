import React from 'react';

export interface ErrorMessageProps {
  title?: string;
  message?: string;
  errors?: string[];
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  errors = [],
  onRetry,
  className = '',
}) => {
  return (
    <div className={`rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 ${className}`}>
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 text-rose-600 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          {message && <p className="mt-1 text-xs text-rose-700">{message}</p>}
          {errors.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-rose-700 space-y-1">
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-xs font-semibold text-rose-800 hover:text-rose-950 underline focus:outline-hidden"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
