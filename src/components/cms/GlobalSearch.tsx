import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Search, Clock, FileText, Image, Users, Settings, 
  X, ArrowRight, Zap, TrendingUp,
  BookOpen, Star, Globe, BarChart3
} from 'lucide-react';
import Button from '../ui/Button';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'media' | 'user' | 'settings' | 'analytics' | 'page';
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  tags?: string[];
  lastModified?: string;
  status?: 'draft' | 'published' | 'pending';
  priority?: 'high' | 'medium' | 'low';
  requiredPermission?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  currentPage?: string;
  userPermissions?: string[];
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentPage,
  userPermissions = []
}) => {
  // Check if user has specific permission
  const hasPermission = useCallback((permission: string) => {
    if (!userPermissions || userPermissions.length === 0) return true; // Default to allow if no permissions specified
    return userPermissions.includes(permission);
  }, [userPermissions]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration with permission requirements
  const mockResults: SearchResult[] = useMemo(() => [
    {
      id: '1',
      title: 'Welcome to BENIRAGE Studio',
      description: 'Getting started guide for new users',
      type: 'content' as const,
      icon: BookOpen,
      url: '/content/welcome-guide',
      tags: ['getting-started', 'guide'],
      lastModified: '2024-01-15',
      status: 'published',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Hero Banner Image',
      description: 'Main homepage hero banner',
      type: 'media' as const,
      icon: Image,
      url: '/media/hero-banner.jpg',
      tags: ['hero', 'banner', 'homepage'],
      lastModified: '2024-01-14',
      requiredPermission: 'media:view'
    },
    {
      id: '3',
      title: 'User Management Settings',
      description: 'Configure user permissions and roles',
      type: 'settings' as const,
      icon: Settings,
      url: '/settings/users',
      tags: ['users', 'permissions'],
      lastModified: '2024-01-13',
      requiredPermission: 'users:manage'
    },
    {
      id: '4',
      title: 'Content Analytics Dashboard',
      description: 'Track content performance and engagement',
      type: 'analytics' as const,
      icon: BarChart3,
      url: '/analytics/content',
      tags: ['analytics', 'performance'],
      lastModified: '2024-01-12',
      requiredPermission: 'analytics:view'
    }
  ], []);

  // Popular quick actions with permission requirements
  const quickActions = [
    { label: 'New Content', icon: FileText, action: () => onNavigate('/content/new'), hotkey: 'Ctrl+N', permission: 'content:create' },
    { label: 'Media Library', icon: Image, action: () => onNavigate('/media-library'), hotkey: 'Ctrl+M', permission: 'media:view' },
    { label: 'User Management', icon: Users, action: () => onNavigate('/users'), hotkey: 'Ctrl+U', permission: 'users:manage' },
    { label: 'Analytics', icon: BarChart3, action: () => onNavigate('/analytics'), hotkey: 'Ctrl+A', permission: 'analytics:view' },
    { label: 'Settings', icon: Settings, action: () => onNavigate('/settings'), hotkey: 'Ctrl+,', permission: 'settings:view' }
  ];

  // Popular searches
  const popularSearches = useMemo(() => [
    'Content Editor', 'User Permissions', 'Media Upload', 'Analytics Reports', 
    'SEO Settings', 'Email Templates', 'Backup & Restore', 'API Documentation'
  ], []);

  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock results based on query and permissions
    const filtered = mockResults
      .filter(result => {
        // Exclude current page from results to avoid confusion
        if (currentPage && result.url === currentPage) {
          return false;
        }
        
        // Check if user has permission for this result
        if (result.requiredPermission && !hasPermission(result.requiredPermission)) {
          return false;
        }
        
        // Filter by search query
        const matchesQuery = 
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
          
        return matchesQuery;
      });

    setResults(filtered);
    setIsLoading(false);

    // Add to recent searches
    const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('cms-recent-searches', JSON.stringify(updatedRecent));
  }, [mockResults, recentSearches, hasPermission, currentPage]);

  const handleResultClick = useCallback((result: SearchResult) => {
    onNavigate(result.url);
    onClose();
  }, [onNavigate, onClose]);

  // Initialize focus
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          } else if (query.trim()) {
            performSearch(query.trim());
          }
          break;
        case '/':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            inputRef.current?.focus();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, results, selectedIndex, onClose, handleResultClick, performSearch]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Generate search suggestions
  useEffect(() => {
    if (query.length > 0) {
      const filteredSuggestions = popularSearches.filter(search =>
        search.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, popularSearches]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'content': return FileText;
      case 'media': return Image;
      case 'user': return Users;
      case 'settings': return Settings;
      case 'analytics': return BarChart3;
      case 'page': return Globe;
      default: return FileText;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-start justify-center pt-16">
      <div 
        ref={searchRef}
        className="cms-card-dark w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
      >
        
        {/* Search Header */}
        <div className="flex items-center p-4 border-b border-gray-700">
          <Search className="w-5 h-5 text-amber-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content, users, settings, analytics..."
            className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-400"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            icon={X}
            className="cms-btn-ghost-dark ml-2"
          />
        </div>

        {/* Search Content */}
        <div className="max-h-96 overflow-y-auto">
          
          {/* Quick Actions */}
          {query.length === 0 && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="cms-text-secondary text-sm font-medium mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.filter(action => !action.permission || hasPermission(action.permission)).map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                    >
                      <IconComponent className="w-4 h-4 text-amber-400" />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{action.label}</div>
                        <div className="cms-text-tertiary text-xs">{action.hotkey}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {query.length > 0 && suggestions.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="cms-text-secondary text-sm font-medium mb-3">Suggestions</h3>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      performSearch(suggestion);
                    }}
                    className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <Search className="w-4 h-4 cms-text-tertiary" />
                    <span className="text-white text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="cms-text-secondary text-sm font-medium mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Recent Searches
              </h3>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      performSearch(search);
                    }}
                    className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 cms-text-tertiary" />
                    <span className="text-white text-sm">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {query.length === 0 && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="cms-text-secondary text-sm font-medium mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Popular
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      performSearch(search);
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm text-white transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="cms-text-secondary">Searching...</p>
            </div>
          )}

          {!isLoading && query.length > 0 && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 cms-text-tertiary mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">No results found</h3>
              <p className="cms-text-secondary text-sm">
                Try adjusting your search terms or browse the suggestions above.
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="p-2">
              <div className="space-y-1">
                {results.map((result, index) => {
                  const IconComponent = getResultIcon(result.type);
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                        isSelected ? 'bg-amber-500/20 border border-amber-500/30' : 'hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-amber-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium truncate">{result.title}</h4>
                          {result.status && (
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(result.status)} flex-shrink-0`} />
                          )}
                          {result.priority && (
                            <Star className={`w-3 h-3 ${getPriorityColor(result.priority)} flex-shrink-0`} />
                          )}
                        </div>
                        <p className="cms-text-secondary text-sm truncate">{result.description}</p>
                        
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex items-center space-x-1 mt-2">
                            {result.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded text-xs cms-text-tertiary">
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 3 && (
                              <span className="cms-text-tertiary text-xs">+{result.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        {result.lastModified && (
                          <p className="cms-text-tertiary text-xs mt-1">
                            Modified {new Date(result.lastModified).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <ArrowRight className="w-4 h-4 cms-text-tertiary flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-gray-700">
          <div className="flex items-center space-x-4 cms-text-tertiary text-xs">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
            <span className="hidden sm:inline">/ Focus</span>
          </div>
          
          <div className="flex items-center space-x-2 cms-text-tertiary text-xs">
            <Search className="w-3 h-3" />
            <span>Global Search</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;