import React, { useState, useEffect, useCallback } from 'react';
import { supabase, getContent, deleteContent } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import { 
  FileText, Edit, Trash2, Plus, Search, Grid, List,
  Eye, Calendar, User, Clock, MoreVertical, Archive,
  Copy, Tag
} from 'lucide-react';
import Button from '../ui/Button';
import '../../styles/cms-dark-theme.css';

type Content = Database['public']['Tables']['content']['Row'];

interface ModernContentListProps {
  contentType?: string;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
}

const ModernContentList: React.FC<ModernContentListProps> = ({ 
  contentType, 
  onEdit, 
  onCreateNew 
}) => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadContent = useCallback(async () => {
    try {
      const result = await getContent(contentType, 'all', 100);

      if (result.success && result.data) {
        setContent(result.data);
      } else {
        console.error('Error loading content:', result.error);
        setContent([]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, [contentType]);

  useEffect(() => {
    loadContent();
  }, [contentType, loadContent]);

  const deleteContentItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to delete content.');
        return;
      }

      const result = await deleteContent(id, user.email || 'Unknown');

      if (result.success) {
        setContent(prev => prev.filter(item => item.id !== id));
        alert('Content deleted successfully');
      } else {
        console.error('Error deleting content:', result.error);
        alert(`Error deleting content: ${typeof result.error === 'string' ? result.error : 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert(`Error deleting content: ${error instanceof Error ? error.message : 'Please try again'}`);
    }
  };

  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredContent.map(item => item.id)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'cms-badge-success';
      case 'pending_review': return 'cms-badge-warning';
      case 'draft': return 'cms-badge-info';
      default: return 'cms-badge-info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <Eye className="w-3 h-3" />;
      case 'pending_review': return <Clock className="w-3 h-3" />;
      case 'draft': return <FileText className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredContent = content
    .filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchLower)) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.author.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Content] as string;
      const bValue = b[sortBy as keyof Content] as string;
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div className="cms-dark-theme min-h-screen flex items-center justify-center">
        <div className="cms-card-dark p-8 text-center cms-fade-in">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="cms-text-secondary">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cms-dark-theme space-y-6 cms-fade-in">
      {/* Enhanced Header */}
      <div className="cms-card-dark p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="cms-heading-lg text-white mb-2">Content Management</h2>
            <p className="cms-text-secondary">Manage and organize your website content</p>
            {selectedItems.size > 0 && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm cms-text-tertiary">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <Button size="sm" variant="outline" className="cms-btn-ghost-dark">
                  Bulk Actions
                </Button>
                <Button size="sm" variant="outline" className="cms-btn-ghost-dark">
                  Archive
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-amber-500 text-white' 
                    : 'cms-text-secondary hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-amber-500 text-white' 
                    : 'cms-text-secondary hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            
            <Button onClick={onCreateNew} icon={Plus} className="cms-btn-primary-dark">
              Create New Content
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="cms-card-dark p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 cms-text-tertiary" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 cms-input-dark"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cms-select-dark min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="cms-select-dark min-w-[140px]"
            >
              <option value="updated_at-desc">Newest First</option>
              <option value="updated_at-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="created_at-desc">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content List/Grid */}
      {filteredContent.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className={`cms-card-dark p-6 hover-lift cms-fade-in ${
                viewMode === 'grid' ? 'text-center' : ''
              }`}
            >
              {/* Grid View Header */}
              {viewMode === 'grid' && (
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="rounded border-gray-600 text-amber-600 focus:ring-amber-500 bg-gray-800"
                  />
                  <div className={`cms-badge-dark ${getStatusColor(item.status || 'draft')}`}>
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(item.status || 'draft')}
                      <span>{item.status || 'draft'}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* List View Layout */}
              {viewMode === 'list' && (
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="rounded border-gray-600 text-amber-600 focus:ring-amber-500 bg-gray-800"
                  />
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="cms-heading-md text-white truncate">{item.title}</h3>
                    <p className="cms-text-secondary text-sm truncate">
                      {item.excerpt || 'No excerpt available'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs cms-text-tertiary">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{item.author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.updated_at)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{item.type}</span>
                      </span>
                      <div className={`cms-badge-dark ${getStatusColor(item.status || 'draft')}`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(item.status || 'draft')}
                          <span>{item.status || 'draft'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item.id)}
                      icon={Edit}
                      className="cms-btn-ghost-dark"
                    >
                      Edit
                    </Button>
                    
                    <div className="relative group">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={MoreVertical}
                        className="cms-btn-ghost-dark"
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <button
                          onClick={() => deleteContentItem(item.id)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm cms-text-secondary hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                        <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm cms-text-secondary hover:bg-gray-700 hover:text-white transition-colors">
                          <Copy className="w-4 h-4" />
                          <span>Duplicate</span>
                        </button>
                        <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm cms-text-secondary hover:bg-gray-700 hover:text-white transition-colors">
                          <Archive className="w-4 h-4" />
                          <span>Archive</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid View Content */}
              {viewMode === 'grid' && (
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="cms-heading-md text-white mb-2 line-clamp-2">{item.title}</h3>
                  <p className="cms-text-secondary text-sm mb-4 line-clamp-3">
                    {item.excerpt || 'No excerpt available'}
                  </p>
                  
                  <div className="space-y-2 mb-4 text-xs cms-text-tertiary">
                    <div className="flex items-center justify-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{item.author}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.updated_at)}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{item.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`cms-badge-dark ${getStatusColor(item.status || 'draft')}`}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(item.status || 'draft')}
                        <span>{item.status || 'draft'}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item.id)}
                        icon={Edit}
                        className="cms-btn-ghost-dark"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="cms-card-dark text-center py-16 cms-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-12 h-12 cms-text-secondary" />
          </div>
          <h3 className="cms-heading-lg text-white mb-2">
            {searchTerm ? 'No Content Found' : 'No Content Yet'}
          </h3>
          <p className="cms-text-secondary mb-8 max-w-md mx-auto">
            {searchTerm 
              ? 'No content matches your search criteria. Try adjusting your filters or search terms.'
              : 'Start creating content for your website. Click the button below to get started.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={onCreateNew} icon={Plus} className="cms-btn-primary-dark">
              Create Your First Content
            </Button>
          )}
        </div>
      )}

      {/* Select All Checkbox for List View */}
      {viewMode === 'list' && filteredContent.length > 0 && (
        <div className="cms-card-dark p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedItems.size === filteredContent.length}
                onChange={selectAllItems}
                className="rounded border-gray-600 text-amber-600 focus:ring-amber-500 bg-gray-800"
              />
              <span className="cms-text-secondary">
                {selectedItems.size === filteredContent.length 
                  ? 'Deselect all' 
                  : `Select all (${filteredContent.length} items)`}
              </span>
            </div>
            
            {selectedItems.size > 0 && (
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="cms-btn-ghost-dark">
                  Bulk Edit
                </Button>
                <Button size="sm" variant="outline" className="cms-btn-ghost-dark">
                  Export
                </Button>
                <Button size="sm" variant="outline" className="cms-btn-ghost-dark">
                  Archive
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernContentList;