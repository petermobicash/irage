import React from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  variant?: 'default' | 'cover' | 'contain' | 'media-container';
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | 'auto';
  sizes?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClick?: () => void;
  onError?: () => void;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  variant = 'default',
  aspectRatio = 'auto',
  sizes,
  loading = 'lazy',
  objectFit = 'cover',
  borderRadius = 'md',
  onClick,
  onError
}) => {
  const baseClasses = `
    responsive-image
    transition-responsive
    object-${objectFit}
  `.trim();

  const variantClasses = {
    default: 'responsive-image',
    cover: 'responsive-image-cover',
    contain: 'max-w-full h-auto',
    'media-container': 'media-container'
  };

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
    '9:16': 'aspect-[9/16]',
    'auto': ''
  };

  const borderRadiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-90' : '';

  const finalClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${aspectRatioClasses[aspectRatio]}
    ${borderRadiusClasses[borderRadius]}
    ${clickableClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const ImageWrapper = onClick ? 'button' : 'div';
  const wrapperProps = onClick ? {
    onClick,
    className: 'focus-ring outline-none',
    style: { minHeight: '44px', minWidth: '44px' }
  } : {};

  return (
    <ImageWrapper {...wrapperProps}>
      {variant === 'media-container' ? (
        <div className="media-container">
          <img
            src={src}
            alt={alt}
            className={finalClasses}
            sizes={sizes}
            loading={loading}
            onError={onError}
          />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={finalClasses}
          sizes={sizes}
          loading={loading}
          onError={onError}
        />
      )}
    </ImageWrapper>
  );
};

export default ResponsiveImage;