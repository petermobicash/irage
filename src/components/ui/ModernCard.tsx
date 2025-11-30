import { ReactNode } from 'react';
import ResponsiveCard from './ResponsiveCard';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'modern';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  showHeader?: boolean;
  headerTitle?: string;
  headerIcon?: React.ComponentType<{ className?: string }>;
  footer?: ReactNode;
  media?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
}

const ModernCard = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  hover = true,
  onClick,
  ariaLabel,
  showHeader = false,
  headerTitle,
  headerIcon: HeaderIcon,
  footer,
  media,
  badge,
  action
}: ModernCardProps) => {
  // Legacy compatibility wrapper
  return (
    <ResponsiveCard
      className={className}
      variant={variant === 'default' ? 'modern' : variant}
      size={size}
      hover={hover}
      onClick={onClick}
      ariaLabel={ariaLabel}
      showHeader={showHeader}
      headerTitle={headerTitle}
      headerIcon={HeaderIcon}
      footer={footer}
      media={media}
      badge={badge}
      action={action}
    >
      {children}
    </ResponsiveCard>
  );
};

export default ModernCard;