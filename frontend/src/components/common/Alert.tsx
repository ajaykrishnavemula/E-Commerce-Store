import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <XCircle className="h-5 w-5 text-red-600" />,
    },
  };

  const { container, icon } = variants[variant];

  return (
    <div className={`rounded-lg border p-4 ${container} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icon}</div>
        
        <div className="flex-1">
          {title && (
            <h5 className="font-semibold mb-1">{title}</h5>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;


