import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProfessionalCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'soft' | 'medium' | 'large' | 'premium' | 'gold-glow' | 'brand-glow';
  gradient?: 'none' | 'subtle' | 'brand' | 'gold' | 'ocean' | 'premium';
  border?: 'none' | 'subtle' | 'accent' | 'gradient';
  hover?: 'none' | 'lift' | 'glow' | 'scale' | '3d';
  icon?: LucideIcon;
  iconPosition?: 'top' | 'left' | 'right';
  iconColor?: 'brand' | 'gold' | 'teal' | 'ocean' | 'white';
  background?: 'white' | 'glass' | 'glass-brand' | 'glass-dark';
  animation?: 'none' | 'fade-in' | 'slide-up' | 'scale-in';
  delay?: number;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  className = '',
  onClick,
  padding = 'md',
  shadow = 'medium',
  gradient = 'none',
  border = 'none',
  hover = 'lift',
  icon: Icon,
  iconPosition = 'left',
  iconColor = 'brand',
  background = 'white',
  animation = 'fade-in',
  delay = 0
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadowClasses = {
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large',
    premium: 'shadow-premium',
    'gold-glow': 'shadow-gold-glow',
    'brand-glow': 'shadow-brand-glow'
  };

  const gradientClasses = {
    none: '',
    subtle: 'bg-gradient-to-br from-gray-50 to-gray-100',
    brand: 'bg-gradient-to-br from-brand-main-50 to-ocean-100',
    gold: 'bg-gradient-to-br from-gold-50 to-yellow-100',
    ocean: 'bg-gradient-to-br from-teal-50 to-ocean-100',
    premium: 'bg-gradient-to-br from-white via-gray-50 to-gold-50'
  };

  const borderClasses = {
    none: '',
    subtle: 'border border-gray-200',
    accent: 'border-2 border-gold-300',
    gradient: 'border-2 border-transparent bg-gradient-to-r from-gold-200 via-transparent to-brand-200 bg-clip-border'
  };

  const hoverClasses = {
    none: '',
    lift: 'hover-lift',
    glow: 'hover-glow',
    scale: 'hover-scale',
    '3d': 'hover-lift-3d'
  };

  const iconColorClasses = {
    brand: 'text-brand-main-600',
    gold: 'text-gold-600',
    teal: 'text-teal-600',
    ocean: 'text-ocean-600',
    white: 'text-white'
  };

  const backgroundClasses = {
    white: 'bg-white',
    glass: 'glass',
    'glass-brand': 'glass-brand',
    'glass-dark': 'glass-dark'
  };

  const animationClasses = {
    none: '',
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'scale-in': 'animate-scale-in'
  };

  const animationDelayClass = delay > 0 ? `animation-delay-${delay}` : '';

  const baseClasses = `
    relative
    rounded-2xl
    transition-all duration-300
    ${backgroundClasses[background]}
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${gradientClasses[gradient]}
    ${borderClasses[border]}
    ${hoverClasses[hover]}
    ${animationClasses[animation]}
    ${animationDelayClass}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  const iconElement = Icon && (
    <div className={`
      ${iconPosition === 'top' ? 'mb-4' : ''}
      ${iconPosition === 'left' ? 'mr-3' : ''}
      ${iconPosition === 'right' ? 'ml-3' : ''}
      flex-shrink-0
    `}>
      <Icon className={`w-6 h-6 ${iconColorClasses[iconColor]}`} />
    </div>
  );

  const cardContent = (
    <div className={`
      ${iconPosition === 'top' ? 'text-center' : ''}
      ${iconPosition === 'left' || iconPosition === 'right' ? 'flex items-center' : ''}
      ${iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}
    `}>
      {iconElement}
      <div className={`flex-1 ${iconPosition === 'top' ? 'text-center' : ''}`}>
        {children}
      </div>
    </div>
  );

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      style={animationDelayClass && delay > 0 ? { animationDelay: `${delay}ms` } : {}}
    >
      {cardContent}
      
      {/* Subtle inner glow effect */}
      {gradient === 'premium' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-gold-50/20 rounded-2xl pointer-events-none" />
      )}
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-gold-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default ProfessionalCard;