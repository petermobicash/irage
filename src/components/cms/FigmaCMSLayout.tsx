import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, Users, Image, Settings, BarChart3, LogOut, Shield, 
  Key, UserCheck, MessageSquare, Mail, Search, Calendar, 
  Database, Megaphone, BookOpen, Globe, ChevronRight,
  Sparkles, Palette, Layers, Layout, Menu, X
} from 'lucide-react';
import { getCurrentUserProfile, getUserAllPermissions } from '../../utils/rbac';
import { Permission } from '../../types/permissions';
import '../../styles/cms-design-system.css';

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface FigmaCMSLayoutProps {
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
}

interface NavigationSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
}

const FigmaCMSLayout: React.FC<FigmaCMSLayoutProps> = ({
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

  const hasPermission = useCallback((requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) return true;
    if (requiredPermissions.includes('*')) return true;
    return requiredPermissions.some(perm => permissions.includes(perm as Permission));
  }, [permissions]);

  const createNavItems = useCallback((
    items: Array<{ id: string; name: string; icon: React.ComponentType<{ className?: string }>; permission?: string | null; description?: string }>,
    requiredPermissions: string[]
  ): NavigationItem[] => {
    if (!hasPermission(requiredPermissions)) return [];
    return items.map(item => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
      permission: item.permission,
      description: item.description
    }));
  }, [hasPermission]);

  const navigationSections: NavigationSection[] = useMemo(() => [
    {
      title: 'Overview',
      icon: Layout,
      items: createNavItems([
        { id: 'dashboard', name: 'Dashboard', icon: BarChart3, description: 'Main analytics and overview' }
      ], [])
    },
    {
      title: 'Content Studio',
      icon: Palette,
      items: [
        ...createNavItems([
          { id: 'content-list', name: 'All Content', icon: FileText, description: 'Manage your content' },
          { id: 'page-content', name: 'Page Content', icon: FileText, description: 'Static pages' },
          { id: 'stories', name: 'Stories', icon: BookOpen, description: 'Narrative content' },
          { id: 'calendar', name: 'Calendar', icon: Calendar, description: 'Content scheduling' },
          { id: 'categories', name: 'Categories', icon: Layers, description: 'Content organization' },
          { id: 'tags', name: 'Tags', icon: Search, description: 'Tag management' },
          { id: 'media-library', name: 'Media Library', icon: Image, description: 'Asset management' }
        ], ['content.create_draft', 'content.edit_own', 'content.edit_all', 'content.publish', '*'])
      ]
    },
    {
      title: 'Community',
      icon: Users,
      items: [
        ...createNavItems([
          { id: 'users', name: 'Users', icon: UserCheck, description: 'User management' },
          { id: 'user-groups', name: 'Groups', icon: Users, description: 'User groups' },
          { id: 'form-submissions', name: 'Applications', icon: FileText, description: 'Membership applications' },
          { id: 'form-fields', name: 'Form Fields', icon: Settings, description: 'Form customization' },
          { id: 'chat-admin', name: 'Chat', icon: MessageSquare, description: 'Chat management' },
          { id: 'comments-admin', name: 'Comments', icon: MessageSquare, description: 'Comment moderation' }
        ], ['users.manage_all', 'system.manage_users', 'membership.manage_applications', '*'])
      ]
    },
    {
      title: 'Growth',
      icon: Sparkles,
      items: [
        ...createNavItems([
          { id: 'newsletter', name: 'Newsletter', icon: Mail, description: 'Email marketing' },
          { id: 'seo', name: 'SEO', icon: Search, description: 'Search optimization' },
          { id: 'ads', name: 'Advertisements', icon: Megaphone, description: 'Ad management' }
        ], ['system.edit_settings', 'analytics.view_basic', 'content.create_draft', '*'])
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      items: [
        ...createNavItems([
          { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Website analytics' },
          { id: 'content-analytics', name: 'Content Analytics', icon: BarChart3, description: 'Content performance' }
        ], ['analytics.view_basic', '*'])
      ]
    },
    {
      title: 'System',
      icon: Settings,
      items: [
        ...createNavItems([
          { id: 'roles', name: 'Roles', icon: Shield, description: 'Role management' },
          { id: 'permissions', name: 'Permissions', icon: Key, description: 'Permission control' },
          { id: 'settings', name: 'Settings', icon: Settings, description: 'System settings' },
          { id: 'database', name: 'Database', icon: Database, description: 'Database management' },
          { id: 'website-manager', name: 'Website', icon: Globe, description: 'Website management' }
        ], ['system.edit_settings', '*'])
      ]
    }

  ], [createNavItems]);

  if (isLoadingPermissions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C] flex items-center justify-center lg:pt-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
            <Sparkles className="w-12 h-12 text-[#0A3D5C]" />
          </div>
          <h2 className="content-section-header text-yellow-400 mb-4">Loading Workspace...</h2>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-100"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C] flex items-center justify-center lg:pt-16">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-red-400 rounded-2xl p-8 shadow-2xl text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="content-subsection text-gray-900 mb-4">Permission Error</h2>
            <p className="text-gray-700 mb-6">{permissionsError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#0A3D5C] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C] lg:pt-16">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-[#0A3D5C] to-[#05294b] border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button - only show on smaller screens */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden lg:hidden p-2 sm:p-3 rounded-lg hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />}
              </button>
              
              <div className="relative">
                <img
                  src="/LOGO_CLEAR_stars.png"
                  alt="BENIRAGE"
                  className="w-12 h-12 object-contain drop-shadow-2xl transition-all duration-300 hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              </div>
              <div className="hidden xs:block">
                <h1 className="content-section-header text-yellow-400 mb-1">BENIRAGE Studio</h1>
                <p className="text-yellow-400/80 text-sm font-semibold capitalize">{userRole.replace('-', ' ')} workspace</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <div className="text-yellow-400 font-semibold truncate max-w-[120px]">{currentUser?.email || 'Unknown User'}</div>
                <div className="text-yellow-400/80 text-sm capitalize">{userRole.replace('-', ' ')}</div>
              </div>
              
              <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                <button className="group bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 font-semibold py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                  <span className="text-sm">View Site</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
              
              <button 
                onClick={onLogout} 
                className="group bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 font-semibold py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Always-Visible Enhanced Sidebar */}
        <aside className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-72'
        } bg-white/5 backdrop-blur-md border-r border-white/10 overflow-y-auto`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              {!isSidebarCollapsed && (
                <h2 className="content-subsection text-white/90">Navigation</h2>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${
                  isSidebarCollapsed ? '' : 'rotate-180'
                }`} />
              </button>
            </div>

            <div className="space-y-8">
              {navigationSections.map((section) => {
                const visibleItems = section.items.filter(item => 
                  !item.permission || permissions.includes(item.permission as Permission)
                );

                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.title} className="space-y-3">
                    {!isSidebarCollapsed && (
                      <div className="flex items-center space-x-2 mb-4">
                        <section.icon className="w-4 h-4 text-yellow-400" />
                        <h3 className="content-subsection text-yellow-400">
                          {section.title}
                        </h3>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {visibleItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.id)}
                          className={`w-full p-3 rounded-xl transition-all duration-300 group ${
                            currentPage === item.id 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0A3D5C] shadow-lg' 
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                          title={isSidebarCollapsed ? item.name : undefined}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && (
                              <div className="text-left flex-1">
                                <div className="font-semibold text-sm text-white">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs opacity-80 mt-0.5 text-white/70">{item.description}</div>
                                )}
                              </div>
                            )}
                            {!isSidebarCollapsed && currentPage === item.id && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar - only for smaller screens */}
        {isMobileMenuOpen && (
          <div className="md:hidden lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white/5 backdrop-blur-md border-r border-white/10 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 pt-20">
                <div className="space-y-8">
                  {navigationSections.map((section) => {
                    const visibleItems = section.items.filter(item => 
                      !item.permission || permissions.includes(item.permission as Permission)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                      <div key={section.title} className="space-y-3">
                        <div className="flex items-center space-x-2 mb-4">
                          <section.icon className="w-4 h-4 text-yellow-400" />
                          <h3 className="content-subsection text-yellow-400">
                            {section.title}
                          </h3>
                        </div>
                        
                        <div className="space-y-2">
                          {visibleItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                onNavigate(item.id);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full p-3 rounded-xl transition-all duration-300 group ${
                                currentPage === item.id 
                                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0A3D5C] shadow-lg' 
                                  : 'text-white/80 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <div className="text-left flex-1">
                                  <div className="font-semibold text-sm text-white">{item.name}</div>
                                  {item.description && (
                                    <div className="text-xs opacity-80 mt-0.5 text-white/70">{item.description}</div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children || (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-12 h-12 text-[#0A3D5C]" />
                  </div>
                  <h1 className="content-section-header text-yellow-400 mb-4">
                    Welcome to BENIRAGE Studio
                  </h1>
                  <p className="text-white/90 max-w-2xl mx-auto text-lg">
                    Your creative workspace for managing content, community, and growth. 
                    Choose a section from the sidebar to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FigmaCMSLayout;