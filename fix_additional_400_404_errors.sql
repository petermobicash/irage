-- ===============================================
-- FIX FOR HTTP 400/404 ERRORS - CONTENT TAGS & SEO PAGES
-- ===============================================
-- This script fixes the remaining HTTP 400/404 errors after the main database fix:
-- 1. HTTP 400 on content_tags query (likely count join syntax error)
-- 2. HTTP 404 on seo_pages query (table doesn't exist)

BEGIN;

-- ===============================================
-- STEP 1: CHECK AND CREATE content_tags TABLE
-- ===============================================

-- Create content_tags table if missing
CREATE TABLE IF NOT EXISTS public.content_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for content_tags
DROP POLICY IF EXISTS "content_tags_select_all" ON public.content_tags;
CREATE POLICY "content_tags_select_all"
ON public.content_tags
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "content_tags_manage_admin" ON public.content_tags;
CREATE POLICY "content_tags_manage_admin"
ON public.content_tags
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_tags_name ON public.content_tags(name);
CREATE INDEX IF NOT EXISTS idx_content_tags_slug ON public.content_tags(slug);
CREATE INDEX IF NOT EXISTS idx_content_tags_is_active ON public.content_tags(is_active);

-- ===============================================
-- STEP 2: CHECK AND CREATE seo_pages TABLE  
-- ===============================================

-- Create seo_pages table if missing
CREATE TABLE IF NOT EXISTS public.seo_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT,
    description TEXT,
    keywords TEXT[],
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    canonical_url TEXT,
    robots TEXT DEFAULT 'index,follow',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for seo_pages
DROP POLICY IF EXISTS "seo_pages_select_all" ON public.seo_pages;
CREATE POLICY "seo_pages_select_all"
ON public.seo_pages
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "seo_pages_manage_admin" ON public.seo_pages;
CREATE POLICY "seo_pages_manage_admin"
ON public.seo_pages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seo_pages_url ON public.seo_pages(url);
CREATE INDEX IF NOT EXISTS idx_seo_pages_is_active ON public.seo_pages(is_active);

-- ===============================================
-- STEP 3: INSERT DEFAULT DATA
-- ===============================================

-- Insert default content tags
INSERT INTO public.content_tags (name, slug, description, color) VALUES
('Technology', 'technology', 'Technology and software development', '#3B82F6'),
('Business', 'business', 'Business and entrepreneurship', '#10B981'),
('Education', 'education', 'Educational content', '#F59E0B'),
('Health', 'health', 'Health and wellness', '#EF4444'),
('Lifestyle', 'lifestyle', 'Lifestyle and personal development', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Insert default SEO pages
INSERT INTO public.seo_pages (url, title, description, keywords) VALUES
('/', 'Benirage - Digital Platform', 'Welcome to Benirage digital platform', ARRAY['benirage', 'digital', 'platform']),
('/about', 'About Us - Benirage', 'Learn about Benirage platform and mission', ARRAY['about', 'benirage', 'mission']),
('/contact', 'Contact Us - Benirage', 'Get in touch with Benirage team', ARRAY['contact', 'benirage', 'support'])
ON CONFLICT (url) DO NOTHING;

-- ===============================================
-- STEP 4: VERIFICATION
-- ===============================================

DO $$
DECLARE
    content_tags_exists BOOLEAN;
    seo_pages_exists BOOLEAN;
    content_tags_count INTEGER;
    seo_pages_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ADDITIONAL FIXES VERIFICATION';
    RAISE NOTICE '========================================';
    
    -- Check table existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'content_tags'
    ) INTO content_tags_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'seo_pages'
    ) INTO seo_pages_exists;
    
    -- Count records
    SELECT COUNT(*) INTO content_tags_count FROM public.content_tags;
    SELECT COUNT(*) INTO seo_pages_count FROM public.seo_pages;
    
    IF content_tags_exists THEN
        RAISE NOTICE '✅ content_tags table: EXISTS (% tags)', content_tags_count;
    ELSE
        RAISE NOTICE '❌ content_tags table: MISSING';
    END IF;
    
    IF seo_pages_exists THEN
        RAISE NOTICE '✅ seo_pages table: EXISTS (% pages)', seo_pages_count;
    ELSE
        RAISE NOTICE '❌ seo_pages table: MISSING';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'HTTP 400/404 errors should now be resolved!';
    RAISE NOTICE '========================================';
END $$;

COMMIT;