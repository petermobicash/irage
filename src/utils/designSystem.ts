// Consistent Spacing and Typography System for Benirage
// Professional design system with consistent measurements

// Spacing System
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '5rem',   // 80px
  '6xl': '6rem',   // 96px
};

// Typography System
export const typography = {
  // Font Sizes (mapped to Tailwind classes)
  sizes: {
    xs: 'text-xs',
    sm: 'text-sm', 
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl',
    '8xl': 'text-8xl',
  },
  
  // Font Weights
  weights: {
    light: 'font-light',
    normal: 'font-normal', 
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  },
  
  // Line Heights
  lineHeights: {
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  },
  
  // Font Families
  families: {
    display: 'font-display',
    body: 'font-body',
    accent: 'font-accent',
    mono: 'font-mono',
  }
};

// Color System
export const colors = {
  brand: {
    primary: 'text-brand-main-600',
    secondary: 'text-brand-main-700',
    accent: 'text-brand-main-500',
  },
  gold: {
    primary: 'text-gold-600',
    secondary: 'text-gold-700', 
    accent: 'text-gold-500',
  },
  teal: {
    primary: 'text-teal-600',
    secondary: 'text-teal-700',
    accent: 'text-teal-500',
  },
  ocean: {
    primary: 'text-ocean-600',
    secondary: 'text-ocean-700',
    accent: 'text-ocean-500',
  },
  neutral: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    accent: 'text-gray-500',
    white: 'text-white',
  }
};

// Component Spacing Guidelines
export const componentSpacing = {
  // Card padding
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8', 
    xl: 'p-10'
  },
  
  // Section padding
  section: {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20'
  },
  
  // Element gaps
  gap: {
    tight: 'gap-2',
    normal: 'gap-4',
    relaxed: 'gap-6',
    loose: 'gap-8'
  },
  
  // Container spacing
  container: {
    sm: 'space-y-4',
    md: 'space-y-8', 
    lg: 'space-y-12',
    xl: 'space-y-16'
  }
};

// Shadow System
export const shadows = {
  soft: 'shadow-soft',
  medium: 'shadow-medium', 
  large: 'shadow-large',
  premium: 'shadow-premium',
  'gold-glow': 'shadow-gold-glow',
  'brand-glow': 'shadow-brand-glow'
};

// Animation System
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  scaleIn: 'animate-scale-in',
  float: 'animate-float',
  glow: 'animate-glow'
};

// Animation Delays
export const animationDelays = {
  100: 'animation-delay-100',
  200: 'animation-delay-200', 
  300: 'animation-delay-300',
  500: 'animation-delay-500',
  700: 'animation-delay-700'
};

export default {
  spacing,
  typography,
  colors,
  componentSpacing,
  shadows,
  animations,
  animationDelays
};