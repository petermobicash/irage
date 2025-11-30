import React, { useState, useEffect, useCallback } from 'react';
import { supabase, getContent, deleteContent } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import { FileText, Edit, Trash2, Plus, Search } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

type Content = Database['public']['Tables']['content']['Row'];

interface ContentListProps {
  contentType?: string;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
}

const ContentList: React.FC<ContentListProps> = ({ contentType, onEdit, onCreateNew }) => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to delete content.');
        return;
      }

      const result = await deleteContent(id, user.email || 'Unknown');

      if (result.success) {
        setContent(prev => prev.filter(item => item.id !== id));
        // Show success message
        alert('Content deleted successfully');
      } else {
        console.error('Error deleting content:', result.error);
        const errorMessage = typeof result.error === 'string' ? result.error : 'Unknown error occurred';
        alert(`Error deleting content: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert(`Error deleting content: ${error instanceof Error ? error.message : 'Please try again'}`);
    }
  };

  const filteredContent = content.filter(item => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return item.title.toLowerCase().includes(searchLower) ||
           (item.excerpt && item.excerpt.toLowerCase().includes(searchLower)) ||
           item.content.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="relative">
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

      {/* Content Container */}
      <div className="relative z-10 cms-mobile-space-y-6 space-y-6">
        {/* Enhanced Responsive Header */}
        <div className="cms-mobile-flex cms-tablet-flex-row cms-mobile-items-center cms-mobile-justify-between cms-tablet-justify-between flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="cms-mobile-text-center cms-tablet-text-left text-center sm:text-left">
            <h2 className="cms-mobile-text-xl cms-tablet-text-2xl font-bold text-white">Content Management</h2>
            <p className="cms-mobile-text-sm cms-tablet-text-base text-gray-300">Manage your website content</p>
          </div>
          <div className="cms-mobile-w-full cms-tablet-w-auto">
            <Button 
              onClick={onCreateNew} 
              icon={Plus}
              className="cms-mobile-w-full cms-tablet-w-auto bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium"
            >
              <span className="cms-mobile-hidden cms-tablet-inline">Create New Content</span>
              <span className="cms-mobile-inline cms-tablet-hidden">Create Content</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Responsive Search */}
        <Card className="cms-mobile-p-4 cms-tablet-p-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
          <div className="cms-mobile-flex cms-mobile-items-center cms-mobile-space-x-2 cms-tablet-space-x-4 flex items-center space-x-2 sm:space-x-4">
            <Search className="cms-mobile-w-4 cms-mobile-h-4 cms-tablet-w-5 cms-tablet-h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cms-mobile-text-sm cms-tablet-text-base flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-400 cms-mobile-min-h-[44px]"
            />
          </div>
        </Card>

        {/* Enhanced Responsive Content List */}
        <div className="cms-mobile-space-y-3 cms-tablet-space-y-4 space-y-3 sm:space-y-4">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => (
              <Card key={item.id} className="cms-mobile-p-3 cms-tablet-p-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-amber-500/50 transition-all">
                <div className="cms-mobile-flex cms-mobile-flex-col cms-mobile-space-y-3 cms-tablet-flex-row cms-tablet-items-start cms-tablet-space-x-4 cms-tablet-space-y-0 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start sm:space-x-4">
                  <div className="cms-mobile-flex cms-mobile-items-center cms-mobile-space-x-3 cms-tablet-items-start cms-tablet-space-x-4 flex items-center space-x-3 sm:items-start sm:space-x-4">
                    <div className="cms-mobile-w-10 cms-mobile-h-10 cms-tablet-w-12 cms-tablet-h-12 w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="cms-mobile-w-5 cms-mobile-h-5 cms-tablet-w-6 cms-tablet-h-6 w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                    </div>
                    <div className="cms-mobile-min-w-0 flex-1 min-w-0">
                      <h3 className="cms-mobile-text-base cms-tablet-text-lg font-semibold text-white truncate">{item.title}</h3>
                      <p className="cms-mobile-text-sm cms-tablet-text-base text-gray-300 line-clamp-2">{item.excerpt || 'No excerpt'}</p>
                      <div className="cms-mobile-flex cms-mobile-flex-wrap cms-mobile-gap-2 cms-tablet-items-center cms-tablet-space-x-4 cms-tablet-space-y-0 cms-mobile-mt-2 cms-tablet-mt-0 flex flex-wrap items-center gap-2 sm:gap-0 sm:space-x-4 mt-2 sm:mt-0 text-xs text-gray-400">
                        <span>Type: {item.type}</span>
                        <span>Status: {item.status}</span>
                        <span className="cms-mobile-w-full cms-tablet-w-auto sm:w-auto">Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="cms-mobile-flex cms-mobile-space-x-2 cms-tablet-space-x-2 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(item.id)} 
                      icon={Edit}
                      className="cms-mobile-flex-1 cms-tablet-flex-none border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <span className="cms-mobile-hidden cms-tablet-inline">Edit</span>
                      <Edit className="cms-mobile-w-4 cms-mobile-h-4 cms-tablet-w-4 cms-tablet-h-4 w-4 h-4 sm:hidden" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteContentItem(item.id)} 
                      icon={Trash2}
                      className="cms-mobile-flex-1 cms-tablet-flex-none border-gray-600 text-gray-300 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <span className="cms-mobile-hidden cms-tablet-inline">Delete</span>
                      <Trash2 className="cms-mobile-w-4 cms-mobile-h-4 cms-tablet-w-4 cms-tablet-h-4 w-4 h-4 sm:hidden" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="cms-mobile-p-6 cms-tablet-p-12 text-center bg-gray-800/50 backdrop-blur-xl border border-gray-700/50">
              <FileText className="cms-mobile-w-12 cms-mobile-h-12 cms-tablet-w-16 cms-tablet-h-16 w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="cms-mobile-text-lg cms-tablet-text-xl font-semibold text-white mb-2">No Content Found</h3>
              <p className="cms-mobile-text-sm cms-tablet-text-base text-gray-300 mb-6">
                {searchTerm ? 'No content matches your search.' : 'Start creating content for your website.'}
              </p>
              <Button 
                onClick={onCreateNew} 
                icon={Plus}
                className="cms-mobile-w-full cms-tablet-w-auto bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium"
              >
                Create Your First Content
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentList;