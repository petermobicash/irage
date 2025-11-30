-- ===============================================
-- MINIMAL FIX FOR HTTP 404 ERRORS - SEO PAGES TABLE
-- ===============================================
-- Just create the essential seo_pages table

BEGIN;

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

-- Insert default SEO pages
INSERT INTO public.seo_pages (url, title, description, keywords) VALUES
('/', 'Benirage - Digital Platform', 'Welcome to Benirage digital platform', ARRAY['benirage', 'digital', 'platform']),
('/about', 'About Us - Benirage', 'Learn about Benirage platform and mission', ARRAY['about', 'benirage', 'mission']),
('/contact', 'Contact Us - Benirage', 'Get in touch with Benirage team', ARRAY['contact', 'benirage', 'support'])
ON CONFLICT (url) DO NOTHING;

COMMIT;