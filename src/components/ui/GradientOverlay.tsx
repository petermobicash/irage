// Enhanced Gradient Overlay System
// Professional gradient overlays for various use cases

import React from 'react';

interface GradientOverlayProps {
  className?: string;
  variant?: 'hero' | 'section' | 'card' | 'text' | 'image' | 'custom';
  direction?: 'horizontal' | 'vertical' | 'radial' | 'diagonal';
  opacity?: number;
  colors?: 'brand' | 'gold' | 'ocean' | 'teal' | 'premium' | 'sunset' | 'oceanic' | 'aurora';
  children?: React.ReactNode;
}

const GradientOverlay: React.FC<GradientOverlayProps> = ({
  className = '',
  variant = 'section',
  direction = 'vertical',
  opacity = 100,
  colors = 'brand',
  children
}) => {
  const variants = {
    hero: 'absolute inset-0',
    section: 'absolute inset-0',
    card: 'absolute inset-0 rounded-lg',
    text: 'absolute inset-0 rounded',
    image: 'absolute inset-0 rounded-lg',
    custom: className
  };

  const colorPalettes = {
    brand: 'from-brand-main-900/90 via-brand-main-700/80 to-brand-main-500/70',
    gold: 'from-gold-900/90 via-gold-700/80 to-gold-500/70',
    ocean: 'from-ocean-900/90 via-ocean-700/80 to-ocean-500/70',
    teal: 'from-teal-900/90 via-teal-700/80 to-teal-500/70',
    premium: 'from-gray-900/95 via-brand-main-800/90 to-gold-800/85',
    sunset: 'from-orange-900/90 via-pink-800/80 to-purple-700/70',
    oceanic: 'from-blue-900/90 via-teal-800/80 to-cyan-700/70',
    aurora: 'from-purple-900/90 via-blue-800/80 to-teal-700/70'
  };

  const getGradientClass = (dir: string) => {
    const validDirections = ['horizontal', 'vertical', 'diagonal'];
    if (dir === 'radial') {
      return `bg-gradient-radial`;
    }
    // Ensure direction is valid to prevent invalid CSS classes
    return validDirections.includes(dir) ? `bg-gradient-to-${dir}` : `bg-gradient-to-vertical`;
  };

  const overlayClass = `
    ${variants[variant]}
    ${getGradientClass(direction)}
    ${colorPalettes[colors]}
  `;

  const overlayStyle = {
    opacity: opacity / 100
  };

  return (
    <div className={overlayClass} style={overlayStyle}>
      {children}
    </div>
  );
};

// Gradient Text Component
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'brand' | 'gold' | 'ocean' | 'premium' | 'rainbow' | 'sunset';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  variant = 'brand',
  size = 'md',
  weight = 'semibold'
}) => {
  const variants = {
    brand: 'text-gradient',
    gold: 'text-gradient-gold',
    ocean: 'bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent',
    premium: 'bg-gradient-to-r from-gray-800 via-brand-700 to-gold-600 bg-clip-text text-transparent',
    rainbow: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent',
    sunset: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent'
  };

  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
    '3xl': 'text-5xl',
    '4xl': 'text-6xl'
  };

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <span className={`${variants[variant]} ${sizes[size]} ${weights[weight]} ${className}`}>
      {children}
    </span>
  );
};

// Glass Effect Overlay
interface GlassOverlayProps {
  className?: string;
  variant?: 'light' | 'brand' | 'gold' | 'dark';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  children?: React.ReactNode;
}

export const GlassOverlay: React.FC<GlassOverlayProps> = ({
  className = '',
  variant = 'light',
  blur = 'lg',
  opacity = 80,
  children
}) => {
  const variants = {
    light: 'bg-white/20 backdrop-blur-xl border-white/30',
    brand: 'bg-brand-main-100/20 backdrop-blur-xl border-brand-main-200/30',
    gold: 'bg-gold-100/20 backdrop-blur-xl border-gold-200/30',
    dark: 'bg-gray-900/40 backdrop-blur-xl border-gray-700/30'
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  return (
    <div 
      className={`
        ${variants[variant]}
        ${blurClasses[blur]}
        border rounded-xl
        ${className}
      `}
      style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}
    >
      {children}
    </div>
  );
};

export default GradientOverlay;