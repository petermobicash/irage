import React, { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns?: 'auto' | '1' | '2' | '3' | '4';
  gap?: 'sm' | 'md' | 'lg';
  minItemWidth?: '200px' | '250px' | '280px' | '320px';
  responsive?: boolean;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns = 'auto',
  gap = 'md',
  minItemWidth = '280px',
  responsive = true
}) => {
  const baseClasses = `
    grid
    transition-responsive
  `.trim();

  // Responsive Grid Classes
  const responsiveClasses = responsive ? `
    /* Mobile: Stack vertically, full width */
    mobile:grid-cols-1
    /* Tablet: 2 columns */
    tablet:grid-cols-2
    /* Desktop: 3 columns */
    desktop:grid-cols-3
    /* Large Desktop: 4 columns */
    lg:grid-cols-4
  ` : '';

  // Fixed Column Classes
  const fixedColumnClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 mobile:grid-cols-2',
    '3': 'grid-cols-1 mobile:grid-cols-2 desktop:grid-cols-3',
    '4': 'grid-cols-1 mobile:grid-cols-2 desktop:grid-cols-3 lg:grid-cols-4'
  };

  // Gap Classes
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-4 mobile:gap-6',
    lg: 'gap-6 mobile:gap-8'
  };

  const gridClasses = responsive ? responsiveClasses : fixedColumnClasses[columns as keyof typeof fixedColumnClasses] || 'grid-cols-1';
  
  const finalClasses = `
    ${baseClasses}
    ${gridClasses}
    ${gapClasses[gap]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Auto-fit grid for better responsiveness
  const autoFitClasses = columns === 'auto' ? `
    grid-template-columns: repeat(auto-fit, minmax(${minItemWidth}, 1fr))
  ` : '';

  return (
    <div 
      className={finalClasses}
      style={autoFitClasses ? { 
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        gap: gap === 'sm' ? '1rem' : gap === 'md' ? '1.5rem' : '2rem'
      } : undefined}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;