-- Simple schema fix for content_revisions table
-- This script adds missing columns safely

-- Add missing columns one by one with proper error handling
DO $$
BEGIN
    RAISE NOTICE 'Starting content_revisions schema fix...';

    -- Add author_id column if it doesn't exist
    BEGIN
        ALTER TABLE content_revisions ADD COLUMN author_id UUID REFERENCES auth.users(id);
        RAISE NOTICE '✅ Added author_id column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE '✅ author_id column already exists';
    END;

    -- Add version_number column if it doesn't exist
    BEGIN
        ALTER TABLE content_revisions ADD COLUMN version_number INTEGER;
        UPDATE content_revisions SET version_number = revision_number WHERE version_number IS NULL;
        RAISE NOTICE '✅ Added version_number column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE '✅ version_number column already exists';
    END;

    -- Add change_summary column if it doesn't exist
    BEGIN
        ALTER TABLE content_revisions ADD COLUMN change_summary TEXT;
        UPDATE content_revisions SET change_summary = changes_summary WHERE change_summary IS NULL;
        RAISE NOTICE '✅ Added change_summary column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE '✅ change_summary column already exists';
    END;

    -- Add author_name column if it doesn't exist
    BEGIN
        ALTER TABLE content_revisions ADD COLUMN author_name TEXT;
        UPDATE content_revisions SET author_name = created_by WHERE author_name IS NULL;
        RAISE NOTICE '✅ Added author_name column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE '✅ author_name column already exists';
    END;

    -- Add reading_time column if it doesn't exist
    BEGIN
        ALTER TABLE content_revisions ADD COLUMN reading_time INTEGER;
        UPDATE content_revisions SET reading_time = CASE 
            WHEN word_count > 0 THEN CEIL(word_count / 200.0)::INTEGER 
            ELSE 0 
        END WHERE reading_time IS NULL;
        RAISE NOTICE '✅ Added reading_time column';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE '✅ reading_time column already exists';
    END;

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_content_revisions_content_id ON content_revisions(content_id);
    CREATE INDEX IF NOT EXISTS idx_content_revisions_revision_number ON content_revisions(revision_number);
    CREATE INDEX IF NOT EXISTS idx_content_revisions_created_by_id ON content_revisions(created_by_id);
    CREATE INDEX IF NOT EXISTS idx_content_revisions_is_current ON content_revisions(is_current);
    RAISE NOTICE '✅ Created performance indexes';

    -- Create sync function if it doesn't exist
    CREATE OR REPLACE FUNCTION sync_content_revisions_aliases()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.version_number = NEW.revision_number;
        NEW.change_summary = NEW.changes_summary;
        NEW.author_name = NEW.created_by;
        NEW.author_id = NEW.created_by_id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop and recreate trigger
    DROP TRIGGER IF EXISTS trigger_sync_content_revisions_aliases ON content_revisions;
    CREATE TRIGGER trigger_sync_content_revisions_aliases
        BEFORE INSERT OR UPDATE ON content_revisions
        FOR EACH ROW EXECUTE FUNCTION sync_content_revisions_aliases();
    
    RAISE NOTICE '✅ Created sync trigger';

    -- Refresh schema cache
    NOTIFY pgrst, 'reload schema';
    RAISE NOTICE '✅ Schema cache refreshed';

    RAISE NOTICE '🎉 Content revisions schema fix completed successfully!';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error during schema fix: %', SQLERRM;
END $$;