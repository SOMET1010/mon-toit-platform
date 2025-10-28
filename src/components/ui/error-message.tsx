import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorMessageProps {
  error: string | Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ error, onRetry, className = '' }: ErrorMessageProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">Une erreur est survenue</h3>
          <p className="text-sm text-red-700">{errorMessage}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export function SuccessMessage({ message, className = '' }: SuccessMessageProps) {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-green-800 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface InfoMessageProps {
  message: string;
  className?: string;
}

export function InfoMessage({ message, className = '' }: InfoMessageProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      </div>
    </div>
  );
}

