import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconSize?: 'xs' | 'sm' | 'md' | 'lg';
  title?: string;
  loading?: boolean;
  shadow?: 'none' | 'soft' | 'medium' | 'large';
  hoverEffect?: 'none' | 'lift' | 'glow' | 'scale';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  iconSize = 'md',
  title,
  loading = false,
  shadow = 'medium',
  hoverEffect = 'lift'
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation -webkit-tap-highlight-color-transparent relative overflow-hidden group';
  
  const variantClasses = {
    primary: 'bg-brand-main-600 text-white hover:bg-brand-main-700 focus:ring-brand-main-500 shadow-lg',
    secondary: 'bg-gold-500 text-white hover:bg-gold-600 focus:ring-gold-500 shadow-lg',
    outline: 'border-2 border-brand-main-600 text-brand-main-600 hover:bg-brand-main-600 hover:text-white focus:ring-brand-main-500',
    ghost: 'text-brand-main-600 hover:bg-brand-main-50 focus:ring-brand-main-500',
    gradient: 'bg-gradient-to-r from-brand-main-600 via-teal-600 to-brand-main-700 text-white hover:shadow-xl focus:ring-brand-main-500 transform hover:scale-105',
    glass: 'glass-brand text-brand-main-700 hover:bg-white/30 focus:ring-brand-main-500 backdrop-blur-lg'
  };

  const sizeClasses = {
    sm: 'px-3 sm:px-4 py-2 sm:py-2 text-sm sm:text-sm min-h-[40px] sm:min-h-[44px] gap-1.5',
    md: 'px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base min-h-[44px] sm:min-h-[48px] gap-2',
    lg: 'px-6 sm:px-8 py-4 sm:py-4 text-base sm:text-lg min-h-[48px] sm:min-h-[52px] gap-2.5',
    xl: 'px-8 sm:px-10 py-5 sm:py-5 text-lg sm:text-xl min-h-[52px] sm:min-h-[56px] gap-3'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    medium: 'shadow-medium',
    large: 'shadow-large'
  };

  const hoverClasses = {
    none: '',
    lift: 'hover:-translate-y-1',
    glow: 'hover:shadow-glow',
    scale: 'hover:scale-105'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  const loadingClasses = loading ? 'pointer-events-none' : '';

  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]}
    ${shadowClasses[shadow]}
    ${hoverClasses[hoverEffect]}
    ${disabledClasses}
    ${loadingClasses}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={buttonClasses}
    >
      {/* Shimmer effect for premium variants */}
      {(variant === 'gradient' || variant === 'primary') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      )}
      
      <div className={`flex items-center justify-center ${iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        {Icon && !loading && (
          <Icon className={`${iconSizes[iconSize]} ${children ? (iconPosition === 'left' ? 'mr-1.5' : 'ml-1.5') : ''}`} />
        )}
        
        {loading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          </div>
        )}
        
        {children && (
          <span className="relative z-10">{children}</span>
        )}
      </div>
    </button>
  );
};

export default Button;