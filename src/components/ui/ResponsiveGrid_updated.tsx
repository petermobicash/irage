import React, { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns?: 'auto' | '1' | '2' | '3' | '4';
  gap?: 'sm' | 'md' | 'lg';
  minItemWidth?: '200px' | '250px' | '280px' | '320px';
  responsive?: boolean;
  variant?: 'cards' | 'content' | 'auto-fit';
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns = 'auto',
  gap = 'md',
  minItemWidth = '280px',
  responsive = true,
  variant = 'cards'
}) => {
  // Base classes for grid
  const baseClasses = `
    grid
    transition-responsive
  `.trim();

  // Card grid layout - exact specifications
  const getCardGridClasses = () => {
    if (!responsive) {
      const fixedColumns = {
        '1': 'grid-cols-1',
        '2': 'grid-cols-1 md:grid-cols-2',
        '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      };
      return fixedColumns[columns as keyof typeof fixedColumns] || 'grid-cols-1';
    }

    // Responsive card grid - exact specifications
    return `
      /* Mobile: Stack vertically, full width (1 column) */
      mobile:grid-cols-1
      /* Tablet: 2 columns */
      tablet:grid-cols-2
      /* Desktop: 3-4 columns */
      desktop:grid-cols-3
      /* Large Desktop: 4 columns */
      lg:grid-cols-4
    `;
  };

  // Content grid layout - for non-card content
  const getContentGridClasses = () => {
    if (!responsive) {
      const fixedColumns = {
        '1': 'grid-cols-1',
        '2': 'grid-cols-1 md:grid-cols-2',
        '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      };
      return fixedColumns[columns as keyof typeof fixedColumns] || 'grid-cols-1';
    }

    return `
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
    `;
  };

  // Gap classes - exact specifications
  const getGapClasses = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4'; // 16px
      case 'md':
        return 'gap-4 mobile:gap-4 tablet:gap-6 desktop:gap-6'; // 16px mobile, 24px desktop
      case 'lg':
        return 'gap-6 mobile:gap-4 tablet:gap-6 desktop:gap-6'; // 16px mobile, 24px tablet/desktop
      default:
        return 'gap-4 mobile:gap-4 tablet:gap-6 desktop:gap-6';
    }
  };

  // Auto-fit grid for better responsiveness
  const getAutoFitClasses = () => {
    if (columns === 'auto' || variant === 'auto-fit') {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        gap: gap === 'sm' ? '1rem' : gap === 'md' ? '1.5rem' : '2rem'
      };
    }
    return {};
  };

  const gridClasses = variant === 'cards' ? getCardGridClasses() : getContentGridClasses();
  const finalClasses = `
    ${baseClasses}
    ${gridClasses}
    ${getGapClasses()}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const autoFitStyle = getAutoFitClasses();

  return (
    <div 
      className={finalClasses}
      style={Object.keys(autoFitStyle).length > 0 ? autoFitStyle : undefined}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;