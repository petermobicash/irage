import { useState, useEffect } from 'react';
import { Home, Heart, BookOpen, Settings, X as XIcon, Bell, Search, User, MoreHorizontal } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { mobileBottomNavigation, quickActions } from '../../config/navigation.config';

const MobileBottomNavEnhanced = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  // Icon mapping for better visual consistency
  const iconMap = {
    '🏠': Home,
    '🙏': Heart,
    '🧠': BookOpen,
    '📖': Settings,
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Home;
  };

  // Color schemes for different sections
  const getColorScheme = (path: string) => {
    const colorMap = {
      '/': 'from-blue-500 to-blue-600',
      '/spiritual': 'from-pink-500 to-pink-600',
      '/philosophy': 'from-purple-500 to-purple-600',
      '/resources': 'from-green-500 to-green-600',
    };
    return colorMap[path as keyof typeof colorMap] || 'from-gray-500 to-gray-600';
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
    setShowMoreMenu(false);
  };

  const toggleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  return (
    <>
      {/* Main Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {mobileBottomNavigation.slice(0, 4).map((item) => {
            const Icon = getIcon(item.icon || '🏠');
            const isActive = activeTab === item.path;
            const colorScheme = getColorScheme(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[64px] group ${
                  isActive 
                    ? 'text-white shadow-lg transform scale-105' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={handleMenuItemClick}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme} rounded-2xl -z-10 animate-fade-in`} />
                )}
                
                {/* Icon container */}
                <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-white/20' : 'group-hover:bg-white/50'
                }`}>
                  <Icon 
                    size={20} 
                    className={`transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`} 
                  />
                  {/* Notification badge */}
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                    </div>
                  )}
                </div>

                {/* Label */}
                <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
                  isActive ? 'text-white font-semibold' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}

          {/* More Menu Button */}
          <button
            onClick={toggleMoreMenu}
            className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[64px] group ${
              showMoreMenu || isMenuOpen
                ? 'text-[#05294B] shadow-lg transform scale-105 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-label="More options"
          >
            <div className={`relative p-2 rounded-xl transition-all duration-300 ${
              showMoreMenu || isMenuOpen ? 'bg-blue-100' : 'group-hover:bg-white/50'
            }`}>
              <MoreHorizontal 
                size={20} 
                className={`transition-all duration-300 ${
                  showMoreMenu || isMenuOpen ? 'text-[#05294B]' : 'text-gray-600'
                }`} 
              />
            </div>
            <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
              showMoreMenu || isMenuOpen ? 'text-[#05294B] font-semibold' : 'text-gray-600'
            }`}>
              Menu
            </span>
            {/* Active indicator dot */}
            {(showMoreMenu || isMenuOpen) && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#05294B] rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </nav>

      {/* More Menu Overlay */}
      {showMoreMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* More Menu Panel */}
          <div className="fixed inset-x-0 bottom-20 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[60vh] overflow-hidden animate-slide-up">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#05294B] to-brand-accent rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">BENIRAGE</h3>
                  <p className="text-sm text-gray-600">More Options</p>
                </div>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <XIcon className="text-gray-500" size={24} />
              </button>
            </div>

            {/* Menu Content */}
            <div className="overflow-y-auto max-h-96 p-4">
              {/* Quick Actions */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r transition-colors ${
                        action.color === 'red' ? 'from-red-50 to-red-100 hover:from-red-100 hover:to-red-200' :
                        action.color === 'blue' ? 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200' :
                        action.color === 'green' ? 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200' :
                        'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        action.color === 'red' ? 'bg-red-500' :
                        action.color === 'blue' ? 'bg-blue-500' :
                        action.color === 'green' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}>
                        <span className="text-white text-sm">{action.icon}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Navigation */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</h4>
                <div className="space-y-2">
                  {[
                    { label: 'About Us', path: '/about', icon: '🏛️' },
                    { label: 'Programs', path: '/programs', icon: '🎓' },
                    { label: 'Membership', path: '/membership', icon: '👥' },
                    { label: 'Volunteer', path: '/volunteer', icon: '💪' },
                    { label: 'Contact', path: '/contact', icon: '📞' },
                    { label: 'Chat', path: '/chat', icon: '💬' },
                  ].map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleMenuItemClick}
                      className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="text-xl group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-[#05294B]">
                        {item.label}
                      </span>
                      <div className="ml-auto w-2 h-2 bg-[#05294B] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Actions */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Search className="text-gray-600" size={16} />
                    </div>
                    <span className="text-xs text-gray-600">Search</span>
                  </button>
                  <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-colors relative">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Bell className="text-gray-600" size={16} />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-600">Alerts</span>
                  </button>
                  <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="text-gray-600" size={16} />
                    </div>
                    <span className="text-xs text-gray-600">Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileBottomNavEnhanced;