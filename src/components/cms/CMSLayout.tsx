import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Users, Image, Settings, BarChart3, LogOut, Home, Shield, Key, MessageSquare, Mail, Search, Calendar, Database, Megaphone, BookOpen, Globe, Menu, X, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { getCurrentUserProfile, getUserAllPermissions } from '../../utils/rbac';
import { Permission } from '../../types/permissions';
import '../../styles/cms-design-system.css';

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface CMSLayoutProps {
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
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const CMSLayout: React.FC<CMSLayoutProps> = ({
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        // Get user profile
        const profile = await getCurrentUserProfile();

        if (!profile) {
          setPermissions([]);
          setUserRole('guest');
          setIsLoadingPermissions(false);
          return;
        }

        // Get user permissions using new RBAC system
        const userPermissions = await getUserAllPermissions(profile);
        setPermissions(userPermissions);

        // Determine role based on permissions hierarchy
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

  // Memoized helper function to check permissions with fallback
  const hasPermission = useCallback((requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) return true;
    if (requiredPermissions.includes('*')) return true;
    return requiredPermissions.some(perm => permissions.includes(perm as Permission));
  }, [permissions]);

  // Memoized helper function to create navigation items with permission checks
  const createNavItems = useCallback((
    items: Array<{ id: string; name: string; icon: React.ComponentType<{ className?: string }>; permission?: string | null }>,
    requiredPermissions: string[]
  ): NavigationItem[] => {
    if (!hasPermission(requiredPermissions)) return [];
    return items.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      permission: item.permission
    }));
  }, [hasPermission]);

  // Memoized navigation sections for performance - Original simplified structure
  const navigationSections: NavigationSection[] = useMemo(() => [
    {
      title: 'Overview',
      items: createNavItems([
        { id: 'dashboard', name: 'Dashboard', icon: BarChart3, permission: null }
      ], [])
    },
    {
      title: 'Content Studio',
      items: [
        ...createNavItems([
          { id: 'content-list', name: 'All Content', icon: FileText, permission: null },
          { id: 'page-content', name: 'Page Content', icon: FileText, permission: null },
          { id: 'stories', name: 'Stories', icon: BookOpen, permission: null },
          { id: 'calendar', name: 'Content Calendar', icon: Calendar, permission: null },
          { id: 'categories', name: 'Categories', icon: FileText, permission: null },
          { id: 'tags', name: 'Tags', icon: FileText, permission: null },
          { id: 'media-library', name: 'Media Library', icon: Image, permission: null }
        ], ['content.create_draft', 'content.edit_own', 'content.edit_all', 'content.publish', '*'])
      ]
    },
    {
      title: 'Community',
      items: [
        ...createNavItems([
          { id: 'users', name: 'Users', icon: Users, permission: null },
          { id: 'user-groups', name: 'Groups', icon: Users, permission: null },
          { id: 'form-submissions', name: 'Applications', icon: FileText, permission: null },
          { id: 'form-fields', name: 'Form Fields', icon: FileText, permission: null },
          { id: 'chat-admin', name: 'Chat', icon: MessageSquare, permission: null },
          { id: 'comments-admin', name: 'Comments', icon: MessageSquare, permission: null }
        ], ['users.manage_all', 'system.manage_users', 'membership.manage_applications', '*'])
      ]
    },
    {
      title: 'Growth',
      items: [
        ...createNavItems([
          { id: 'newsletter', name: 'Newsletter', icon: Mail, permission: null },
          { id: 'seo', name: 'SEO', icon: Search, permission: null },
          { id: 'ads', name: 'Advertisements', icon: Megaphone, permission: null }
        ], ['system.edit_settings', 'analytics.view_basic', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'Analytics',
      items: [
        ...createNavItems([
          { id: 'analytics', name: 'Analytics', icon: BarChart3, permission: null },
          { id: 'content-analytics', name: 'Content Analytics', icon: BarChart3, permission: 'analytics.view_basic' }
        ], ['analytics.view_basic', '*'])
      ]
    },
    {
      title: 'System',
      items: [
        ...createNavItems([
          { id: 'roles', name: 'Roles', icon: Shield, permission: null },
          { id: 'permissions', name: 'Permissions', icon: Key, permission: null },
          { id: 'settings', name: 'Settings', icon: Settings, permission: null },
          { id: 'database', name: 'Database', icon: Database, permission: null },
          { id: 'website-manager', name: 'Website', icon: Globe, permission: null }
        ], ['system.edit_settings', '*'])
      ]
    }

  ], [createNavItems]);

  // Loading state for permissions
  if (isLoadingPermissions) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="cms-card text-center">
          <div className="cms-loading">
            <div className="cms-spinner"></div>
          </div>
          <p className="cms-body font-medium mt-4">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Error state for permissions
  if (permissionsError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="cms-card text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Shield className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="cms-h2 text-gray-900 mb-2">Permission Error</h2>
          <p className="cms-body mb-6">{permissionsError}</p>
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
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url(/benirage.jpeg)',
          backgroundPosition: 'center'
        }}
      ></div>
      
      {/* Gradient Overlay - Home Page Colors */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A3D5C]/95 via-[#0D4A6B]/95 to-[#0A3D5C]/95"></div>
      
      {/* Additional Gradient Overlay for Better Readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      {/* Header */}
      <header className="cms-header">
        <div className="cms-container cms-mobile-px-4 cms-tablet-px-6 cms-desktop-px-8 h-full">
          <div className="flex justify-between items-center h-full cms-mobile-gap-2 cms-tablet-gap-4">
            <div className="flex items-center cms-mobile-gap-2 cms-tablet-gap-4 min-w-0 flex-1">
              {/* Mobile menu button - only show on smaller screens */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden lg:hidden cms-btn p-2 sm:p-3 hover:bg-gray-100 transition-colors cms-mobile-touch-target flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="cms-mobile-w-5 cms-tablet-w-6" /> : <Menu className="cms-mobile-w-5 cms-tablet-w-6" />}
              </button>
              
              <img
                src="/LOGO_CLEAR_stars.png"
                alt="BENIRAGE"
                className="cms-mobile-w-8 cms-tablet-w-10 cms-mobile-h-8 cms-tablet-h-10 object-contain transition-all duration-300 hover:scale-110 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="hidden xs:block min-w-0">
                <h1 className="cms-mobile-text-sm cms-tablet-text-base cms-desktop-text-lg text-gray-900 mb-0 font-bold truncate">BENIRAGE CMS</h1>
                <p className="cms-mobile-text-xs cms-tablet-text-sm text-gray-600 capitalize truncate">{userRole.replace('-', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center cms-mobile-gap-2 cms-tablet-gap-4">
              <div className="text-right hidden md:block">
                <div className="cms-body font-medium text-gray-900 truncate max-w-[120px]">{currentUser?.email || 'Unknown User'}</div>
                <div className="cms-small capitalize">{userRole.replace('-', ' ')}</div>
              </div>
              <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                <Button variant="outline" size="sm" icon={Home}>
                  View Website
                </Button>
              </a>
              <Button variant="outline" size="sm" onClick={onLogout} icon={LogOut} className="cms-mobile-touch-target">
                <span className="hidden sm:inline">Sign Out</span>
                <LogOut className="w-4 h-4 sm:hidden" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Always-Visible Sidebar */}
        <aside className="cms-sidebar">
          <div className="p-6">
            {/* Sidebar Header */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="cms-nav-title bg-gradient-to-r from-amber-600 to-amber-500 text-white border-0 shadow-lg mb-0">
                Navigation
              </h2>
            </div>
            
            <nav>
              <div className="space-y-6">
                {navigationSections.map((section) => {
                  const visibleItems = section.items.filter(item => !item.permission || permissions.includes(item.permission as Permission));

                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={section.title} className="cms-nav-section">
                      <h3 className="cms-nav-title bg-gradient-to-r from-amber-600 to-amber-500 text-white border-0 shadow-lg">
                        {section.title}
                      </h3>
                      <div className="space-y-2">
                        {visibleItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`cms-nav-item w-full ${currentPage === item.id ? 'active' : ''} group`}
                          >
                            <item.icon className="cms-nav-icon" />
                            <span className="cms-mobile-text-base cms-tablet-text-sm font-medium text-white">{item.name}</span>
                            {currentPage === item.id && (
                              <ChevronRight className="w-4 h-4 ml-auto text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Enhanced Mobile Navigation - only for smaller screens */}
        {isMobileMenuOpen && (
          <div className="md:hidden lg:hidden fixed inset-0 z-50" onClick={() => setIsMobileMenuOpen(false)}>
            {/* Enhanced Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl"></div>
            
            {/* Mobile Sidebar */}
            <div className="relative w-80 max-w-[90vw] h-full cms-sidebar overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-out" onClick={(e) => e.stopPropagation()}>
              {/* Mobile Header */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-200 p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-gray-900">BENIRAGE</h2>
                      <p className="text-sm text-amber-600 font-medium">CMS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Navigation Content */}
              <nav className="p-6 pb-8">
                <div className="space-y-6">
                  {navigationSections.map((section) => {
                    const visibleItems = section.items.filter(item => !item.permission || permissions.includes(item.permission as Permission));

                    if (visibleItems.length === 0) return null;

                    return (
                      <div key={section.title} className="cms-nav-section">
                        {/* Section Header */}
                        <h3 className="cms-nav-title bg-gradient-to-r from-amber-600 to-amber-500 text-white border-0 shadow-lg text-lg">
                          {section.title}
                        </h3>
                        
                        {/* Navigation Items */}
                        <div className="space-y-3 mt-4">
                          {visibleItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                onNavigate(item.id);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`cms-nav-item w-full ${currentPage === item.id ? 'active shadow-xl' : 'shadow-md hover:shadow-lg'}`}
                            >
                              {/* Active indicator */}
                              {currentPage === item.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                              )}
                              
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${currentPage === item.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                                  <item.icon className={`w-6 h-6 ${currentPage === item.id ? 'text-white' : 'text-gray-700'}`} />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                  <div className="cms-mobile-text-base cms-tablet-text-sm font-medium">
                                    <span className="truncate">{item.name}</span>
                                  </div>
                                </div>
                                {currentPage === item.id && (
                                  <ChevronRight className="w-5 h-5 text-white" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="cms-main relative">
          <div className="cms-content">
            {children || (
              <div className="text-center cms-section">
                <div className="cms-mobile-w-16 cms-tablet-w-20 cms-desktop-w-24 cms-mobile-h-16 cms-tablet-h-20 cms-desktop-h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <BarChart3 className="cms-mobile-w-8 cms-tablet-w-10 cms-desktop-w-12 cms-mobile-h-8 cms-tablet-h-10 cms-desktop-h-12 text-white" />
                </div>
                <h1 className="cms-mobile-text-2xl cms-tablet-text-3xl cms-desktop-text-4xl font-bold text-gray-900 mb-4">Welcome to BENIRAGE CMS</h1>
                <p className="cms-mobile-text-sm cms-tablet-text-base cms-desktop-text-lg text-gray-600 max-w-md mx-auto">Your professional content management workspace. Select an option from the sidebar to get started.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CMSLayout;