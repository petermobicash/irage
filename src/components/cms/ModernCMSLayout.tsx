import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, Users, Image, Settings, BarChart3, LogOut, Home, Shield, 
  UserCheck, MessageSquare, Mail, Search, Calendar, 
  Database, Megaphone, BookOpen, Globe, ChevronRight, ChevronDown,
  Palette, Layout, Menu, X, HelpCircle,
  TrendingUp, Activity, Zap
} from 'lucide-react';
import Button from '../ui/Button';
import UserOnboarding from './UserOnboarding';
import GlobalSearch from './GlobalSearch';
import ContextualHelpSystem from './ContextualHelpSystem';
import { getCurrentUserProfile, getUserAllPermissions } from '../../utils/rbac';
import { Permission } from '../../types/permissions';
import '../../styles/cms-design-system.css';

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface ModernCMSLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: User;
  onLogout: () => void;
}

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string | null;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'primary' | 'danger' | 'warning' | 'success';
  count?: number;
  requiredPermission?: string;
}

interface NavigationSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'slate' | 'purple' | 'emerald' | 'orange' | 'blue' | 'red';
  items: NavigationItem[];
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'warning' | 'success';
  className?: string;
}

// Simple Badge component
const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

const ModernCMSLayout: React.FC<ModernCMSLayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  currentUser,
  onLogout
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<string>('guest');
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [onboardingSteps, setOnboardingSteps] = useState<string[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['Overview', 'Content Studio']);

  // ========================================
  // COLOR SCHEMES FOR SECTIONS
  // ========================================
  const colorSchemes = useMemo(() => ({
    slate: { 
      bg: 'bg-slate-50', 
      border: 'border-slate-200', 
      text: 'text-slate-700', 
      active: 'bg-slate-700 text-white', 
      hover: 'hover:bg-slate-100', 
      icon: 'text-slate-600' 
    },
    purple: { 
      bg: 'bg-purple-50', 
      border: 'border-purple-200', 
      text: 'text-purple-700', 
      active: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30', 
      hover: 'hover:bg-purple-100', 
      icon: 'text-purple-600' 
    },
    emerald: { 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200', 
      text: 'text-emerald-700', 
      active: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30', 
      hover: 'hover:bg-emerald-100', 
      icon: 'text-emerald-600' 
    },
    orange: { 
      bg: 'bg-orange-50', 
      border: 'border-orange-200', 
      text: 'text-orange-700', 
      active: 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/30', 
      hover: 'hover:bg-orange-100', 
      icon: 'text-orange-600' 
    },
    blue: { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-700', 
      active: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30', 
      hover: 'hover:bg-blue-100', 
      icon: 'text-blue-600' 
    },
    red: { 
      bg: 'bg-red-50', 
      border: 'border-red-200', 
      text: 'text-red-700', 
      active: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30', 
      hover: 'hover:bg-red-100', 
      icon: 'text-red-600' 
    }
  }), []);

  // Initialize permissions and role
  useEffect(() => {
    const initializePermissions = async () => {
      if (!currentUser) {
        setPermissions([]);
        setUserRole('guest');
        setIsLoadingPermissions(false);
        return;
      }

      setIsLoadingPermissions(true);
      setPermissionsError(null);

      try {
        const profile = await getCurrentUserProfile();
        if (!profile) {
          setPermissions([]);
          setUserRole('guest');
          setIsLoadingPermissions(false);
          return;
        }

        const userPermissions = await getUserAllPermissions(profile);
        setPermissions(userPermissions);

        const roleHierarchy: Array<{ permission: Permission; role: string }> = [
          { permission: 'system.manage_permissions' as Permission, role: 'super-admin' },
          { permission: 'content.edit_all' as Permission, role: 'content-manager' },
          { permission: 'content.edit_own' as Permission, role: 'editor' },
          { permission: 'content.create_draft' as Permission, role: 'contributor' }
        ];

        const determinedRole = roleHierarchy.find(({ permission }) =>
          userPermissions.includes(permission)
        )?.role || 'viewer';

        setUserRole(determinedRole);
      } catch (error) {
        console.error('Error initializing permissions:', error);
        setPermissionsError('Failed to load permissions. Please refresh the page.');
        setPermissions([]);
        setUserRole('guest');
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    initializePermissions();
  }, [currentUser]);

  // Initialize onboarding and global search
  useEffect(() => {
    // Check if this is the first visit
    try {
      const hasVisited = localStorage.getItem('cms-has-visited');
      if (!hasVisited && currentUser) {
        setIsFirstVisit(true);
      }

      // Load completed onboarding steps
      const completedSteps = localStorage.getItem('cms-onboarding-steps');
      if (completedSteps) {
        setOnboardingSteps(JSON.parse(completedSteps));
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      // Continue without localStorage functionality
    }
  }, [currentUser]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+K or Cmd+K for global search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }

      // ? for help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowOnboarding(true);
      }

      // Ctrl+N for new content (when focused on navigation)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNavigate('content-editor');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  // Handle onboarding step completion
  const handleOnboardingStepComplete = (stepId: string) => {
    const updatedSteps = [...onboardingSteps, stepId];
    setOnboardingSteps(updatedSteps);
    try {
      localStorage.setItem('cms-onboarding-steps', JSON.stringify(updatedSteps));
    } catch (error) {
      console.warn('Failed to save onboarding steps to localStorage:', error);
      // Continue without saving - the UI will still work
    }
  };

  // Close onboarding when all steps are completed
  useEffect(() => {
    if (isFirstVisit && onboardingSteps.length >= 5) {
      try {
        localStorage.setItem('cms-has-visited', 'true');
      } catch (error) {
        console.warn('Failed to save visit status to localStorage:', error);
        // Continue without saving - the UI will still work
      }
      setIsFirstVisit(false);
      setShowOnboarding(false);
    }
  }, [onboardingSteps, isFirstVisit]);

  const hasPermission = useCallback((requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) return true;
    if (requiredPermissions.includes('*')) return true;
    return requiredPermissions.some(perm => permissions.includes(perm as Permission));
  }, [permissions]);

  // ========================================
  // NAVIGATION STATE MANAGEMENT
  // ========================================

  // Toggle section expansion/collapse
  const toggleSection = useCallback((sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  }, []);

  // Filter navigation items based on user permissions
  const filterByPermissions = useCallback((items: NavigationItem[], userPermissions: Permission[]) => {
    return items.filter(item => {
      if (!item.requiredPermission) return true;
      return userPermissions.includes(item.requiredPermission as Permission);
    });
  }, []);

  // ========================================
  // RENDER NAVIGATION ITEM
  // ========================================
  const renderNavItem = useCallback((item: NavigationItem, section: NavigationSection, isExpanded: boolean) => {
    const isActive = currentPage === item.id;
    
    // Don't render if section is collapsed (unless sidebar is collapsed)
    if (!isExpanded && !isSidebarCollapsed) return null;
    
    const handleItemClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(`🔗 Navigation clicked: ${item.id} from section: ${section.title}`);
      onNavigate(item.id);
    };
    
    return (
      <button
        key={item.id}
        onClick={handleItemClick}
        type="button"
        className={`
          group w-full flex items-center gap-3 px-4 py-3 
          rounded-xl transition-all duration-200 cursor-pointer
          transform hover:scale-[1.02] active:scale-[0.98]
          bg-white border border-slate-200 text-slate-700
          hover:bg-slate-50 hover:border-slate-300 hover:shadow-md
          ${isActive ? 'bg-slate-50 border-slate-300 shadow-md' : ''}
          ${isSidebarCollapsed ? 'justify-center' : ''}
        `}
        title={isSidebarCollapsed ? item.name : undefined}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none'
        }}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 text-slate-600`}>
          <item.icon className="w-5 h-5" />
        </div>
        
        {/* Label and metadata (hidden when collapsed) */}
        {!isSidebarCollapsed && (
          <>
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold text-sm">{item.name}</div>
            </div>
            
            {/* Badge (e.g., "New", "Beta") */}
            {item.badge && (
              <Badge variant={item.badgeVariant || 'default'}>
                {item.badge}
              </Badge>
            )}
            
            {/* Count (e.g., number of items) */}
            {item.count && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {item.count.toLocaleString()}
              </span>
            )}
          </>
        )}
      </button>
    );
  }, [currentPage, isSidebarCollapsed, onNavigate]);

  // ========================================
  // RENDER NAVIGATION SECTION
  // ========================================
  const renderNavSection = useCallback((section: NavigationSection) => {
    const isExpanded = expandedSections.includes(section.title);
    const scheme = colorSchemes[section.color];
    const visibleItems = filterByPermissions(section.items, permissions);
    
    if (visibleItems.length === 0) return null;
    
    return (
      <div key={section.title} className="space-y-2">
        {/* Section Header (collapsible) */}
        {!isSidebarCollapsed && (
          <button
            onClick={() => toggleSection(section.title)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${scheme.hover} group`}
          >
            {/* Section icon */}
            <div className={`w-8 h-8 ${scheme.bg} rounded-lg flex items-center justify-center border ${scheme.border} group-hover:scale-110 transition-transform duration-200`}>
              <section.icon className={`w-4 h-4 ${scheme.icon}`} />
            </div>
            
            {/* Section title */}
            <span className={`flex-1 text-left text-sm font-bold ${scheme.text} uppercase tracking-wide`}>
              {section.title}
            </span>
            
            {/* Expand/collapse chevron */}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
        
        {/* Section Items */}
        <div className={`space-y-1.5 ${!isSidebarCollapsed && !isExpanded ? 'hidden' : ''}`}>
          {visibleItems.map((item) => renderNavItem(item, section, isExpanded))}
        </div>
      </div>
    );
  }, [expandedSections, colorSchemes, isSidebarCollapsed, toggleSection, filterByPermissions, renderNavItem, permissions]);



  const createNavItems = useCallback((
    items: Array<{ 
      id: string; 
      name: string; 
      icon: React.ComponentType<{ className?: string }>; 
      permission?: string | null; 
      description?: string; 
      badge?: string;
      badgeVariant?: 'default' | 'primary' | 'danger' | 'warning' | 'success';
      count?: number;
      requiredPermission?: string;
    }>,
    requiredPermissions: string[]
  ): NavigationItem[] => {
    if (!hasPermission(requiredPermissions)) return [];
    return items.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      permission: item.permission,
      description: item.description,
      badge: item.badge,
      badgeVariant: item.badgeVariant,
      count: item.count,
      requiredPermission: item.requiredPermission
    }));
  }, [hasPermission]);

  const navigationSections: NavigationSection[] = useMemo(() => [
    {
      title: 'Overview',
      icon: Layout,
      color: 'slate',
      items: [
        ...createNavItems([
          { id: 'dashboard', name: 'Dashboard', icon: BarChart3, badge: 'New', badgeVariant: 'primary' },
          { id: 'activity', name: 'Activity Feed', icon: Activity },
          { id: 'quick-actions', name: 'Quick Actions', icon: Zap }
        ], [])
      ]
    },
    {
      title: 'Content Studio',
      icon: Palette,
      color: 'purple',
      items: [
        ...createNavItems([
          { id: 'content-list', name: 'All Content', icon: FileText, count: 247 },
          { id: 'page-content', name: 'Pages', icon: FileText, count: 42 },
          { id: 'stories', name: 'Stories', icon: BookOpen, count: 89 },
          { id: 'calendar', name: 'Calendar', icon: Calendar },
          { id: 'media-library', name: 'Media Library', icon: Image, count: 1243 }
        ], ['content.create_draft', 'content.edit_own', 'content.edit_all', 'content.publish', '*'])
      ]
    },
    {
      title: 'Community',
      icon: Users,
      color: 'emerald',
      items: [
        ...createNavItems([
          { id: 'users', name: 'Users', icon: UserCheck, count: 3421 },
          { id: 'user-groups', name: 'Groups', icon: Users, count: 28 },
          { id: 'form-submissions', name: 'Applications', icon: FileText, badge: 'New', badgeVariant: 'primary' },
          { id: 'chat-admin', name: 'Chat', icon: MessageSquare, badge: '12', badgeVariant: 'danger' }
        ], ['users.manage_all', 'system.manage_users', 'membership.manage_applications', '*'])
      ]
    },
    {
      title: 'Growth & Marketing',
      icon: TrendingUp,
      color: 'orange',
      items: [
        ...createNavItems([
          { id: 'newsletter', name: 'Newsletter', icon: Mail, count: 15420 },
          { id: 'seo', name: 'SEO Manager', icon: Search },
          { id: 'ads', name: 'Advertisements', icon: Megaphone }
        ], ['system.edit_settings', 'analytics.view_basic', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      color: 'blue',
      items: [
        ...createNavItems([
          { id: 'analytics', name: 'Overview', icon: BarChart3 },
          { id: 'content-analytics', name: 'Content Performance', icon: TrendingUp }
        ], ['analytics.view_basic', '*'])
      ]
    },
    {
      title: 'System',
      icon: Settings,
      color: 'red',
      items: [
        ...createNavItems([
          { id: 'roles', name: 'Roles & Permissions', icon: Shield },
          { id: 'settings', name: 'Settings', icon: Settings },
          { id: 'database', name: 'Database', icon: Database },
          { id: 'website-manager', name: 'Website Manager', icon: Globe }
        ], ['system.edit_settings', '*'])
      ]
    }

  ], [createNavItems]);

  if (isLoadingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-medium mt-4">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Permission Error</h2>
          <p className="text-gray-600 mb-6">{permissionsError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image Overlay - Home Page Style */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url(/benirage.jpeg)',
          backgroundPosition: 'center'
        }}
      ></div>
      
      {/* Gradient Overlay - Home Page Colors */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A3D5C]/95 via-[#0D4A6B]/95 to-[#0A3D5C]/95 pointer-events-none"></div>
      
      {/* Additional Gradient Overlay for Better Readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <img
                src="/LOGO_CLEAR_stars.png"
                alt="BENIRAGE"
                className="w-10 h-10 object-contain transition-all duration-300 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  // Fallback to custom icon if logo fails to load
                  const fallback = document.createElement('div');
                  fallback.className = 'w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center';
                  fallback.innerHTML = '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
                  e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
                }}
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">BENIRAGE Studio</h1>
                <p className="text-xs text-gray-600 capitalize">{userRole.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right mr-2">
              <div className="text-sm font-medium text-gray-900">{currentUser?.email || 'Unknown User'}</div>
              <div className="text-xs text-gray-600 capitalize">{userRole.replace('-', ' ')}</div>
            </div>
            
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <Button variant="outline" size="sm" icon={Home}>
                View Site
              </Button>
            </a>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowGlobalSearch(true)} 
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowOnboarding(true)}
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout} 
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block ${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-white/5 backdrop-blur-sm border-r border-white/10 transition-all duration-300 h-[calc(100vh-65px)] overflow-y-auto relative z-20 pointer-events-auto`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              {!isSidebarCollapsed && (
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Navigation</h2>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <nav className="space-y-4">
              {navigationSections.map(section => renderNavSection(section))}
            </nav>
          </div>
        </aside>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-80 max-w-[85vw] h-full bg-white/5 backdrop-blur-sm overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/LOGO_CLEAR_stars.png"
                      alt="BENIRAGE"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        // Fallback to custom icon if logo fails to load
                        const fallback = document.createElement('div');
                        fallback.className = 'w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center';
                        fallback.innerHTML = '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
                        e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
                      }}
                    />
                    <div>
                      <h2 className="font-bold text-gray-900">BENIRAGE</h2>
                      <p className="text-xs text-amber-600">Studio</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-900 truncate">{currentUser?.email || 'Unknown User'}</p>
                      <p className="text-xs text-amber-600 capitalize">{userRole.replace('-', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-6">
                <nav className="space-y-4">
                  {navigationSections.map(section => {
                    // For mobile, we'll expand all sections
                    return (
                      <div key={`mobile-${section.title}`}>
                        <div className="flex items-center gap-2 mb-3 px-2">
                          <section.icon className="w-4 h-4 text-gray-500" />
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {section.title}
                          </h3>
                        </div>
                        <div className="space-y-1">
                          {filterByPermissions(section.items, permissions).map((item) => {
                            const isActive = currentPage === item.id;
                            
                            const handleMobileItemClick = (e: React.MouseEvent) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log(`🔗 Mobile navigation clicked: ${item.id} from section: ${section.title}`);
                              onNavigate(item.id);
                              setIsMobileMenuOpen(false);
                            };

                            return (
                              <button
                                key={item.id}
                                onClick={handleMobileItemClick}
                                type="button"
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md ${
                                  isActive ? 'bg-slate-50 border-slate-300 shadow-md' : ''
                                }`}
                                style={{
                                  pointerEvents: 'auto',
                                  userSelect: 'none'
                                }}
                              >
                                <item.icon className="w-5 h-5 flex-shrink-0 text-slate-600" />
                                <div className="flex-1 text-left min-w-0">
                                  <div className="font-semibold text-sm">{item.name}</div>
                                  {item.count && (
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {item.count.toLocaleString()}
                                    </span>
                                  )}
                                  {item.badge && (
                                    <Badge variant={item.badgeVariant || 'default'} className="ml-2">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="max-w-7xl mx-auto p-6">
            {children || (
              // Welcome Screen - Simplified Design
              <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="text-center max-w-lg">
                  {/* Welcome Icon */}
                  <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <img
                      src="/LOGO_CLEAR_stars.png"
                      alt="BENIRAGE Logo"
                      className="w-20 h-20 object-contain drop-shadow-lg transition-all duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        // Fallback to custom icon if logo fails to load
                        const fallback = document.createElement('div');
                        fallback.className = 'w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-xl';
                        fallback.innerHTML = '<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
                        e.currentTarget.parentNode?.appendChild(fallback);
                      }}
                    />
                  </div>
                  
                  {/* Welcome Title */}
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to BENIRAGE Studio
                  </h1>
                  
                  {/* Welcome Description */}
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Your professional content management workspace. 
                    Choose a section from the sidebar to get started with managing your content, community, and growth.
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-indigo-600">247</div>
                      <div className="text-sm text-gray-500">Content Items</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-purple-600">3,421</div>
                      <div className="text-sm text-gray-500">Users</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="text-2xl font-bold text-emerald-600">15.4K</div>
                      <div className="text-sm text-gray-500">Newsletter</div>
                    </div>
                  </div>
                  
                  {/* Current Page Indicator */}
                  <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">
                      Current page: <span className="font-medium text-amber-600 capitalize">{currentPage.replace('-', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowGlobalSearch(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-30"
        title="Quick Search (Ctrl+K)"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* Onboarding Modal */}
      <UserOnboarding
        isOpen={showOnboarding || isFirstVisit}
        onClose={() => {
          setShowOnboarding(false);
          if (isFirstVisit) {
            try {
              localStorage.setItem('cms-has-visited', 'true');
            } catch (error) {
              console.warn('Failed to save visit status to localStorage:', error);
              // Continue without saving - the UI will still work
            }
            setIsFirstVisit(false);
          }
        }}
        userRole={userRole}
        completedSteps={onboardingSteps}
        onStepComplete={handleOnboardingStepComplete}
      />

      {/* Global Search */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onNavigate={(url) => {
          onNavigate(url);
          setShowGlobalSearch(false);
        }}
        currentPage={currentPage}
        userPermissions={permissions}
      />

      {/* Contextual Help System */}
      <ContextualHelpSystem />
    </div>
  );
};

export default ModernCMSLayout;