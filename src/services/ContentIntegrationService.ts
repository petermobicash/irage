/**
 * Content Integration Service
 * Automatically pulls content from CMS tables and provides dynamic data
 * for Events, Team Members, and Blog Posts
 */

import { supabase } from '../lib/supabase';

export interface EventData {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location?: string;
  status: string;
  content_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  type: string;
  status: string;
  featured?: boolean;
  featured_image?: string;
  author: string;
  author_id?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views_count?: number;
  likes_count?: number;
  tags?: string[];
  categories?: any;
  seo_meta_title?: string;
  seo_meta_description?: string;
}

export interface StoryData {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_name: string;
  author_email?: string;
  author_location?: string;
  story_type: string;
  category: string;
  is_anonymous: boolean;
  is_featured?: boolean;
  is_approved: boolean;
  tags: string[];
  media_type?: 'text' | 'audio' | 'video' | 'mixed';
  audio_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  transcript?: string;
  view_count: number;
  submitted_at: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberData {
  id: string;
  username?: string;
  full_name: string;
  email: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  skills?: string[];
  languages?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentIntegrationOptions {
  limit?: number;
  filter?: {
    status?: string;
    type?: string;
    featured?: boolean;
    upcoming?: boolean;
    event_type?: string;
    story_type?: string;
    category?: string;
    role?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface ContentIntegrationResult<T> {
  success: boolean;
  data: T[];
  error?: string;
  totalCount?: number;
  hasMore?: boolean;
}

class ContentIntegrationService {
  /**
   * Fetch events from content_calendar table
   */
  async getEvents(options: ContentIntegrationOptions = {}): Promise<ContentIntegrationResult<EventData>> {
    try {
      let query = supabase
        .from('content_calendar')
        .select('*');

      // Apply filters
      if (options.filter?.status) {
        query = query.eq('status', options.filter.status);
      }

      if (options.filter?.event_type) {
        query = query.eq('event_type', options.filter.event_type);
      }

      if (options.filter?.upcoming) {
        query = query.gte('start_date', new Date().toISOString());
      }

      if (options.filter?.dateRange) {
        query = query
          .gte('start_date', options.filter.dateRange.start)
          .lte('end_date', options.filter.dateRange.end);
      }

      // Apply sorting
      if (options.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.order === 'asc' });
      } else {
        query = query.order('start_date', { ascending: true });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        totalCount: count || 0,
        hasMore: data && options.limit ? data.length === options.limit : false
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fetch blog posts from content table (type: 'post' or 'blog')
   */
  async getBlogPosts(options: ContentIntegrationOptions = {}): Promise<ContentIntegrationResult<BlogPostData>> {
    try {
      let query = supabase
        .from('content')
        .select('*')
        .in('type', ['post', 'blog', 'article']);

      // Apply filters
      if (options.filter?.status) {
        query = query.eq('status', options.filter.status);
      } else {
        // Default to published content
        query = query.eq('status', 'published');
      }

      if (options.filter?.type) {
        query = query.eq('type', options.filter.type);
      }

      if (options.filter?.featured !== undefined) {
        query = query.eq('featured', options.filter.featured);
      }

      if (options.filter?.dateRange) {
        query = query
          .gte('published_at', options.filter.dateRange.start)
          .lte('published_at', options.filter.dateRange.end);
      }

      // Apply sorting
      if (options.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.order === 'asc' });
      } else {
        query = query.order('published_at', { ascending: false });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        totalCount: count || 0,
        hasMore: data && options.limit ? data.length === options.limit : false
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fetch stories from stories table
   */
  async getStories(options: ContentIntegrationOptions = {}): Promise<ContentIntegrationResult<StoryData>> {
    try {
      let query = supabase
        .from('stories')
        .select('*')
        .eq('is_approved', true); // Only show approved stories

      // Apply filters
      if (options.filter?.featured !== undefined) {
        query = query.eq('is_featured', options.filter.featured);
      }

      if (options.filter?.story_type) {
        query = query.eq('story_type', options.filter.story_type);
      }

      if (options.filter?.category) {
        query = query.eq('category', options.filter.category);
      }

      // Apply sorting
      if (options.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.order === 'asc' });
      } else {
        query = query.order('approved_at', { ascending: false });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        totalCount: count || 0,
        hasMore: data && options.limit ? data.length === options.limit : false
      };
    } catch (error) {
      console.error('Error fetching stories:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    };
  }

  /**
   * Fetch team members from user_profiles table
   */
  async getTeamMembers(options: ContentIntegrationOptions = {}): Promise<ContentIntegrationResult<TeamMemberData>> {
    try {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (options.filter?.role) {
        query = query.eq('role', options.filter.role);
      }

      // Apply sorting
      if (options.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.order === 'asc' });
      } else {
        query = query.order('full_name', { ascending: true });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        totalCount: count || 0,
        hasMore: data && options.limit ? data.length === options.limit : false
      };
    } catch (error) {
      console.error('Error fetching team members:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get all content types in one call
   */
  async getAllContent(options: Partial<ContentIntegrationOptions> = {}): Promise<{
    events: ContentIntegrationResult<EventData>;
    blogPosts: ContentIntegrationResult<BlogPostData>;
    stories: ContentIntegrationResult<StoryData>;
    teamMembers: ContentIntegrationResult<TeamMemberData>;
  }> {
    const limit = options.limit || 10;
    
    return {
      events: await this.getEvents({ ...options, limit }),
      blogPosts: await this.getBlogPosts({ ...options, limit }),
      stories: await this.getStories({ ...options, limit }),
      teamMembers: await this.getTeamMembers({ ...options, limit })
    };
  }

  /**
   * Subscribe to real-time changes for a specific content type
   */
  subscribeToChanges(
    type: 'events' | 'blogPosts' | 'stories' | 'teamMembers',
    callback: (payload: any) => void
  ): () => void {
    let tableName = '';
    
    switch (type) {
      case 'events':
        tableName = 'content_calendar';
        break;
      case 'blogPosts':
        tableName = 'content';
        break;
      case 'stories':
        tableName = 'stories';
        break;
      case 'teamMembers':
        tableName = 'user_profiles';
        break;
      default:
        throw new Error(`Unknown content type: ${type}`);
    }

    const subscription = supabase
      .channel(`content_integration_${type}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Get content by ID
   */
  async getContentById(type: 'events' | 'blogPosts' | 'stories' | 'teamMembers', id: string) {
    let tableName = '';
    
    switch (type) {
      case 'events':
        tableName = 'content_calendar';
        break;
      case 'blogPosts':
        tableName = 'content';
        break;
      case 'stories':
        tableName = 'stories';
        break;
      case 'teamMembers':
        tableName = 'user_profiles';
        break;
      default:
        throw new Error(`Unknown content type: ${type}`);
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      success: true,
      data,
      error: null
    };
  }
}

// Export singleton instance
const contentIntegrationService = new ContentIntegrationService();
export default contentIntegrationService;