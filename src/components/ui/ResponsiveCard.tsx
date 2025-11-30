import React, { ReactNode } from 'react';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'modern';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  showHeader?: boolean;
  headerTitle?: string;
  headerIcon?: React.ComponentType<{ className?: string }>;
  footer?: ReactNode;
  media?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  hover = true,
  onClick,
  ariaLabel,
  showHeader = false,
  headerTitle,
  headerIcon: HeaderIcon,
  footer,
  media,
  badge,
  action
}) => {
  const baseClasses = `
    card-modern card-padding card-hover
    transition-responsive
    group relative
    bg-white border border-light
    text-high-contrast
  `.trim();

  const variantClasses = {
    default: 'shadow-soft',
    elevated: 'shadow-large',
    outlined: 'border-2 border-primary',
    modern: 'card-modern shadow-medium hover-lift'
  };

  const sizeClasses = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const finalClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${hoverClasses} 
    ${clickableClasses} 
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <CardWrapper
      className={finalClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        minHeight: '44px', // Touch target requirement
      }}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-2 -right-2 z-10">
          {badge}
        </div>
      )}

      {/* Media Section */}
      {media && (
        <div className="media-container mb-4">
          {media}
        </div>
      )}

      {/* Header Section */}
      {(showHeader || headerTitle || HeaderIcon) && (
        <div className="flex items-center justify-between pb-3 border-b border-light">
          <div className="flex items-center space-x-3">
            {HeaderIcon && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <HeaderIcon className="w-4 h-4 text-primary" />
              </div>
            )}
            {headerTitle && (
              <h3 className="card-title text-lg font-semibold text-primary">
                {headerTitle}
              </h3>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer Section */}
      {footer && (
        <div className="pt-4 mt-4 border-t border-light">
          {footer}
        </div>
      )}
    </CardWrapper>
  );
};

export default ResponsiveCard;