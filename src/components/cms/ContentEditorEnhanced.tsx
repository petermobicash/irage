import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, getContent, updateContent } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import { ArrowLeft, Image, X, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, List, ListOrdered, Link2, Quote, Code, Eye, Save, Clock, Users, Sparkles } from 'lucide-react';
import { getUserPermissions } from '../../utils/permissions';
import Card from '../ui/Card';
import Button from '../ui/Button';
import RealTimeCollaboration from '../advanced/RealTimeCollaboration';
import AIContentSuggestions from '../advanced/AIContentSuggestions';
import ContentAnalytics from '../advanced/ContentAnalytics';
import ContentVersioning from '../advanced/ContentVersioning';
import { getThumbnailUrl } from '../../utils/cdn';
import ImageUpload from '../ui/ImageUpload';
import { useToast } from '../../hooks/useToast';

interface User {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface ContentEditorProps {
  contentId?: string;
  contentType: string;
  currentUser?: User;
  onSave: () => void;
  onCancel: () => void;
}

const ContentEditorEnhanced: React.FC<ContentEditorProps> = ({
  contentId,
  contentType,
  currentUser,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Database['public']['Tables']['content']['Insert']>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    type: contentType,
    status: 'draft',
    author: currentUser?.email || 'Admin User',
    categories: {},
    tags: {},
    featured_image: '',
    seo_meta_title: '',
    seo_meta_description: '',
    seo_keywords: {},
    seo_og_image: '',
    allow_comments: true,
    featured: false,
    sticky: false,
    word_count: 0,
    reading_time: 0,
    version_number: 1,
    author_id: currentUser?.id || null,
    last_edited_by_id: currentUser?.id || null,
    last_edited_by: currentUser?.email || 'Admin User',
    gallery: {},
    initiated_by: currentUser?.email || 'Admin User',
    initiated_by_id: currentUser?.id || null,
    review_notes: '',
    published_by: '',
    published_by_id: null,
    rejected_by: '',
    rejected_by_id: null,
    rejection_reason: '',
    scheduled_for: '',
    edit_lock_expires: '',
    parent_content_id: null,
    content_template_id: null,
    reviewed_by: '',
    reviewed_by_id: null,
    reviewed_at: '',
    published_at: '',
    rejected_at: '',
    initiated_at: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [mediaItems, setMediaItems] = useState<Array<{
    id: string;
    url: string;
    storage_path?: string;
    filename?: string;
    original_name: string;
  }>>([]);
  
  const permissions = getUserPermissions(currentUser);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !formData.title.trim() || !contentId) return;
    
    setAutoSaving(true);
    try {
      const contentData = {
        ...formData,
        status: 'draft',
        updated_at: new Date().toISOString(),
        auto_saved_at: new Date().toISOString()
      };

      const result = await updateContent(contentId, contentData);
      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        showToast('Auto-saved successfully', 'success');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [formData, hasUnsavedChanges, contentId, showToast]);

  // Set up auto-save interval
  useEffect(() => {
    if (hasUnsavedChanges && contentId) {
      autoSaveTimeoutRef.current = setTimeout(autoSave, 30000); // Auto-save every 30 seconds
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, contentId, autoSave]);

  const loadMediaItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .in('type', ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
        .order('uploaded_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Error loading media items:', error);
      showToast('Failed to load media items', 'error');
    }
  }, [showToast]);

  const loadContent = useCallback(async () => {
    if (!contentId) return;

    setLoading(true);
    try {
      const result = await getContent('all', 'all');

      if (result.success && result.data) {
        const content = result.data.find(item => item.id === contentId);

        if (content) {
          setFormData({
            title: content.title || '',
            slug: content.slug || '',
            content: content.content || '',
            excerpt: content.excerpt || '',
            type: content.type || contentType,
            status: content.status || 'draft',
            author: content.author || 'Admin User',
            categories: content.categories || {},
            tags: content.tags || {},
            featured_image: content.featured_image || '',
            seo_meta_title: content.seo_meta_title || '',
            seo_meta_description: content.seo_meta_description || '',
            seo_keywords: content.seo_keywords || {},
            seo_og_image: content.seo_og_image || '',
            allow_comments: content.allow_comments !== false,
            featured: content.featured || false,
            sticky: content.sticky || false,
            word_count: content.word_count || 0,
            reading_time: content.reading_time || 0,
            version_number: content.version_number || 1,
            author_id: content.author_id || currentUser?.id || null,
            last_edited_by_id: content.last_edited_by_id || currentUser?.id || null,
            last_edited_by: content.last_edited_by || currentUser?.email || 'Admin User',
            gallery: content.gallery || {},
            initiated_by: content.initiated_by || currentUser?.email || 'Admin User',
            initiated_by_id: content.initiated_by_id || currentUser?.id || null,
            review_notes: content.review_notes || '',
            published_by: content.published_by || '',
            published_by_id: content.published_by_id || null,
            rejected_by: content.rejected_by || '',
            rejected_by_id: content.rejected_by_id || null,
            rejection_reason: content.rejection_reason || '',
            scheduled_for: content.scheduled_for || '',
            edit_lock_expires: content.edit_lock_expires || '',
            parent_content_id: content.parent_content_id || null,
            content_template_id: content.content_template_id || null,
            reviewed_by: content.reviewed_by || '',
            reviewed_by_id: content.reviewed_by_id || null,
            reviewed_at: content.reviewed_at || '',
            published_at: content.published_at || '',
            rejected_at: content.rejected_at || '',
            initiated_at: content.initiated_at || ''
          });
          setHasUnsavedChanges(false);
        }
      }
    } catch (error) {
      console.error('Error loading content:', error);
      showToast('Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  }, [contentId, currentUser, contentType, showToast]);

  useEffect(() => {
    if (contentId) {
      loadContent();
    }
    loadMediaItems();
  }, [contentId, loadContent, loadMediaItems]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: string, value: string | number | boolean | string[] | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug from title
      if (field === 'title' && typeof value === 'string') {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
    setHasUnsavedChanges(true);
  };

  // Enhanced WYSIWYG Editor functions with better compatibility
  const execCommand = (command: string, value?: string) => {
    try {
      document.execCommand(command, false, value);
      updateContentFromEditor();
    } catch (error) {
      console.error('Editor command failed:', error);
      showToast('Editor command failed', 'error');
    }
  };

  const updateContentFromEditor = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      handleInputChange('content', content);
    }
  };

  const handleEditorInput = () => {
    updateContentFromEditor();
  };



  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      // Validate URL
      try {
        new URL(url);
        execCommand('createLink', url);
        showToast('Link inserted successfully', 'success');
      } catch {
        showToast('Please enter a valid URL', 'error');
      }
    }
  };

  const insertImage = () => {
    if (mediaItems.length > 0) {
      setShowMediaLibrary(true);
    } else {
      const url = prompt('Enter image URL:');
      if (url) {
        try {
          new URL(url);
          execCommand('insertImage', url);
          showToast('Image inserted successfully', 'success');
        } catch {
          showToast('Please enter a valid image URL', 'error');
        }
      }
    }
  };

  const toggleFormat = (command: string) => {
    try {
      execCommand(command);
      editorRef.current?.focus();
    } catch (error) {
      console.error('Format toggle failed:', error);
      showToast('Formatting command failed', 'error');
    }
  };

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const calculateWordCount = (content: string): number => {
    return content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSave = async (status: string = 'draft') => {
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Please fill in title and content', 'error');
      return;
    }
    
    // Check permissions for publishing
    if (status === 'published' && !permissions.canPublishContent) {
      status = 'pending_review';
      showToast('Content submitted for review. You do not have permission to publish directly.', 'warning');
    }

    setSaving(true);
    
    try {
      const wordCount = calculateWordCount(formData.content);
      const readingTime = calculateReadingTime(formData.content);
      
      const contentData = {
        ...formData,
        status,
        word_count: wordCount,
        reading_time: readingTime,
        updated_at: new Date().toISOString()
      };

      if (contentId) {
        // Update existing content
        const result = await updateContent(contentId, contentData);
        if (!result.success) {
          throw new Error('Failed to update content');
        }
        showToast(`Content ${status === 'published' ? 'published' : 'updated'} successfully!`, 'success');
      } else {
        // Create new content
        const { error } = await supabase
          .from('content')
          .insert([{
            ...contentData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        showToast(`Content ${status === 'published' ? 'published' : 'created'} successfully!`, 'success');
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      onSave();
      
    } catch (error) {
      console.error('Error saving content:', error);
      showToast('Error saving content', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onCancel} icon={ArrowLeft}>
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              {contentId ? 'Edit' : 'Create'} {contentType}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Last saved: {formatLastSaved(lastSaved)}</span>
              {autoSaving && (
                <span className="flex items-center text-amber-600">
                  <Clock className="w-3 h-3 mr-1 animate-spin" />
                  Auto-saving...
                </span>
              )}
              {hasUnsavedChanges && !autoSaving && (
                <span className="text-amber-600">Unsaved changes</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
            icon={Sparkles}
          >
            {showAdvancedFeatures ? 'Hide' : 'Show'} Advanced Features
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            icon={Eye}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')} 
            disabled={saving || autoSaving}
            icon={Save}
          >
            {saving || autoSaving ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : (
              'Save Draft'
            )}
          </Button>
          <Button
            onClick={() => handleSave(permissions.canPublishContent ? 'published' : 'pending_review')}
            disabled={saving || autoSaving}
            icon={Users}
          >
            {saving || autoSaving ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : (
              permissions.canPublishContent ? 'Publish' : 'Submit for Review'
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Features */}
      {showAdvancedFeatures && contentId && (
        <div className="space-y-6">
          <RealTimeCollaboration
            contentId={contentId}
            currentUser={currentUser || { id: '', email: '', full_name: '' }}
            onContentChange={(content) => handleInputChange('content', content)}
          />
          
          <AIContentSuggestions
            content={formData.content}
            title={formData.title}
            contentType={formData.type}
            contentId={contentId || ''}
            onApplySuggestion={(suggestion) => {
              if (suggestion.after && suggestion.before) {
                const updatedContent = formData.content.replace(suggestion.before, suggestion.after);
                handleInputChange('content', updatedContent);
              }
            }}
          />
          
          <ContentAnalytics contentId={contentId} />
          
          <ContentVersioning
            contentId={contentId}
            currentContent={formData.content}
            onRestoreVersion={(content) => handleInputChange('content', content)}
          />
        </div>
      )}

      {/* Enhanced Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter content title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="url-friendly-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Content *
                </label>
                {showPreview ? (
                  <div
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[400px] prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                ) : (
                  <div className="border border-gray-300 rounded-lg">
                    {/* Enhanced WYSIWYG Toolbar */}
                    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
                      {/* Text Formatting */}
                      <button
                        type="button"
                        onClick={() => toggleFormat('bold')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFormat('italic')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFormat('underline')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      
                      {/* Headings */}
                      <button
                        type="button"
                        onClick={() => execCommand('formatBlock', '<h1>')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Heading 1"
                      >
                        <Type className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('formatBlock', '<h2>')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Heading 2"
                      >
                        <Type className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('formatBlock', '<h3>')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Heading 3"
                      >
                        <Type className="w-2 h-2" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      
                      {/* Alignment */}
                      <button
                        type="button"
                        onClick={() => execCommand('justifyLeft')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('justifyCenter')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('justifyRight')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      
                      {/* Lists */}
                      <button
                        type="button"
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      
                      {/* Media & Links */}
                      <button
                        type="button"
                        onClick={insertLink}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Insert Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={insertImage}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Insert Image"
                      >
                        <Image className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('formatBlock', '<blockquote>')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Quote"
                      >
                        <Quote className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCommand('formatBlock', '<code>')}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                        title="Code Block"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Enhanced WYSIWYG Editor */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
                      className="w-full px-4 py-3 min-h-[400px] focus:outline-none prose max-w-none"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                      dangerouslySetInnerHTML={{ __html: formData.content || '<p>Start writing your content here...</p>' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt || ''}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief description for previews..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">Publishing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Word Count:</span> {formData.word_count}
                </div>
                <div>
                  <span className="font-medium">Reading Time:</span> {formData.reading_time} min
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm text-blue-900">
                  Featured content
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="comments"
                  checked={formData.allow_comments}
                  onChange={(e) => handleInputChange('allow_comments', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="comments" className="text-sm text-blue-900">
                  Allow comments
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">Featured Image</h3>
            <div className="space-y-4">
              <ImageUpload
                currentImage={formData.featured_image || undefined}
                onUpload={(url) => handleInputChange('featured_image', url)}
                onRemove={() => handleInputChange('featured_image', '')}
                maxSize={10}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
                uploadPath="content/featured"
                optimize={true}
                generateThumbnails={true}
                previewSize={{ width: 300, height: 200 }}
              />

              {/* Enhanced Media Library Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                icon={Image}
                className="w-full"
              >
                {showMediaLibrary ? 'Hide' : 'Browse'} Media Library ({mediaItems.length} images)
              </Button>

              {/* Enhanced Media Library Modal */}
              {showMediaLibrary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Select Featured Image</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMediaLibrary(false)}
                        icon={X}
                      >
                        Close
                      </Button>
                    </div>
                    {mediaItems.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {mediaItems.map((item) => (
                          <div
                            key={item.id}
                            className="relative group cursor-pointer"
                            onClick={() => {
                              const imagePath = item.storage_path || item.filename || '';
                              if (imagePath) {
                                handleInputChange('featured_image', getThumbnailUrl(imagePath, 'medium'));
                              }
                              setShowMediaLibrary(false);
                              showToast('Featured image updated', 'success');
                            }}
                          >
                            <img
                              src={getThumbnailUrl(item.storage_path || item.filename || '', 'small')}
                              alt={item.original_name}
                              className="w-full h-20 object-cover rounded border-2 border-transparent group-hover:border-blue-500 transition-colors"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.original_name}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>No images found. Upload some images to the media library first.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">SEO Optimization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo_meta_title || ''}
                  onChange={(e) => handleInputChange('seo_meta_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO title..."
                  maxLength={60}
                />
                <span className="text-xs text-gray-500">{(formData.seo_meta_title || '').length}/60 characters</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.seo_meta_description || ''}
                  onChange={(e) => handleInputChange('seo_meta_description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="SEO description..."
                  maxLength={160}
                />
                <span className="text-xs text-gray-500">{(formData.seo_meta_description || '').length}/160 characters</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentEditorEnhanced;