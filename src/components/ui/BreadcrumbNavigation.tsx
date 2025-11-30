import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getBreadcrumbItems } from '../../config/navigation.config';

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  className?: string;
  showHome?: boolean;
  maxItems?: number;
}

const BreadcrumbNavigation = ({ 
  className = '', 
  showHome = true, 
  maxItems = 5 
}: BreadcrumbNavigationProps) => {
  const location = useLocation();
  
  // Get breadcrumb items from configuration
  const breadcrumbItems = getBreadcrumbItems(location.pathname);
  
  // If no items found, don't render anything
  if (breadcrumbItems.length === 0) {
    return null;
  }

  // Build breadcrumb path
  const buildBreadcrumbPath = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    if (showHome) {
      items.push({
        label: 'Home',
        path: '/',
        isActive: location.pathname === '/'
      });
    }

    // Build path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Find matching navigation item
      const navItem = breadcrumbItems.find(item => item.path === currentPath);
      
      if (navItem || isLast) {
        items.push({
          label: navItem?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath,
          isActive: isLast
        });
      }
    });

    // Limit items if needed
    if (items.length > maxItems) {
      const homeItem = items[0];
      const lastItems = items.slice(-2); // Keep last 2 items
      return [homeItem, { label: '...', path: '', isActive: false }, ...lastItems];
    }

    return items;
  };

  const breadcrumbPath = buildBreadcrumbPath();

  // Don't render if only home or empty
  if (breadcrumbPath.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {breadcrumbPath.map((item, index) => {
        const isDots = item.label === '...';

        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            
            {isDots ? (
              <span className="text-gray-400">...</span>
            ) : item.isActive ? (
              <span className="font-medium text-[#05294B]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-[#05294B] transition-colors flex items-center space-x-1"
              >
                {index === 0 && showHome && (
                  <Home className="w-4 h-4" />
                )}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNavigation;