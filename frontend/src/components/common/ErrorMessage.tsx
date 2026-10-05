import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-2xl border border-[#efb6aa] bg-[#fbe7e1] p-4 text-[#8e352b] ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#a73e35]" />
        <div className="flex-1 text-sm">
          <h4 className="font-semibold text-[#743128]">Something went wrong</h4>
          <p className="mt-1 text-[#8e352b]">{message}</p>
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-[#e7a899] bg-white text-[#8e352b] hover:bg-[#f7dfd7]"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
