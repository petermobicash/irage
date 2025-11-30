-- Fix content_revisions table schema issues
-- This script addresses the column naming inconsistencies causing errors

-- First, let's check the current schema
DO $$
BEGIN
    RAISE NOTICE 'Checking current content_revisions table schema...';
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add author_id as alias for created_by_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_revisions' AND column_name = 'author_id'
    ) THEN
        ALTER TABLE content_revisions ADD COLUMN author_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added author_id column to content_revisions';
    END IF;

    -- Add version_number as alias for revision_number
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_revisions' AND column_name = 'version_number'
    ) THEN
        ALTER TABLE content_revisions ADD COLUMN version_number INTEGER;
        -- Copy data from revision_number to version_number
        UPDATE content_revisions SET version_number = revision_number WHERE version_number IS NULL;
        RAISE NOTICE 'Added version_number column to content_revisions';
    END IF;

    -- Add change_summary as alias for changes_summary
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_revisions' AND column_name = 'change_summary'
    ) THEN
        ALTER TABLE content_revisions ADD COLUMN change_summary TEXT;
        UPDATE content_revisions SET change_summary = changes_summary WHERE change_summary IS NULL;
        RAISE NOTICE 'Added change_summary column to content_revisions';
    END IF;

    -- Add author_name as alias for created_by
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_revisions' AND column_name = 'author_name'
    ) THEN
        ALTER TABLE content_revisions ADD COLUMN author_name TEXT;
        UPDATE content_revisions SET author_name = created_by WHERE author_name IS NULL;
        RAISE NOTICE 'Added author_name column to content_revisions';
    END IF;

    -- Add reading_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_revisions' AND column_name = 'reading_time'
    ) THEN
        ALTER TABLE content_revisions ADD COLUMN reading_time INTEGER;
        -- Calculate reading time based on word count (assuming 200 words per minute)
        UPDATE content_revisions SET reading_time = CASE 
            WHEN word_count > 0 THEN CEIL(word_count / 200.0)::INTEGER 
            ELSE 0 
        END 
        WHERE reading_time IS NULL;
        RAISE NOTICE 'Added reading_time column to content_revisions';
    END IF;
END $;

-- Create views to make the aliases work seamlessly
CREATE OR REPLACE VIEW content_revisions_view AS
SELECT 
    id,
    content_id,
    revision_number,
    revision_number as version_number, -- Alias
    title,
    content,
    excerpt,
    changes_summary,
    changes_summary as change_summary, -- Alias
    created_by,
    created_by as author_name, -- Alias
    created_at,
    is_current,
    diff_data,
    word_count,
    character_count,
    created_by_id,
    created_by_id as author_id, -- Alias
    reading_time
FROM content_revisions;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_revisions_content_id ON content_revisions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_revision_number ON content_revisions(revision_number);
CREATE INDEX IF NOT EXISTS idx_content_revisions_created_by_id ON content_revisions(created_by_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_is_current ON content_revisions(is_current);

-- Create trigger to automatically sync alias columns
CREATE OR REPLACE FUNCTION sync_content_revisions_aliases()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync version_number with revision_number
    NEW.version_number = NEW.revision_number;
    
    -- Sync change_summary with changes_summary
    NEW.change_summary = NEW.changes_summary;
    
    -- Sync author_name with created_by
    NEW.author_name = NEW.created_by;
    
    -- Sync author_id with created_by_id
    NEW.author_id = NEW.created_by_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_content_revisions_aliases ON content_revisions;

-- Create the trigger
CREATE TRIGGER trigger_sync_content_revisions_aliases
    BEFORE INSERT OR UPDATE ON content_revisions
    FOR EACH ROW
    EXECUTE FUNCTION sync_content_revisions_aliases();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Content revisions schema fix completed successfully!';
    RAISE NOTICE '✅ Added alias columns: author_id, version_number, change_summary, author_name';
    RAISE NOTICE '✅ Created sync trigger for automatic column synchronization';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Schema cache refreshed';
END $$;