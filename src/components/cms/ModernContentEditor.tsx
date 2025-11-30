import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Eye, Settings, Image, Link, AlignLeft, AlignCenter, 
  AlignRight, Bold, Italic, Underline, List, ListOrdered, Quote,
  Code, Undo, Redo, FileText, Clock, User, Tag, X, Plus,
  Video, Calendar, Globe
} from 'lucide-react';
import Button from '../ui/Button';
import '../../styles/cms-dark-theme.css';

interface ContentMetadata {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  status: 'draft' | 'published' | 'pending_review';
  tags: string[];
  category: string;
  featuredImage: string | null;
  seoTitle: string;
  seoDescription: string;
  publishDate: string | null;
  updatedAt: string;
}

interface ContentEditorProps {
  contentId?: string;
  onSave: (content: any) => void;
  onPreview: () => void;
  onCancel: () => void;
}

const ModernContentEditor: React.FC<ContentEditorProps> = ({
  contentId,
  onSave,
  onPreview,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'settings'>('editor');
  const [saving, setSaving] = useState(false);
  const [autoSave] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState<ContentMetadata>({
    title: '',
    slug: '',
    excerpt: '',
    author: 'Current User',
    status: 'draft',
    tags: [],
    category: '',
    featuredImage: null,
    seoTitle: '',
    seoDescription: '',
    publishDate: null,
    updatedAt: new Date().toISOString()
  });

  const [availableCategories] = useState([
    'Blog Posts', 'News', 'Tutorials', 'Company Updates', 'Case Studies'
  ]);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !content.trim()) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, metadata, autoSave]);

  // Calculate word count and reading time
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setReadingTime(Math.ceil(words.length / 200)); // Average reading speed
  }, [content]);

  const handleAutoSave = async () => {
    setSaving(true);
    try {
      // Simulate auto-save API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Auto-saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    try {
      const contentData = {
        id: contentId,
        content,
        metadata: {
          ...metadata,
          status: publish ? 'published' : metadata.status,
          updatedAt: new Date().toISOString()
        }
      };

      await onSave(contentData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const insertText = (text: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    setContent(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**bold text**'), title: 'Bold' },
    { icon: Italic, action: () => insertText('*italic text*'), title: 'Italic' },
    { icon: Underline, action: () => insertText('<u>underlined text</u>'), title: 'Underline' },
    { icon: List, action: () => insertText('\n- List item\n'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('\n1. List item\n'), title: 'Numbered List' },
    { icon: Quote, action: () => insertText('\n> Blockquote\n'), title: 'Blockquote' },
    { icon: Code, action: () => insertText('`code`'), title: 'Inline Code' },
    { icon: AlignLeft, action: () => {}, title: 'Align Left' },
    { icon: AlignCenter, action: () => {}, title: 'Align Center' },
    { icon: AlignRight, action: () => {}, title: 'Align Right' }
  ];

  return (
    <div className="cms-dark-theme min-h-screen cms-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="cms-header-dark sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  icon={X}
                  className="cms-btn-ghost-dark"
                >
                  Close
                </Button>
                
                <div className="h-6 w-px bg-gray-600"></div>
                
                <div className="flex items-center space-x-2">
                  {saving && (
                    <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                  )}
                  <span className="cms-text-secondary text-sm">
                    {saving ? 'Saving...' : autoSave ? 'Auto-save on' : 'Auto-save off'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-4 text-sm cms-text-secondary">
                  <span>{wordCount} words</span>
                  <span>{readingTime} min read</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreview}
                  icon={Eye}
                  className="cms-btn-ghost-dark"
                >
                  Preview
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(false)}
                  icon={Save}
                  disabled={saving}
                  className="cms-btn-ghost-dark"
                >
                  Save Draft
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleSave(true)}
                  icon={Globe}
                  disabled={saving}
                  className="cms-btn-primary-dark"
                >
                  Publish
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-6 mt-4 border-b border-gray-700">
              {[
                { id: 'editor', label: 'Editor', icon: FileText },
                { id: 'preview', label: 'Preview', icon: Eye },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent cms-text-secondary hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex">
          
          {/* Main Editor */}
          <div className="flex-1">
            {activeTab === 'editor' && (
              <div className="p-6">
                
                {/* Title Input */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setMetadata(prev => ({
                        ...prev,
                        title: newTitle,
                        slug: formatSlug(newTitle)
                      }));
                    }}
                    placeholder="Enter your title here..."
                    className="w-full text-4xl font-bold bg-transparent border-none outline-none cms-text-primary placeholder-gray-500"
                  />
                </div>

                {/* Toolbar */}
                <div className="cms-card-dark p-4 mb-6">
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    {toolbarButtons.map((button, index) => (
                      <button
                        key={index}
                        onClick={button.action}
                        title={button.title}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors cms-text-secondary hover:text-white"
                      >
                        <button.icon className="w-4 h-4" />
                      </button>
                    ))}
                    
                    <div className="h-6 w-px bg-gray-600 mx-2"></div>
                    
                    <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors cms-text-secondary hover:text-white">
                      <Image className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors cms-text-secondary hover:text-white">
                      <Link className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors cms-text-secondary hover:text-white">
                      <Video className="w-4 h-4" />
                    </button>
                    
                    <div className="h-6 w-px bg-gray-600 mx-2"></div>
                    
                    <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors cms-text-secondary hover:text-white">
                      <Undo className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors cms-text-secondary hover:text-white">
                      <Redo className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Editor */}
                <div className="cms-card-dark p-6">
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your content..."
                    className="w-full h-96 bg-transparent border-none outline-none resize-none cms-text-primary placeholder-gray-500 text-base leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="p-6">
                <div className="cms-card-dark p-8">
                  <div className="prose prose-invert max-w-none">
                    <h1 className="cms-heading-xl">{metadata.title || 'Untitled'}</h1>
                    <div className="cms-text-secondary text-sm mb-6 flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{metadata.author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{readingTime} min read</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(metadata.updatedAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                    
                    <div className="cms-text-base leading-relaxed whitespace-pre-wrap">
                      {content || 'No content yet...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-6 space-y-6">
                
                {/* Basic Settings */}
                <div className="cms-card-dark p-6">
                  <h3 className="cms-heading-md text-white mb-4">Basic Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block cms-text-secondary text-sm font-medium mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={metadata.slug}
                        onChange={(e) => setMetadata(prev => ({ ...prev, slug: e.target.value }))}
                        className="cms-input-dark"
                        placeholder="url-friendly-slug"
                      />
                    </div>
                    
                    <div>
                      <label className="block cms-text-secondary text-sm font-medium mb-2">
                        Category
                      </label>
                      <select
                        value={metadata.category}
                        onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                        className="cms-select-dark"
                      >
                        <option value="">Select category</option>
                        {availableCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block cms-text-secondary text-sm font-medium mb-2">
                        Excerpt
                      </label>
                      <textarea
                        value={metadata.excerpt}
                        onChange={(e) => setMetadata(prev => ({ ...prev, excerpt: e.target.value }))}
                        rows={3}
                        className="cms-textarea-dark"
                        placeholder="Brief description of the content..."
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="cms-card-dark p-6">
                  <h3 className="cms-heading-md text-white mb-4">Tags</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => setMetadata(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index)
                          }))}
                          className="ml-2 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      className="cms-input-dark flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim();
                          if (value && !metadata.tags.includes(value)) {
                            setMetadata(prev => ({
                              ...prev,
                              tags: [...prev.tags, value]
                            }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <Button size="sm" icon={Plus} className="cms-btn-primary-dark">
                      Add
                    </Button>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="cms-card-dark p-6">
                  <h3 className="cms-heading-md text-white mb-4">SEO Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block cms-text-secondary text-sm font-medium mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={metadata.seoTitle}
                        onChange={(e) => setMetadata(prev => ({ ...prev, seoTitle: e.target.value }))}
                        className="cms-input-dark"
                        placeholder="SEO optimized title"
                        maxLength={60}
                      />
                      <div className="text-xs cms-text-tertiary mt-1">
                        {metadata.seoTitle.length}/60 characters
                      </div>
                    </div>
                    
                    <div>
                      <label className="block cms-text-secondary text-sm font-medium mb-2">
                        SEO Description
                      </label>
                      <textarea
                        value={metadata.seoDescription}
                        onChange={(e) => setMetadata(prev => ({ ...prev, seoDescription: e.target.value }))}
                        rows={3}
                        className="cms-textarea-dark"
                        placeholder="Meta description for search engines..."
                        maxLength={160}
                      />
                      <div className="text-xs cms-text-tertiary mt-1">
                        {metadata.seoDescription.length}/160 characters
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publishing Settings */}
                <div className="cms-card-dark p-6">
                  <h3 className="cms-heading-md text-white mb-4">Publishing</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block cms-text-secondary text-sm font-medium mb-2">
                        Status
                      </label>
                      <select
                        value={metadata.status}
                        onChange={(e) => setMetadata(prev => ({ ...prev, status: e.target.value as any }))}
                        className="cms-select-dark"
                      >
                        <option value="draft">Draft</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block cms-text-secondary text-sm font-medium mb-2">
                        Publish Date
                      </label>
                      <input
                        type="datetime-local"
                        value={metadata.publishDate || ''}
                        onChange={(e) => setMetadata(prev => ({ ...prev, publishDate: e.target.value }))}
                        className="cms-input-dark"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernContentEditor;