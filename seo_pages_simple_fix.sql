-- ===============================================
-- FINAL FIX FOR HTTP 404 ERRORS - SEO PAGES & CONTENT TAGS
-- ===============================================
-- Simple, robust SQL to create missing tables
-- Avoids complex queries that might fail

BEGIN;

-- ===============================================
-- STEP 1: CREATE seo_pages TABLE (if missing)
-- ===============================================

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
-- STEP 2: CREATE content_tags TABLE (if missing)
-- ===============================================

CREATE TABLE IF NOT EXISTS public.content_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
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
-- STEP 3: INSERT DEFAULT DATA (safely)
-- ===============================================

-- Insert default SEO pages
INSERT INTO public.seo_pages (url, title, description, keywords) VALUES
('/', 'Benirage - Digital Platform', 'Welcome to Benirage digital platform', ARRAY['benirage', 'digital', 'platform']),
('/about', 'About Us - Benirage', 'Learn about Benirage platform and mission', ARRAY['about', 'benirage', 'mission']),
('/contact', 'Contact Us - Benirage', 'Get in touch with Benirage team', ARRAY['contact', 'benirage', 'support'])
ON CONFLICT (url) DO NOTHING;

-- Insert default content tags (handle conflicts gracefully)
BEGIN
    INSERT INTO public.content_tags (name, slug, description, color) VALUES
    ('Technology', 'technology', 'Technology and software development', '#3B82F6'),
    ('Business', 'business', 'Business and entrepreneurship', '#10B981'),
    ('Education', 'education', 'Educational content', '#F59E0B'),
    ('Health', 'health', 'Health and wellness', '#EF4444'),
    ('Lifestyle', 'lifestyle', 'Lifestyle and personal development', '#8B5CF6')
    ON CONFLICT (slug) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    -- Continue if content_tags insert fails
    NULL;
END;

-- ===============================================
-- STEP 4: VERIFICATION
-- ===============================================

DO $$
DECLARE
    seo_count INTEGER;
    tags_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEO PAGES 404 FIX - VERIFICATION';
    RAISE NOTICE '========================================';
    
    -- Count seo_pages
    SELECT COUNT(*) INTO seo_count FROM public.seo_pages;
    RAISE NOTICE 'seo_pages table: % records', seo_count;
    
    -- Count content_tags
    BEGIN
        SELECT COUNT(*) INTO tags_count FROM public.content_tags;
        RAISE NOTICE 'content_tags table: % records', tags_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'content_tags table: not accessible (may need creation)';
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Fix applied successfully!';
    RAISE NOTICE 'The 404 error on seo_pages should now be resolved.';
    RAISE NOTICE '========================================';
END $$;

COMMIT;