import React, { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'fluid' | 'centered' | 'full-width';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  maxWidth?: boolean;
  centerContent?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  padding = 'md',
  maxWidth = true,
  centerContent = false
}) => {
  // Container base classes
  const baseClasses = `
    w-full
    transition-responsive
    ${maxWidth ? 'max-w-full' : ''}
    ${centerContent ? 'mx-auto' : ''}
  `.trim();

  // Container variants - exact specifications
  const getContainerClasses = () => {
    switch (variant) {
      case 'fluid':
        return 'container-fluid viewport-safe no-horizontal-scroll';
        
      case 'centered':
        return 'container-responsive mx-auto';
        
      case 'full-width':
        return 'w-full viewport-safe no-horizontal-scroll';
        
      default:
        return 'container-responsive';
    }
  };

  // Size variants with max-width constraints
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-4xl'; // Around 896px
      case 'lg':
        return 'max-w-6xl'; // Around 1152px
      case 'xl':
        return 'max-w-7xl'; // Around 1280px
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-4xl';
    }
  };

  // Responsive padding - exact specifications
  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-4 mobile:p-4 tablet:p-6 desktop:p-8';
      case 'md':
        return 'p-responsive'; // Uses CSS custom property: 16px mobile, 24px tablet, 32px desktop
      case 'lg':
        return 'p-6 mobile:p-6 tablet:p-8 desktop:p-12';
      default:
        return 'p-responsive';
    }
  };

  // Prevent horizontal scrolling
  const horizontalScrollPrevention = `
    overflow-x-hidden
    max-w-full
    viewport-safe
  `.trim();

  const finalClasses = `
    ${baseClasses}
    ${getContainerClasses()}
    ${size !== 'full' ? getSizeClasses() : ''}
    ${getPaddingClasses()}
    ${horizontalScrollPrevention}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div 
      className={finalClasses}
      style={{
        // Ensure content adapts to screen width
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;