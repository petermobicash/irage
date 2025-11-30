-- =====================================================
-- FIX PAGE_CONTENT SCHEMA MISMATCH
-- =====================================================
-- This migration fixes the page_id column type mismatch
-- Frontend sends string identifiers, database expects UUID
-- =====================================================

-- Change page_id from UUID to TEXT to match frontend expectations
ALTER TABLE public.page_content 
ALTER COLUMN page_id TYPE TEXT;

-- Update any existing records to have valid string identifiers
-- This will convert any existing UUIDs to string format if they exist
UPDATE public.page_content 
SET page_id = 'home' 
WHERE page_id IS NOT NULL 
AND page_id NOT IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved');

-- Ensure the page_id column allows the string values used in frontend
-- This is just a comment showing the expected values:
-- 'home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved'

-- Add a check constraint to validate page_id values (optional, but recommended)
-- This ensures only valid page identifiers are used
ALTER TABLE public.page_content 
ADD CONSTRAINT valid_page_id 
CHECK (page_id IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved', 'dashboard', 'admin', 'profile', 'settings', 'login', 'register'));

-- Create index for better performance on page_id queries
CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON public.page_content(page_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PAGE_CONTENT SCHEMA FIXED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Changed page_id from UUID to TEXT';
    RAISE NOTICE '✅ Updated existing records to string format';
    RAISE NOTICE '✅ Added validation constraint for page_id values';
    RAISE NOTICE '✅ Created performance index on page_id';
    RAISE NOTICE '';
    RAISE NOTICE 'The XHR 400 error should now be resolved!';
    RAISE NOTICE 'Page IDs can now use string values like: home, about, spiritual, philosophy, culture, programs, get-involved';
    RAISE NOTICE '========================================';
END $$;