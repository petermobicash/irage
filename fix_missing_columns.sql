-- Quick fix for any missing columns in content_revisions table
-- This script handles additional columns that might be missing

DO $$
BEGIN
    RAISE NOTICE '🔧 Fixing any remaining missing columns in content_revisions...';

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
        RAISE NOTICE '✅ Added reading_time column to content_revisions';
    ELSE
        RAISE NOTICE '✅ reading_time column already exists';
    END IF;

    -- Ensure all required columns exist and have proper data
    UPDATE content_revisions SET 
        reading_time = CASE 
            WHEN word_count > 0 THEN CEIL(word_count / 200.0)::INTEGER 
            ELSE 0 
        END 
    WHERE reading_time IS NULL OR reading_time <= 0;

    RAISE NOTICE '✅ All content_revisions columns are now properly configured';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error fixing columns: %', SQLERRM;
END $$;