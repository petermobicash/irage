/**
 * Dynamic Blog Posts Component
 * Automatically displays blog posts from content table
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Calendar, User, Eye, Heart, Tag, Share2, ExternalLink, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ContentIntegrationService, { BlogPostData, ContentIntegrationOptions } from '../../services/ContentIntegrationService';

interface DynamicBlogPostsProps {
  limit?: number;
  showFilters?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onPostClick?: (post: BlogPostData) => void;
  className?: string;
  featuredOnly?: boolean;
  contentType?: string;
}

const DynamicBlogPosts: React.FC<DynamicBlogPostsProps> = ({
  limit = 6,
  showFilters = true,
  showViewAll = true,
  onViewAll,
  onPostClick,
  className = '',
  featuredOnly = false,
  contentType = 'blog'
}) => {
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'published',
    type: contentType,
    featured: featuredOnly
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options: ContentIntegrationOptions = {
        limit,
        filter: {
          status: filters.status,
          type: filters.type,
          featured: filters.featured
        },
        sort: {
          field: 'published_at',
          order: 'desc'
        }
      };

      const result = await ContentIntegrationService.getBlogPosts(options);
      
      if (result.success) {
        setPosts(result.data);
      } else {
        setError(result.error || 'Failed to load blog posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limit, filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = ContentIntegrationService.subscribeToChanges('blogPosts', (payload) => {
      console.log('Real-time blog post update:', payload);
      fetchPosts(); // Refresh data when changes occur
    });

    return unsubscribe;
  }, [fetchPosts]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const handleShare = async (post: BlogPostData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: `${window.location.origin}/blog/${post.slug}`
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      const url = `${window.location.origin}/blog/${post.slug}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const getContentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'blog': 'bg-blue-100 text-blue-800',
      'article': 'bg-green-100 text-green-800',
      'news': 'bg-red-100 text-red-800',
      'tutorial': 'bg-purple-100 text-purple-800',
      'announcement': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Latest Blog Posts</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Failed to Load Blog Posts</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchPosts} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Latest Blog Posts</h3>
          <span className="text-sm text-gray-500">({posts.length})</span>
        </div>
        {showViewAll && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            icon={ExternalLink}
          >
            View All Posts
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="blog">Blog Posts</option>
              <option value="article">Articles</option>
              <option value="news">News</option>
              <option value="tutorial">Tutorials</option>
              <option value="post">All Posts</option>
            </select>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Featured only</span>
            </label>
          </div>
        </Card>
      )}

      {/* Blog Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => onPostClick?.(post)}
            >
              <div className="space-y-4">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Post Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getContentTypeColor(post.type)}`}>
                        {post.type}
                      </span>
                      {post.featured && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </div>
                </div>

                {/* Post Excerpt */}
                {post.excerpt && (
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                {/* Post Meta */}
                <div className="space-y-3">
                  {/* Author and Date */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    {post.published_at && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.published_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views_count || 0}</span>
                      </div>
                      {post.likes_count !== undefined && (
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes_count}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs">
                      {calculateReadingTime(post.content)} min read
                    </span>
                  </div>

                  {/* Tags */}
                  {post.tags && Object.keys(post.tags).length > 0 && (
                    <div className="flex items-center space-x-1 flex-wrap">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {Object.keys(post.tags).slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {Object.keys(post.tags).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{Object.keys(post.tags).length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Share Button */}
                <div className="pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      if (e) {
                        e.stopPropagation();
                      }
                      handleShare(post);
                    }}
                    icon={Share2}
                    className="w-full justify-center text-gray-500 hover:text-blue-600"
                  >
                    Share Post
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Blog Posts Found</h3>
          <p className="text-gray-500">
            {featuredOnly ? 'No featured posts available at the moment.' : 'No blog posts match your current filters.'}
          </p>
        </Card>
      )}

      {/* Real-time Update Indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Updates automatically when new posts are published</span>
        </p>
      </div>
    </div>
  );
};

export default DynamicBlogPosts;