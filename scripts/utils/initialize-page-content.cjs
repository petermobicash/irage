/**
 * Initialize Page Content for Comment System
 * Creates content entries for all pages that use the comment system
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

// UUID generator function
function generateUUID() {
    return crypto.randomUUID ? crypto.randomUUID() :
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const pageContentData = [
    {
        slug: 'home-page',
        title: 'Home Page',
        type: 'page',
        status: 'published',
        author: 'System',
        content: 'Welcome to BENIRAGE - Building Excellence through Nurturing Individuals, Relationships, and Growth in Every Community.',
        excerpt: 'BENIRAGE home page for community discussions',
        allow_comments: true
    },
    {
        slug: 'about-page',
        title: 'About Page',
        type: 'page',
        status: 'published',
        author: 'System',
        content: 'Learn about BENIRAGE and our mission to build excellence through nurturing individuals, relationships, and growth.',
        excerpt: 'About BENIRAGE organization',
        allow_comments: true
    },
    {
        slug: 'spiritual-page',
        title: 'Spiritual Page',
        type: 'page',
        status: 'published',
        author: 'System',
        content: 'Explore spiritual growth and development through BENIRAGE programs and community engagement.',
        excerpt: 'Spiritual development and growth',
        allow_comments: true
    },
    {
        slug: 'culture-page',
        title: 'Culture Page',
        type: 'page',
        status: 'published',
        author: 'System',
        content: 'Discover and celebrate cultural heritage, traditions, and community values through BENIRAGE.',
        excerpt: 'Cultural heritage and traditions',
        allow_comments: true
    },
    {
        slug: 'philosophy-page',
        title: 'Philosophy Page',
        type: 'page',
        status: 'published',
        author: 'System',
        content: 'Explore philosophical discussions and wisdom sharing through BENIRAGE Philosophy Cafe.',
        excerpt: 'Philosophy and wisdom discussions',
        allow_comments: true
    },
    {
        slug: 'community-discussions',
        title: 'Community Discussions',
        type: 'page',
        status: 'published',
        author: 'System',
        content: 'Join our community discussions and share your thoughts with fellow members.',
        excerpt: 'Community discussions and engagement',
        allow_comments: true
    }
];

async function initializePageContent() {
    try {
        console.log('🚀 Initializing page content for comment system...');

        for (const pageData of pageContentData) {
            console.log(`\n📄 Processing: ${pageData.slug}`);

            // Check if content already exists
            const { data: existingContent, error: checkError } = await supabase
                .from('content')
                .select('id, title')
                .eq('slug', pageData.slug)
                .maybeSingle();

            if (checkError) {
                console.error(`❌ Error checking content for ${pageData.slug}:`, checkError);
                continue;
            }

            if (existingContent) {
                console.log(`✅ Content already exists: ${existingContent.title} (ID: ${existingContent.id})`);
                continue;
            }

            // Create content entry
            const contentId = generateUUID();
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
                console.error(`❌ Error creating content for ${pageData.slug}:`, insertError);
            } else {
                console.log(`✅ Created content entry: ${pageData.title} (ID: ${contentId})`);
            }
        }

        console.log('\n🎉 Page content initialization completed!');
        console.log('📝 Comments should now work on all pages that use the CommentSystem component.');

    } catch (error) {
        console.error('❌ Error initializing page content:', error);
        process.exit(1);
    }
}

// Run the initialization
initializePageContent()
    .then(() => {
        console.log('\n✨ All done! You can now test comments on your website.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    });
