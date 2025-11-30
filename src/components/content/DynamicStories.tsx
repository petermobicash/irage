/**
 * Dynamic Stories Component
 * Automatically displays multimedia stories from stories table
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Play, Volume2, Eye, MapPin, User, Calendar, Tag, ExternalLink, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ContentIntegrationService, { StoryData, ContentIntegrationOptions } from '../../services/ContentIntegrationService';

interface DynamicStoriesProps {
  limit?: number;
  showFilters?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onStoryClick?: (story: StoryData) => void;
  className?: string;
  featuredOnly?: boolean;
  storyType?: string;
  category?: string;
  mediaType?: 'text' | 'audio' | 'video' | 'mixed';
}

const DynamicStories: React.FC<DynamicStoriesProps> = ({
  limit = 6,
  showFilters = true,
  showViewAll = true,
  onViewAll,
  onStoryClick,
  className = '',
  featuredOnly = false,
  storyType,
  category,
  mediaType
}) => {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    featured: featuredOnly,
    story_type: storyType || '',
    category: category || '',
    media_type: mediaType || ''
  });

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options: ContentIntegrationOptions = {
        limit,
        filter: {
          featured: filters.featured,
          ...(filters.story_type && { story_type: filters.story_type }),
          ...(filters.category && { category: filters.category }),
          ...(filters.media_type && { type: filters.media_type })
        },
        sort: {
          field: 'approved_at',
          order: 'desc'
        }
      };

      const result = await ContentIntegrationService.getStories(options);
      
      if (result.success) {
        setStories(result.data);
      } else {
        setError(result.error || 'Failed to load stories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limit, filters]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = ContentIntegrationService.subscribeToChanges('stories', (payload) => {
      console.log('Real-time story update:', payload);
      fetchStories(); // Refresh data when changes occur
    });

    return unsubscribe;
  }, [fetchStories]);

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

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'audio':
        return <Volume2 className="w-4 h-4" />;
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'mixed':
        return <div className="flex items-center space-x-1">
          <Volume2 className="w-3 h-3" />
          <Play className="w-3 h-3" />
        </div>;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getMediaTypeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'audio':
        return 'bg-orange-100 text-orange-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'mixed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'spiritual': 'bg-blue-100 text-blue-800',
      'cultural': 'bg-yellow-100 text-yellow-800',
      'philosophical': 'bg-purple-100 text-purple-800',
      'community': 'bg-green-100 text-green-800',
      'personal_growth': 'bg-indigo-100 text-indigo-800',
      'heritage': 'bg-red-100 text-red-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStoryTypeColor = (storyType: string) => {
    const colors: { [key: string]: string } = {
      'personal': 'bg-blue-100 text-blue-800',
      'family': 'bg-green-100 text-green-800',
      'cultural': 'bg-yellow-100 text-yellow-800',
      'historical': 'bg-red-100 text-red-800',
      'wisdom': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[storyType?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handlePlayAudio = (story: StoryData) => {
    if (story.audio_url) {
      const audio = new Audio(story.audio_url);
      audio.play();
    }
  };

  const handlePlayVideo = (story: StoryData) => {
    if (story.video_url) {
      window.open(story.video_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Community Stories</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Failed to Load Stories</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchStories} variant="outline">
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
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Community Stories</h3>
          <span className="text-sm text-gray-500">({stories.length})</span>
        </div>
        {showViewAll && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            icon={ExternalLink}
          >
            View All Stories
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="flex items-center space-x-4 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            
            <select
              value={filters.story_type}
              onChange={(e) => handleFilterChange('story_type', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="personal">Personal Stories</option>
              <option value="family">Family History</option>
              <option value="cultural">Cultural Traditions</option>
              <option value="historical">Historical Events</option>
              <option value="wisdom">Wisdom Teachings</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="spiritual">Spiritual</option>
              <option value="cultural">Cultural</option>
              <option value="philosophical">Philosophical</option>
              <option value="community">Community</option>
              <option value="personal_growth">Personal Growth</option>
              <option value="heritage">Heritage</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filters.media_type}
              onChange={(e) => handleFilterChange('media_type', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Media</option>
              <option value="text">Text Only</option>
              <option value="audio">Audio Stories</option>
              <option value="video">Video Stories</option>
              <option value="mixed">Mixed Media</option>
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

      {/* Stories Grid */}
      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Card 
              key={story.id} 
              className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => onStoryClick?.(story)}
            >
              <div className="space-y-4">
                {/* Media Thumbnail */}
                <div className="aspect-video overflow-hidden rounded-lg bg-gray-100 relative">
                  {story.thumbnail_url ? (
                    <img
                      src={story.thumbnail_url}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {story.media_type === 'audio' ? '🎵' : 
                           story.media_type === 'video' ? '🎥' : 
                           story.media_type === 'mixed' ? '🎬' : '📖'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {story.media_type === 'text' ? 'Text Story' : 
                           story.media_type === 'audio' ? 'Audio Story' :
                           story.media_type === 'video' ? 'Video Story' :
                           'Mixed Media'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Play Button Overlay for audio/video */}
                  {(story.media_type === 'audio' || story.media_type === 'video' || story.media_type === 'mixed') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {story.media_type === 'audio' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              if (e) {
                                e.stopPropagation();
                              }
                              handlePlayAudio(story);
                            }}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            Play Audio
                          </Button>
                        )}
                        {story.media_type === 'video' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              if (e) {
                                e.stopPropagation();
                              }
                              handlePlayVideo(story);
                            }}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Watch Video
                          </Button>
                        )}
                        {story.media_type === 'mixed' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              if (e) {
                                e.stopPropagation();
                              }
                              handlePlayVideo(story);
                            }}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            View Story
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Story Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getMediaTypeColor(story.media_type || 'text')}`}>
                        {getMediaTypeIcon(story.media_type || 'text')}
                        <span className="ml-1">{story.media_type || 'text'}</span>
                      </span>
                      {story.is_featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {story.title}
                  </h4>
                </div>

                {/* Story Excerpt */}
                <p className="text-gray-600 text-sm line-clamp-3">
                  {story.excerpt || story.content.substring(0, 150) + '...'}
                </p>

                {/* Story Meta */}
                <div className="space-y-2">
                  {/* Author */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{story.is_anonymous ? 'Anonymous' : story.author_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{story.view_count}</span>
                    </div>
                  </div>

                  {/* Location & Date */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {story.author_location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{story.author_location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(story.approved_at || story.submitted_at)}</span>
                    </div>
                  </div>

                  {/* Story Type & Category */}
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStoryTypeColor(story.story_type)}`}>
                      {story.story_type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(story.category)}`}>
                      {story.category}
                    </span>
                  </div>

                  {/* Tags */}
                  {story.tags && story.tags.length > 0 && (
                    <div className="flex items-center space-x-1 flex-wrap">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {story.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {story.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{story.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Stories Found</h3>
          <p className="text-gray-500">
            {featuredOnly ? 'No featured stories available at the moment.' : 'No stories match your current filters.'}
          </p>
        </Card>
      )}

      {/* Real-time Update Indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Updates automatically when new stories are approved</span>
        </p>
      </div>
    </div>
  );
};

export default DynamicStories;