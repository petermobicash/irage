import React from 'react';

interface WaveDividerProps {
  className?: string;
  color?: 'brand' | 'gold' | 'teal' | 'ocean' | 'white' | 'gradient';
  height?: 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'up' | 'down' | 'up-down';
  opacity?: number;
}

const WaveDivider: React.FC<WaveDividerProps> = ({
  className = '',
  color = 'brand',
  height = 'md',
  direction = 'down',
  opacity = 100
}) => {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20'
  };

  const colorClasses = {
    brand: 'fill-brand-main-50',
    gold: 'fill-gold-50',
    teal: 'fill-teal-50',
    ocean: 'fill-ocean-50',
    white: 'fill-white',
    gradient: ''
  };

  // Different wave patterns based on direction
  const getWavePath = () => {
    switch (direction) {
      case 'up':
        return 'M0,32 L0,0 C15,0 15,16 32,16 C48,16 48,0 64,0 C80,0 80,16 96,16 C112,16 112,0 128,0 C144,0 144,16 160,16 C176,16 176,0 192,0 C208,0 208,16 224,16 C240,16 240,0 256,0 C272,0 272,16 288,16 C304,16 304,0 320,0 C336,0 336,16 352,16 C368,16 368,0 384,0 L384,32 Z';
      
      case 'up-down':
        return 'M0,32 L0,0 C15,0 15,16 32,16 C48,16 48,32 64,32 C80,32 80,16 96,16 C112,16 112,32 128,32 C144,32 144,16 160,16 C176,16 176,32 192,32 C208,32 208,16 224,16 C240,16 240,32 256,32 C272,32 272,16 288,16 C304,16 304,32 320,32 C336,32 336,16 352,16 C368,16 368,32 384,32 L384,0 L0,0 Z';
      
      default: // 'down'
        return 'M0,0 L0,32 C15,32 15,16 32,16 C48,16 48,32 64,32 C80,32 80,16 96,16 C112,16 112,32 128,32 C144,32 144,16 160,16 C176,16 176,32 192,32 C208,32 208,16 224,16 C240,16 240,32 256,32 C272,32 272,16 288,16 C304,16 304,32 320,32 C336,32 336,16 352,16 C368,16 368,32 384,32 L384,0 Z';
    }
  };

  // Gradient definitions for gradient color option
  const getGradientId = () => {
    if (color === 'gradient') {
      return `wave-gradient-${Math.random().toString(36).substr(2, 9)}`;
    }
    return null;
  };

  const gradientId = getGradientId();

  const renderSVG = () => {
    const baseSVG = (
      <svg
        className={`absolute inset-0 w-full ${heightClasses[height]} ${className}`}
        viewBox="0 0 384 32"
        preserveAspectRatio="none"
        style={{ opacity: opacity / 100 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {color === 'gradient' && gradientId && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#05294B" />
              <stop offset="50%" stopColor="#003C3B" />
              <stop offset="100%" stopColor="#CEB43C" />
            </linearGradient>
          </defs>
        )}
        
        <path
          d={getWavePath()}
          className={color === 'gradient' ? '' : colorClasses[color]}
          fill={color === 'gradient' ? `url(#${gradientId})` : undefined}
        />
      </svg>
    );

    return baseSVG;
  };

  return (
    <div className="relative w-full overflow-hidden">
      {renderSVG()}
    </div>
  );
};

export default WaveDivider;