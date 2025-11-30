import React from 'react';

interface ProfessionalTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'display' | 'heading' | 'subheading' | 'body' | 'caption' | 'label';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'gray' | 'gold' | 'brand' | 'teal';
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
}

export const ProfessionalText: React.FC<ProfessionalTextProps> = ({
  children,
  className = '',
  variant = 'body',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  lineHeight = 'normal'
}) => {
  const variants = {
    display: 'font-accent font-bold',
    heading: 'font-semibold',
    subheading: 'font-semibold',
    body: 'font-body',
    caption: 'font-body text-sm text-gray-600',
    label: 'font-medium text-sm uppercase tracking-wider'
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl'
  };

  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };

  const colors = {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    accent: 'text-brand-main-600',
    white: 'text-white',
    gray: 'text-gray-500',
    gold: 'text-gold-600',
    brand: 'text-brand-main-700',
    teal: 'text-teal-600'
  };

  const aligns = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  };

  const lineHeights = {
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  };

  return (
    <p className={`
      ${variants[variant]}
      ${sizes[size]}
      ${weights[weight]}
      ${colors[color]}
      ${aligns[align]}
      ${lineHeights[lineHeight]}
      ${className}
    `}>
      {children}
    </p>
  );
};

// Icon Text Component
interface IconTextProps {
  icon: any; // LucideIcon
  text: string;
  className?: string;
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  iconColor?: 'brand' | 'gold' | 'teal' | 'ocean' | 'white' | 'gray';
  gap?: 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end';
  variant?: 'heading' | 'subheading' | 'body' | 'caption';
}

export const IconText: React.FC<IconTextProps> = ({
  icon: Icon,
  text,
  className = '',
  iconSize = 'md',
  iconColor = 'brand',
  gap = 'md',
  direction = 'horizontal',
  align = 'center',
  variant = 'body'
}) => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const iconColors = {
    brand: 'text-brand-main-600',
    gold: 'text-gold-600',
    teal: 'text-teal-600',
    ocean: 'text-ocean-600',
    white: 'text-white',
    gray: 'text-gray-500'
  };

  const gaps = {
    sm: direction === 'horizontal' ? 'gap-1.5' : 'gap-1',
    md: direction === 'horizontal' ? 'gap-2' : 'gap-1.5',
    lg: direction === 'horizontal' ? 'gap-3' : 'gap-2'
  };

  const aligns = {
    start: direction === 'horizontal' ? 'items-start' : 'items-start text-left',
    center: 'items-center text-center',
    end: direction === 'horizontal' ? 'items-end' : 'items-end text-right'
  };

  const textVariants = {
    heading: 'font-semibold text-lg',
    subheading: 'font-medium text-base',
    body: 'text-base',
    caption: 'text-sm text-gray-600'
  };

  return (
    <div className={`
      flex
      ${direction === 'vertical' ? 'flex-col' : 'flex-row'}
      ${aligns[align]}
      ${gaps[gap]}
      ${className}
    `}>
      <Icon className={`${iconSizes[iconSize]} ${iconColors[iconColor]} flex-shrink-0`} />
      <span className={textVariants[variant]}>{text}</span>
    </div>
  );
};

export default ProfessionalText;