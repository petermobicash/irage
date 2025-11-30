import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  loadingText?: string;
  errorRetry?: () => void;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  loadingText = 'Loading...',
  errorRetry,
  className = ''
}) => {
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {errorRetry && (
            <button
              onClick={errorRetry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">{loadingText}</p>
      </div>
    );
  }

  return <>{children}</>;
};

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  lines = 1, 
  height = 'h-4' 
}) => {
  const [animationClass, setAnimationClass] = useState('animate-pulse');

  useEffect(() => {
    // Add shimmer effect
    const timer = setTimeout(() => {
      setAnimationClass('animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`${height} ${animationClass} rounded`}
          style={{
            animationDelay: `${i * 0.1}s`,
            width: i === lines - 1 && lines > 1 ? '75%' : '100%'
          }}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-lg p-6 bg-white">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex-1">
        <Skeleton height="h-5" className="w-3/4 mb-2" />
        <Skeleton height="h-3" className="w-1/2" />
      </div>
    </div>
    <Skeleton lines={3} className="mb-4" />
    <div className="flex space-x-2">
      <Skeleton height="h-8" className="w-20" />
      <Skeleton height="h-8" className="w-24" />
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton height="h-8" className="w-64" />
      <div className="flex space-x-2">
        <Skeleton height="h-10" className="w-24" />
        <Skeleton height="h-10" className="w-20" />
      </div>
    </div>
    
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="border border-gray-200 rounded-lg">
        <div className="p-4 bg-gray-50 border-b">
          <Skeleton height="h-6" className="w-48" />
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height="h-10" />
            <Skeleton height="h-10" />
          </div>
          <Skeleton height="h-20" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-gray-50 p-4 border-b">
      <Skeleton height="h-6" className="w-48" />
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="p-4 flex items-center space-x-4">
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton 
              key={j} 
              height="h-4" 
              className={j === 0 ? 'w-32' : 'flex-1'} 
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

interface ProgressStateProps {
  progress: number;
  status: 'loading' | 'success' | 'error';
  message?: string;
  estimatedTime?: number;
}

export const ProgressState: React.FC<ProgressStateProps> = ({
  progress,
  status,
  message,
  estimatedTime
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-600';
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        {getStatusIcon()}
        <h3 className="text-lg font-semibold text-gray-900">
          {status === 'loading' ? 'Processing' : 
           status === 'success' ? 'Completed' : 'Failed'}
        </h3>
      </div>
      
      {status === 'loading' && (
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{Math.round(progress)}% complete</span>
            {estimatedTime && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {estimatedTime}s remaining
              </span>
            )}
          </div>
        </div>
      )}
      
      {message && (
        <p className="text-sm text-gray-600 mt-3">{message}</p>
      )}
    </div>
  );
};

interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

interface ToastLoaderProps {
  isVisible: boolean;
  message?: string;
}

export const ToastLoader: React.FC<ToastLoaderProps> = ({
  isVisible,
  message = 'Processing...'
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center space-x-3">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-sm text-gray-900">{message}</span>
      </div>
    </div>
  );
};

// Animated counter component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  className = ''
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutCubic * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {count.toLocaleString()}
    </span>
  );
};

// Pulse animation for highlighting changes
interface PulseHighlightProps {
  children: React.ReactNode;
  isActive: boolean;
  color?: string;
  className?: string;
}

export const PulseHighlight: React.FC<PulseHighlightProps> = ({
  children,
  isActive,
  color = 'bg-yellow-200',
  className = ''
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div className={`transition-all duration-500 ${shouldAnimate ? `${color} animate-pulse` : ''} ${className}`}>
      {children}
    </div>
  );
};

export default {
  LoadingState,
  Skeleton,
  CardSkeleton,
  FormSkeleton,
  TableSkeleton,
  ProgressState,
  InlineLoader,
  ToastLoader,
  AnimatedCounter,
  PulseHighlight
};