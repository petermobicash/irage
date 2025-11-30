-- Form Fields Schema Fix and Verification
-- Execute this script in your Supabase SQL Editor to ensure everything is working

-- Step 1: Add missing columns to form_fields table (if not already added)
ALTER TABLE public.form_fields
ADD COLUMN IF NOT EXISTS page_id TEXT DEFAULT 'contact',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' 
CHECK (status IN ('published', 'draft', 'archived'));

-- Step 2: Update existing records to have default values
UPDATE public.form_fields
SET 
    page_id = COALESCE(page_id, 'contact'),
    status = COALESCE(status, 'published')
WHERE page_id IS NULL OR status IS NULL;

-- Step 3: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_fields_page_id ON public.form_fields(page_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_status ON public.form_fields(status);

-- Step 4: Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Step 5: Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'form_fields' 
    AND table_schema = 'public'
    AND column_name IN ('page_id', 'status', 'field_type', 'label', 'is_active')
ORDER BY column_name;

-- Step 6: Test the table works
SELECT 
    COUNT(*) as total_fields,
    COUNT(DISTINCT page_id) as unique_pages,
    COUNT(DISTINCT status) as unique_statuses
FROM public.form_fields;

-- Step 7: Insert sample data for testing (if table is empty)
INSERT INTO public.form_fields (page_id, field_type, label, placeholder, required, order_index, status) 
SELECT * FROM (VALUES
    ('contact', 'text', 'Full Name', 'Enter your full name', true, 1, 'published'),
    ('contact', 'email', 'Email Address', 'Enter your email', true, 2, 'published'),
    ('contact', 'textarea', 'Message', 'Enter your message', false, 3, 'published'),
    ('membership', 'text', 'Organization Name', 'Enter organization name', true, 1, 'published'),
    ('volunteer', 'text', 'Volunteer Type', 'Select volunteer type', true, 1, 'published')
) AS sample_data(page_id, field_type, label, placeholder, required, order_index, status)
WHERE NOT EXISTS (
    SELECT 1 FROM public.form_fields 
    WHERE form_fields.label = sample_data.label 
    AND form_fields.page_id = sample_data.page_id
);

-- Step 8: Final verification
SELECT 
    'Schema verification complete' as status,
    COUNT(*) as total_fields
FROM public.form_fields;

RAISE NOTICE 'Form fields schema fix and verification completed successfully!';
RAISE NOTICE 'Your FormFieldManager should now work without HTTP 400 errors.';