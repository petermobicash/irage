# XHR 400 Error Fix - Complete Solution

## Problem Diagnosis

Your XHR POST request to `https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/page_content` is returning a **400 Bad Request** error with PostgreSQL error code `22P02` (invalid text representation).

### Root Cause

**Schema Mismatch**: Your React component (`PageContentManager.tsx`) is sending string values like `'home'`, `'about'`, `'philosophy'` for the `page_id` field, but your database schema defines `page_id` as `UUID NOT NULL`.

**Frontend Code** (lines 36-44):
```javascript
const pages = [
  { id: 'home', name: 'Home' },
  { id: 'about', name: 'About' },
  { id: 'spiritual', name: 'Spiritual' },
  { id: 'philosophy', name: 'Philosophy' },
  { id: 'culture', name: 'Culture' },
  { id: 'programs', name: 'Programs' },
  { id: 'get-involved', name: 'Get Involved' }
];
```

**Database Schema** (from `supabase/migrations/005_add_cms_tables.sql` line 230):
```sql
CREATE TABLE IF NOT EXISTS page_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL,  -- ❌ This expects UUID, not strings!
    section_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT,
    UNIQUE(page_id, section_id)
);
```

## Solution

Change the `page_id` column from `UUID` to `TEXT` to match your frontend expectations.

## Implementation Steps

### Option 1: Execute SQL in Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/sshguczouozvsdwzfcbx/sql-editor

2. **Execute the following SQL** in the SQL Editor:

```sql
-- Fix page_content schema mismatch
BEGIN;

-- Change page_id from UUID to TEXT to match frontend expectations
ALTER TABLE public.page_content 
ALTER COLUMN page_id TYPE TEXT;

-- Update any existing records to have valid string identifiers
UPDATE public.page_content 
SET page_id = 'home' 
WHERE page_id IS NOT NULL 
AND page_id NOT IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved');

-- Add validation constraint for page_id values
ALTER TABLE public.page_content 
DROP CONSTRAINT IF EXISTS valid_page_id;
ALTER TABLE public.page_content 
ADD CONSTRAINT valid_page_id 
CHECK (page_id IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved', 'dashboard', 'admin', 'profile', 'settings', 'login', 'register'));

-- Create performance index
CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON public.page_content(page_id);

COMMIT;
```

3. **Verify the fix** by running this test query:

```sql
-- Test query to verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'page_content' 
AND column_name = 'page_id';
```

4. **Test the frontend** by trying to create page content again - the 400 error should be gone!

### Option 2: Apply Migration (Alternative)

If you have proper Supabase CLI setup and migration history:

```bash
# Apply the migration
supabase migration up --linked

# Or if you have the migration file already created
supabase db push --linked
```

## Files Created for This Fix

1. **`fix_page_content_schema_mismatch.sql`** - Direct SQL fix script
2. **`supabase/migrations/20251126111059_fix_page_content_schema_mismatch.sql`** - Properly formatted migration
3. **`scripts/fix_page_content_schema.js`** - Node.js script to execute the fix
4. **`scripts/execute_schema_fix.js`** - Helper script with manual instructions

## What This Fix Does

1. **Changes Data Type**: Converts `page_id` from `UUID` to `TEXT`
2. **Updates Existing Data**: Converts any existing UUID values to string identifiers
3. **Adds Validation**: Ensures only valid page identifiers are used
4. **Improves Performance**: Creates an index for better query performance

## Verification Steps

After applying the fix:

1. **Check Column Type**:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'page_content' 
   AND column_name = 'page_id';
   ```
   Should show `data_type = 'text'`

2. **Test Frontend**: Try creating/editing page content from your React app - should work without 400 errors

3. **Verify Data**: Check that existing data is preserved and new data can be inserted

## Prevention

To prevent similar issues in the future:

1. **Schema-First Development**: Define your database schema before building the frontend
2. **Type Consistency**: Ensure frontend data types match database schema
3. **Migration Testing**: Test all migrations in a development environment first
4. **Error Monitoring**: Monitor for PostgreSQL error codes like `22P02` (data type mismatches)

## Success Indicators

✅ No more `22P02` errors when POSTing to `page_content`  
✅ `page_id` column shows `data_type = 'text'` in schema  
✅ Frontend can successfully create/edit page content  
✅ All existing data is preserved  

---

**Status**: Ready for implementation  
**Priority**: High (blocking functionality)  
**Estimated Fix Time**: 2-5 minutes  

Execute the SQL in your Supabase Dashboard to resolve this issue immediately.