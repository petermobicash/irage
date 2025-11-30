import React, { ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  className?: string;
  variant?: 'page-header' | 'section-header' | 'card-title' | 'body-text' | 'body-text-lg' | 'body-text-sm' | 'caption';
  color?: 'primary' | 'secondary' | 'muted' | 'high-contrast' | 'medium-contrast';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  margin?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

const ResponsiveTypography: React.FC<TypographyProps> = ({
  children,
  className = '',
  variant = 'body-text',
  color = 'primary',
  weight = 'normal',
  align = 'left',
  margin = 'md',
  as: Component = 'p'
}) => {
  // Exact typography specifications from requirements
  const getTypographyClasses = () => {
    const baseClasses = 'transition-responsive leading-relaxed';
    
    switch (variant) {
      case 'page-header':
        return `
          ${baseClasses}
          page-header
          font-bold
          text-high-contrast
          tracking-tight
        `;
        
      case 'section-header':
        return `
          ${baseClasses}
          section-header
          font-semibold
          text-medium-contrast
          tracking-tight
        `;
        
      case 'card-title':
        return `
          ${baseClasses}
          card-title
          font-semibold
          text-primary
          tracking-tight
        `;
        
      case 'body-text':
        return `
          ${baseClasses}
          body-text
          font-normal
          text-secondary
          leading-relaxed
        `;
        
      case 'body-text-lg':
        return `
          ${baseClasses}
          body-text-lg
          font-normal
          text-primary
          leading-relaxed
        `;
        
      case 'body-text-sm':
        return `
          ${baseClasses}
          text-sm
          font-normal
          text-muted
          leading-normal
        `;
        
      case 'caption':
        return `
          ${baseClasses}
          text-xs
          font-medium
          text-muted
          leading-normal
          uppercase
          tracking-wide
        `;
        
      default:
        return baseClasses;
    }
  };

  // Color classes - WCAG AA compliant
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted',
    'high-contrast': 'text-high-contrast',
    'medium-contrast': 'text-medium-contrast'
  };

  // Weight classes
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  // Alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  // Margin classes using exact spacing scale
  const marginClasses = {
    none: '',
    sm: 'mb-2',      // 8px
    md: 'mb-4',      // 16px
    lg: 'mb-6'       // 24px
  };

  const finalClasses = `
    ${getTypographyClasses()}
    ${colorClasses[color]}
    ${weightClasses[weight]}
    ${alignClasses[align]}
    ${marginClasses[margin]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Component className={finalClasses}>
      {children}
    </Component>
  );
};

// Specific component exports with exact specifications
export const H1: React.FC<Omit<TypographyProps, 'variant' | 'as'>> = (props) => (
  <ResponsiveTypography {...props} variant="page-header" as="h1" />
);

export const H2: React.FC<Omit<TypographyProps, 'variant' | 'as'>> = (props) => (
  <ResponsiveTypography {...props} variant="section-header" as="h2" />
);

export const H3: React.FC<Omit<TypographyProps, 'variant' | 'as'>> = (props) => (
  <ResponsiveTypography {...props} variant="card-title" as="h3" />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant' | 'as'>> = (props) => (
  <ResponsiveTypography {...props} variant="body-text" as="p" />
);

export const BodyTextLarge: React.FC<Omit<TypographyProps, 'variant' | 'as'>> = (props) => (
  <ResponsiveTypography {...props} variant="body-text-lg" as="p" />
);

export const BodyTextSmall: React.FC<Omit<TypographyProps, 'variant' | 'as'>> = (props) => (
  <ResponsiveTypography {...props} variant="body-text-sm" as="p" />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant' | 'as'>> = (props) => (
  <ResponsiveTypography {...props} variant="caption" as="span" />
);

export default ResponsiveTypography;