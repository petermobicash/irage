-- Fix Database Schema Issues for Real-time Collaboration
-- This script addresses all the schema mismatches and missing columns

-- =============================================================================
-- FIX CONTENT_REVISIONS TABLE SCHEMA
-- =============================================================================

-- Add missing columns to content_revisions table
DO $$ 
BEGIN
    -- Add version_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'content_revisions' 
                   AND column_name = 'version_number') THEN
        ALTER TABLE content_revisions ADD COLUMN version_number INTEGER;
        
        -- Populate with revision_number values as fallback
        UPDATE content_revisions SET version_number = revision_number 
        WHERE version_number IS NULL;
        
        -- Set default value
        ALTER TABLE content_revisions ALTER COLUMN version_number SET DEFAULT 1;
    END IF;

    -- Add author_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'content_revisions' 
                   AND column_name = 'author_name') THEN
        ALTER TABLE content_revisions ADD COLUMN author_name TEXT;
        
        -- Populate with created_by values
        UPDATE content_revisions SET author_name = created_by 
        WHERE author_name IS NULL;
        
        -- Set default value
        ALTER TABLE content_revisions ALTER COLUMN author_name SET DEFAULT 'Anonymous';
    END IF;

    -- Add author_id column if it doesn't exist (alias for created_by_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'content_revisions' 
                   AND column_name = 'author_id') THEN
        ALTER TABLE content_revisions ADD COLUMN author_id UUID;
        
        -- Populate with created_by_id values
        UPDATE content_revisions SET author_id = created_by_id 
        WHERE author_id IS NULL;
    END IF;

    -- Add change_summary column (alias for changes_summary)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'content_revisions' 
                   AND column_name = 'change_summary') THEN
        ALTER TABLE content_revisions ADD COLUMN change_summary TEXT;
        
        -- Populate with changes_summary values
        UPDATE content_revisions SET change_summary = changes_summary 
        WHERE change_summary IS NULL;
    END IF;

    -- Add reading_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'content_revisions' 
                   AND column_name = 'reading_time') THEN
        ALTER TABLE content_revisions ADD COLUMN reading_time INTEGER;
        
        -- Calculate reading time (assuming 200 words per minute)
        UPDATE content_revisions SET reading_time = CEIL(word_count / 200.0) 
        WHERE reading_time IS NULL;
    END IF;
END $$;

-- =============================================================================
-- FIX CONTENT_LOCKS TABLE SCHEMA
-- =============================================================================

-- Fix content_locks table structure to match code expectations
DO $$ 
BEGIN
    -- Check if content_locks table has the expected structure
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_locks') THEN
        -- Add user_name column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'content_locks' 
                       AND column_name = 'user_name') THEN
            ALTER TABLE content_locks ADD COLUMN user_name TEXT;
            
            -- Update existing locks with user information
            UPDATE content_locks SET user_name = locked_by 
            WHERE user_name IS NULL;
        END IF;

        -- Add user_email column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'content_locks' 
                       AND column_name = 'user_email') THEN
            ALTER TABLE content_locks ADD COLUMN user_email TEXT;
        END IF;

        -- Add user_id column as alias for locked_by_id
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'content_locks' 
                       AND column_name = 'user_id') THEN
            ALTER TABLE content_locks ADD COLUMN user_id UUID;
            
            -- Populate with locked_by_id values
            UPDATE content_locks SET user_id = locked_by_id 
            WHERE user_id IS NULL;
        END IF;

        -- Ensure lock_type column exists and has default
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'content_locks' 
                       AND column_name = 'lock_type') THEN
            ALTER TABLE content_locks ADD COLUMN lock_type TEXT DEFAULT 'editing';
        ELSE
            ALTER TABLE content_locks ALTER COLUMN lock_type SET DEFAULT 'editing';
        END IF;
    END IF;
END $$;

-- =============================================================================
-- CREATE MISSING ANALYTICS FUNCTIONS
-- =============================================================================

-- Create function to update content analytics safely
CREATE OR REPLACE FUNCTION update_content_analytics(
    p_content_id UUID,
    p_views_increment INTEGER DEFAULT 1,
    p_engagement_increment INTEGER DEFAULT 0
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert or update analytics record
    INSERT INTO content_analytics (
        id,
        content_id,
        metric_type,
        metric_value,
        recorded_at,
        created_at
    ) VALUES (
        gen_random_uuid(),
        p_content_id,
        'view',
        p_views_increment,
        now(),
        now()
    )
    ON CONFLICT DO NOTHING;
    
    -- Also update engagement metrics if increment > 0
    IF p_engagement_increment > 0 THEN
        INSERT INTO content_analytics (
            id,
            content_id,
            metric_type,
            metric_value,
            recorded_at,
            created_at
        ) VALUES (
            gen_random_uuid(),
            p_content_id,
            'engagement',
            p_engagement_increment,
            now(),
            now()
        )
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_content_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION update_content_analytics TO anon;

-- =============================================================================
-- FIX ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on content_revisions if not already enabled
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;

-- Create policies for content_revisions
DROP POLICY IF EXISTS "Allow authenticated users to read content_revisions" ON content_revisions;
CREATE POLICY "Allow authenticated users to read content_revisions" 
ON content_revisions FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert content_revisions" ON content_revisions;
CREATE POLICY "Allow authenticated users to insert content_revisions" 
ON content_revisions FOR INSERT 
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update content_revisions" ON content_revisions;
CREATE POLICY "Allow authenticated users to update content_revisions" 
ON content_revisions FOR UPDATE 
TO authenticated
USING (true);

-- Enable RLS on content_locks if not already enabled
ALTER TABLE content_locks ENABLE ROW LEVEL SECURITY;

-- Create policies for content_locks
DROP POLICY IF EXISTS "Allow authenticated users to read content_locks" ON content_locks;
CREATE POLICY "Allow authenticated users to read content_locks" 
ON content_locks FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert content_locks" ON content_locks;
CREATE POLICY "Allow authenticated users to insert content_locks" 
ON content_locks FOR INSERT 
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update content_locks" ON content_locks;
CREATE POLICY "Allow authenticated users to update content_locks" 
ON content_locks FOR UPDATE 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete content_locks" ON content_locks;
CREATE POLICY "Allow authenticated users to delete content_locks" 
ON content_locks FOR DELETE 
TO authenticated
USING (true);

-- Enable RLS on content_analytics if not already enabled
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for content_analytics
DROP POLICY IF EXISTS "Allow everyone to read content_analytics" ON content_analytics;
CREATE POLICY "Allow everyone to read content_analytics" 
ON content_analytics FOR SELECT 
TO public
USING (true);

DROP POLICY IF EXISTS "Allow service role to insert content_analytics" ON content_analytics;
CREATE POLICY "Allow service role to insert content_analytics" 
ON content_analytics FOR INSERT 
TO service_role
WITH CHECK (true);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for content_revisions
CREATE INDEX IF NOT EXISTS idx_content_revisions_content_id ON content_revisions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_created_at ON content_revisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_revisions_is_current ON content_revisions(is_current);
CREATE INDEX IF NOT EXISTS idx_content_revisions_author_id ON content_revisions(author_id);

-- Indexes for content_locks
CREATE INDEX IF NOT EXISTS idx_content_locks_content_id ON content_locks(content_id);
CREATE INDEX IF NOT EXISTS idx_content_locks_expires_at ON content_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_locks_user_id ON content_locks(user_id);

-- Indexes for content_analytics
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_recorded_at ON content_analytics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_analytics_metric_type ON content_analytics(metric_type);

-- =============================================================================
-- CLEANUP EXPIRED LOCKS
-- =============================================================================

-- Remove expired locks
DELETE FROM content_locks 
WHERE expires_at < now();

-- Update statistics
ANALYZE content_revisions;
ANALYZE content_locks;
ANALYZE content_analytics;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if all required columns exist in content_revisions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'content_revisions' 
    AND column_name IN ('version_number', 'author_name', 'author_id', 'change_summary', 'reading_time', 'revision_number')
ORDER BY column_name;

-- Check if content_locks has required structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'content_locks' 
    AND column_name IN ('user_name', 'user_email', 'user_id', 'lock_type')
ORDER BY column_name;

-- Count existing records
SELECT 
    'content_revisions' as table_name, 
    count(*) as record_count 
FROM content_revisions
UNION ALL
SELECT 
    'content_locks' as table_name, 
    count(*) as record_count 
FROM content_locks
UNION ALL
SELECT 
    'content_analytics' as table_name, 
    count(*) as record_count 
FROM content_analytics;