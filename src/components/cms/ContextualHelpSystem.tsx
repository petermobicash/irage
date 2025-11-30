import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  HelpCircle, X, ChevronUp, ChevronDown, Lightbulb
} from 'lucide-react';
import Button from '../ui/Button';

interface HelpTooltipProps {
  children: React.ReactNode;
  title: string;
  content: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

interface HelpTooltipData {
  id: string;
  selector: string;
  title: string;
  content: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: 'high' | 'medium' | 'low';
  position: 'top' | 'bottom' | 'left' | 'right';
  delay: number;
}

const ContextualHelpSystem: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<HelpTooltipData | null>(null);
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Help tooltips data
  const helpTooltips: HelpTooltipData[] = useMemo(() => [
    {
      id: 'navigation-sidebar',
      selector: '[data-help="sidebar"]',
      title: 'Navigation Sidebar',
      content: 'Access all CMS features through this organized sidebar. Sections are grouped by function for easy discovery.',
      priority: 'high',
      position: 'right',
      delay: 1000
    },
    {
      id: 'content-editor',
      selector: '[data-help="content-editor"]',
      title: 'Content Editor',
      content: 'Create and edit content with our modern editor featuring auto-save, live preview, and rich formatting options.',
      action: {
        label: 'Try Content Editor',
        onClick: () => console.log('Navigate to content editor')
      },
      priority: 'high',
      position: 'bottom',
      delay: 500
    },
    {
      id: 'media-library',
      selector: '[data-help="media-library"]',
      title: 'Media Library',
      content: 'Upload, organize, and manage all your media files including images, videos, and documents.',
      priority: 'medium',
      position: 'top',
      delay: 2000
    },
    {
      id: 'user-management',
      selector: '[data-help="user-management"]',
      title: 'User Management',
      content: 'Manage team members, assign roles, and control access permissions.',
      priority: 'medium',
      position: 'left',
      delay: 3000
    },
    {
      id: 'analytics',
      selector: '[data-help="analytics"]',
      title: 'Analytics Dashboard',
      content: 'Monitor content performance, user engagement, and site metrics.',
      priority: 'low',
      position: 'top',
      delay: 4000
    },
    {
      id: 'settings',
      selector: '[data-help="settings"]',
      title: 'System Settings',
      content: 'Configure system-wide settings, customize the interface, and manage global preferences.',
      priority: 'low',
      position: 'left',
      delay: 5000
    }
  ], []);

  // Toggle help mode
  const toggleHelpMode = () => {
    setIsHelpMode(!isHelpMode);
    if (isHelpMode) {
      setActiveTooltip(null);
      setHighlightedElement(null);
    }
  };

  // Show tooltip for specific element
  const showTooltipForElement = useCallback((element: HTMLElement, tooltipData: HelpTooltipData) => {
    if (!isHelpMode) return;

    setActiveTooltip(tooltipData);
    setHighlightedElement(element);

    // Scroll element into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }, [isHelpMode]);

  // Position tooltip relative to element
  const positionTooltip = useCallback((element: HTMLElement) => {
    if (!tooltipRef.current || !activeTooltip) return;

    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (activeTooltip.position) {
      case 'top':
        top = rect.top + scrollY - tooltipRect.height - 10;
        left = rect.left + scrollX + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollY + 10;
        left = rect.left + scrollX + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + scrollY + (rect.height - tooltipRect.height) / 2;
        left = rect.left + scrollX - tooltipRect.width - 10;
        break;
      case 'right':
        top = rect.top + scrollY + (rect.height - tooltipRect.height) / 2;
        left = rect.right + scrollX + 10;
        break;
    }

    return { top, left };
  }, [activeTooltip]);

  // Handle click outside tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };

    if (activeTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeTooltip]);

  // Show tooltips sequentially in help mode
  useEffect(() => {
    if (!isHelpMode) return;

    let currentIndex = 0;
    const showNextTooltip = () => {
      if (currentIndex >= helpTooltips.length) {
        setIsHelpMode(false);
        return;
      }

      const tooltip = helpTooltips[currentIndex];
      const element = document.querySelector(tooltip.selector) as HTMLElement;
      
      if (element) {
        showTooltipForElement(element, tooltip);
      }

      currentIndex++;
      setTimeout(showNextTooltip, 8000); // Show each tooltip for 8 seconds
    };

    const timer = setTimeout(showNextTooltip, 1000);
    return () => clearTimeout(timer);
  }, [isHelpMode, helpTooltips, showTooltipForElement]);

  // Position tooltip when it becomes active
  useEffect(() => {
    if (activeTooltip && highlightedElement) {
      const position = positionTooltip(highlightedElement);
      if (position && tooltipRef.current) {
        tooltipRef.current.style.top = `${position.top}px`;
        tooltipRef.current.style.left = `${position.left}px`;
      }
    }
  }, [activeTooltip, highlightedElement, positionTooltip]);

  return (
    <>
      {/* Help Mode Toggle */}
      <button
        onClick={toggleHelpMode}
        className={`fixed top-4 right-4 z-50 w-12 h-12 rounded-full transition-all duration-300 ${
          isHelpMode 
            ? 'bg-amber-500 text-white shadow-lg scale-110' 
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
        title={isHelpMode ? 'Exit Help Mode' : 'Enter Help Mode'}
      >
        <HelpCircle className="w-6 h-6 mx-auto" />
      </button>

      {/* Help Mode Indicator */}
      {isHelpMode && (
        <div className="fixed top-20 right-4 z-40 cms-card-dark p-4 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-medium">Help Mode Active</h3>
          </div>
          <p className="cms-text-secondary text-sm mb-3">
            Explore CMS features with guided tooltips. Click anywhere to dismiss.
          </p>
          <Button
            size="sm"
            onClick={() => setIsHelpMode(false)}
            className="cms-btn-primary-dark w-full"
          >
            Exit Help Mode
          </Button>
        </div>
      )}

      {/* Active Tooltip */}
      {activeTooltip && highlightedElement && (
        <div
          ref={tooltipRef}
          className="fixed z-50 max-w-sm cms-card-dark p-4 shadow-2xl border border-amber-500/30"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {/* Tooltip Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-white font-medium">{activeTooltip.title}</h4>
            </div>
            <button
              onClick={() => setActiveTooltip(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tooltip Content */}
          <p className="cms-text-secondary text-sm mb-4 leading-relaxed">
            {activeTooltip.content}
          </p>

          {/* Tooltip Actions */}
          {activeTooltip.action && (
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                onClick={activeTooltip.action.onClick}
                className="cms-btn-primary-dark"
              >
                {activeTooltip.action.label}
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTooltip(null)}
                  className="cms-btn-ghost-dark"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center space-x-4 mt-4 pt-3 border-t border-gray-700">
            <button
              onClick={() => {
                const currentIndex = helpTooltips.findIndex(t => t.id === activeTooltip.id);
                if (currentIndex > 0) {
                  const prevTooltip = helpTooltips[currentIndex - 1];
                  const element = document.querySelector(prevTooltip.selector) as HTMLElement;
                  if (element) {
                    showTooltipForElement(element, prevTooltip);
                  }
                }
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            
            <span className="cms-text-tertiary text-xs">
              {helpTooltips.findIndex(t => t.id === activeTooltip.id) + 1} of {helpTooltips.length}
            </span>
            
            <button
              onClick={() => {
                const currentIndex = helpTooltips.findIndex(t => t.id === activeTooltip.id);
                if (currentIndex < helpTooltips.length - 1) {
                  const nextTooltip = helpTooltips[currentIndex + 1];
                  const element = document.querySelector(nextTooltip.selector) as HTMLElement;
                  if (element) {
                    showTooltipForElement(element, nextTooltip);
                  }
                }
              }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Arrow Pointer */}
          <div 
            className={`absolute w-3 h-3 bg-gray-800 border-l border-t border-amber-500/30 transform rotate-45 ${
              activeTooltip.position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
              activeTooltip.position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              activeTooltip.position === 'left' ? 'right-0 top-1/2 -translate-x-1/2 -translate-y-1/2' :
              'left-0 top-1/2 translate-x-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}

      {/* Highlight Overlay */}
      {activeTooltip && highlightedElement && (
        <div 
          className="fixed inset-0 bg-amber-500/10 border-2 border-amber-500/50 rounded-lg pointer-events-none z-30"
          style={{
            top: highlightedElement.offsetTop - 10,
            left: highlightedElement.offsetLeft - 10,
            width: highlightedElement.offsetWidth + 20,
            height: highlightedElement.offsetHeight + 20
          }}
        />
      )}
    </>
  );
};

// Help Tooltip Component for direct usage
export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  children,
  title,
  content,
  action,
  position = 'top',
  delay = 1000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute z-50 max-w-xs cms-card-dark p-3 shadow-lg border border-amber-500/30 ${
            position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' :
            position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' :
            position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' :
            'left-full top-1/2 -translate-y-1/2 ml-2'
          }`}
        >
          <div className="flex items-start space-x-2 mb-2">
            <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <h4 className="text-white font-medium text-sm">{title}</h4>
          </div>
          
          <p className="cms-text-secondary text-xs mb-2 leading-relaxed">
            {content}
          </p>
          
          {action && (
            <Button
              size="sm"
              onClick={action.onClick}
              className="cms-btn-primary-dark text-xs px-3 py-1"
            >
              {action.label}
            </Button>
          )}

          {/* Arrow */}
          <div 
            className={`absolute w-2 h-2 bg-gray-800 border-l border-t border-amber-500/30 transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2' :
              position === 'left' ? 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2' :
              'right-full top-1/2 translate-x-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default ContextualHelpSystem;