import React, { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'fluid' | 'constrained' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centered?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  padding = 'default',
  centered = true
}) => {
  const baseClasses = `
    w-full
    transition-responsive
  `.trim();

  const variantClasses = {
    default: 'container-responsive',
    fluid: 'container-fluid',
    constrained: 'mx-auto max-w-7xl',
    full: 'w-full'
  };

  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl'
  };

  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-responsive',
    lg: 'p-8 lg:p-12'
  };

  const centeredClasses = centered ? 'mx-auto' : '';

  const finalClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${paddingClasses[padding]}
    ${centeredClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={finalClasses}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;