-- Fix form_fields table schema mismatch
-- Add missing columns that FormFieldManager component expects

BEGIN;

-- Add missing columns to form_fields table
ALTER TABLE public.form_fields
ADD COLUMN IF NOT EXISTS page_id TEXT DEFAULT 'contact',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived'));

-- Update existing records to have default values
UPDATE public.form_fields
SET 
    page_id = COALESCE(page_id, 'contact'),
    status = COALESCE(status, 'published')
WHERE page_id IS NULL OR status IS NULL;

-- Add index for page_id for better performance
CREATE INDEX IF NOT EXISTS idx_form_fields_page_id ON public.form_fields(page_id);

-- Update existing records to use validation_rules from individual validation fields
UPDATE public.form_fields
SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{validation_rules}',
    jsonb_build_object(
        'min_length', validation_min_length,
        'max_length', validation_max_length,
        'pattern', validation_pattern
    )
)
WHERE settings ? 'validation_rules' = false OR settings->'validation_rules' IS NULL;

RAISE NOTICE '✅ Added missing columns to form_fields table:';
RAISE NOTICE '   - page_id (TEXT, default: "contact")';
RAISE NOTICE '   - status (TEXT, default: "published")';
RAISE NOTICE '✅ Updated existing records with default values';
RAISE NOTICE '✅ Created index on page_id for performance';
RAISE NOTICE '✅ Migrated validation fields to validation_rules JSONB';

COMMIT;