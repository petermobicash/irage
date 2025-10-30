/**
 * Content Initializer Utility
 * Automatically creates content entries for pages that use the comment system
 */

import { supabase } from '../lib/supabase';

interface PageContentData {
  slug: string;
  title: string;
  type: string;
  status: string;
  author: string;
  content: string;
  excerpt: string;
}

const pageContentData: PageContentData[] = [
  {
    slug: 'home-page',
    title: 'Home Page',
    type: 'page',
    status: 'published',
    author: 'System',
    content: 'Welcome to BENIRAGE - Building Excellence through Nurturing Individuals, Relationships, and Growth in Every Community.',
    excerpt: 'BENIRAGE home page for community discussions'
  },
  {
    slug: 'about-page',
    title: 'About Page',
    type: 'page',
    status: 'published',
    author: 'System',
    content: 'Learn about BENIRAGE and our mission to build excellence through nurturing individuals, relationships, and growth.',
    excerpt: 'About BENIRAGE organization'
  },
  {
    slug: 'spiritual-page',
    title: 'Spiritual Page',
    type: 'page',
    status: 'published',
    author: 'System',
    content: 'Explore spiritual growth and development through BENIRAGE programs and community engagement.',
    excerpt: 'Spiritual development and growth'
  },
  {
    slug: 'culture-page',
    title: 'Culture Page',
    type: 'page',
    status: 'published',
    author: 'System',
    content: 'Discover and celebrate cultural heritage, traditions, and community values through BENIRAGE.',
    excerpt: 'Cultural heritage and traditions'
  },
  {
    slug: 'philosophy-page',
    title: 'Philosophy Page',
    type: 'page',
    status: 'published',
    author: 'System',
    content: 'Explore philosophical discussions and wisdom sharing through BENIRAGE Philosophy Cafe.',
    excerpt: 'Philosophy and wisdom discussions'
  },
  {
    slug: 'community-discussions',
    title: 'Community Discussions',
    type: 'page',
    status: 'published',
    author: 'System',
    content: 'Join our community discussions and share your thoughts with fellow members.',
    excerpt: 'Community discussions and engagement'
  }
];

/**
 * Initialize content entries for pages that use the comment system
 */
export const initializePageContent = async (): Promise<void> => {
  try {
    console.log('Initializing page content for comment system...');

    for (const pageData of pageContentData) {
      // Check if content already exists
      const { data: existingContent, error: checkError } = await supabase
        .from('content')
        .select('id')
        .eq('slug', pageData.slug)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking content for ${pageData.slug}:`, checkError);
        continue;
      }

      if (!existingContent) {
        // Create content entry
        const { error: insertError } = await supabase
          .from('content')
          .insert([{
            id: crypto.randomUUID(),
            title: pageData.title,
            slug: pageData.slug,
            content: pageData.content,
            excerpt: pageData.excerpt,
            type: pageData.type,
            status: pageData.status,
            author: pageData.author,
            author_id: null,
            featured_image: null,
            meta_description: pageData.excerpt,
            tags: [],
            categories: [],
            views_count: 0,
            likes_count: 0,
            comments_count: 0,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error(`Error creating content for ${pageData.slug}:`, insertError);
        } else {
          console.log(`✅ Created content entry for ${pageData.slug}`);
        }
      } else {
        console.log(`✅ Content entry already exists for ${pageData.slug}`);
      }
    }

    console.log('Page content initialization completed');
  } catch (error) {
    console.error('Error initializing page content:', error);
  }
};

/**
 * Initialize a single page content entry
 */
export const initializeSinglePageContent = async (slug: string): Promise<string | null> => {
  try {
    const pageData = pageContentData.find(p => p.slug === slug);
    if (!pageData) {
      console.warn(`No page data found for slug: ${slug}`);
      return null;
    }

    // Check if content already exists
    const { data: existingContent, error: checkError } = await supabase
      .from('content')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking content for ${slug}:`, checkError);
      return null;
    }

    if (existingContent) {
      return existingContent.id;
    }

    // Create content entry
    const contentId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('content')
      .insert([{
        id: contentId,
        title: pageData.title,
        slug: pageData.slug,
        content: pageData.content,
        excerpt: pageData.excerpt,
        type: pageData.type,
        status: pageData.status,
        author: pageData.author,
        author_id: null,
        featured_image: null,
        meta_description: pageData.excerpt,
        tags: [],
        categories: [],
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error(`Error creating content for ${slug}:`, insertError);
      return null;
    }

    console.log(`✅ Created content entry for ${slug}`);
    return contentId;
  } catch (error) {
    console.error(`Error initializing content for ${slug}:`, error);
    return null;
  }
};