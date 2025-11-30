-- ===============================================
-- CREATE MISSING CONTENT TABLES
-- ===============================================
-- This script creates the missing content_locks, content_analytics, 
-- and content_revisions tables that are causing 404 errors
-- Based on TypeScript definitions in supabase.ts

BEGIN;

-- ===============================================
-- 1. CREATE CONTENT_LOCKS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.content_locks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
    locked_by TEXT NOT NULL,
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    lock_type TEXT DEFAULT 'edit',
    session_id TEXT,
    locked_by_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content_locks table
ALTER TABLE public.content_locks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "content_locks_select_policy" ON public.content_locks;
DROP POLICY IF EXISTS "content_locks_insert_policy" ON public.content_locks;
DROP POLICY IF EXISTS "content_locks_update_policy" ON public.content_locks;
DROP POLICY IF EXISTS "content_locks_delete_policy" ON public.content_locks;

-- Create RLS policies for content_locks
CREATE POLICY "content_locks_select_policy"
ON public.content_locks
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "content_locks_insert_policy"
ON public.content_locks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "content_locks_update_policy"
ON public.content_locks
FOR UPDATE
TO authenticated
USING (auth.uid()::text = locked_by OR auth.uid() IS NOT NULL)
WITH CHECK (auth.uid()::text = locked_by OR auth.uid() IS NOT NULL);

CREATE POLICY "content_locks_delete_policy"
ON public.content_locks
FOR DELETE
TO authenticated
USING (auth.uid()::text = locked_by OR auth.uid() IS NOT NULL);

-- Create indexes for content_locks
CREATE INDEX IF NOT EXISTS idx_content_locks_content_id ON public.content_locks(content_id);
CREATE INDEX IF NOT EXISTS idx_content_locks_locked_by ON public.content_locks(locked_by);
CREATE INDEX IF NOT EXISTS idx_content_locks_expires_at ON public.content_locks(expires_at);

-- ===============================================
-- 2. CREATE CONTENT_ANALYTICS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_value INTEGER DEFAULT 1,
    user_id TEXT,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country TEXT,
    device_type TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    user_id_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content_analytics table
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "content_analytics_select_policy" ON public.content_analytics;
DROP POLICY IF EXISTS "content_analytics_insert_policy" ON public.content_analytics;
DROP POLICY IF EXISTS "content_analytics_update_policy" ON public.content_analytics;
DROP POLICY IF EXISTS "content_analytics_delete_policy" ON public.content_analytics;

-- Create RLS policies for content_analytics
CREATE POLICY "content_analytics_select_policy"
ON public.content_analytics
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "content_analytics_insert_policy"
ON public.content_analytics
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "content_analytics_update_policy"
ON public.content_analytics
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "content_analytics_delete_policy"
ON public.content_analytics
FOR DELETE
TO service_role
USING (true);

-- Create indexes for content_analytics
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_id ON public.content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_metric_type ON public.content_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_content_analytics_user_id ON public.content_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_recorded_at ON public.content_analytics(recorded_at);

-- ===============================================
-- 3. CREATE CONTENT_REVISIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS public.content_revisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    changes_summary TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_current BOOLEAN DEFAULT FALSE,
    diff_data JSONB,
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    created_by_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content_revisions table
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "content_revisions_select_policy" ON public.content_revisions;
DROP POLICY IF EXISTS "content_revisions_insert_policy" ON public.content_revisions;
DROP POLICY IF EXISTS "content_revisions_update_policy" ON public.content_revisions;
DROP POLICY IF EXISTS "content_revisions_delete_policy" ON public.content_revisions;

-- Create RLS policies for content_revisions
CREATE POLICY "content_revisions_select_policy"
ON public.content_revisions
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "content_revisions_insert_policy"
ON public.content_revisions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "content_revisions_update_policy"
ON public.content_revisions
FOR UPDATE
TO authenticated
USING (auth.uid()::text = created_by OR auth.uid() IS NOT NULL)
WITH CHECK (auth.uid()::text = created_by OR auth.uid() IS NOT NULL);

CREATE POLICY "content_revisions_delete_policy"
ON public.content_revisions
FOR DELETE
TO authenticated
USING (auth.uid()::text = created_by OR auth.uid() IS NOT NULL);

-- Create indexes for content_revisions
CREATE INDEX IF NOT EXISTS idx_content_revisions_content_id ON public.content_revisions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_revisions_created_by ON public.content_revisions(created_by);
CREATE INDEX IF NOT EXISTS idx_content_revisions_revision_number ON public.content_revisions(content_id, revision_number);
CREATE INDEX IF NOT EXISTS idx_content_revisions_is_current ON public.content_revisions(is_current);

-- ===============================================
-- 4. CREATE HELPER FUNCTIONS
-- ===============================================

-- Function to clean up expired content locks
CREATE OR REPLACE FUNCTION cleanup_expired_content_locks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.content_locks 
    WHERE expires_at < NOW();
    
    RAISE NOTICE 'Cleaned up expired content locks at %', NOW();
END;
$$;

-- Function to get current content lock
CREATE OR REPLACE FUNCTION get_content_lock(p_content_id UUID)
RETURNS public.content_locks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    lock_record public.content_locks;
BEGIN
    SELECT * INTO lock_record
    FROM public.content_locks
    WHERE content_id = p_content_id
    AND expires_at > NOW()
    ORDER BY locked_at DESC
    LIMIT 1;
    
    RETURN lock_record;
END;
$$;

-- Function to acquire content lock
CREATE OR REPLACE FUNCTION acquire_content_lock(
    p_content_id UUID,
    p_locked_by TEXT,
    p_lock_type TEXT DEFAULT 'edit',
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS public.content_locks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_lock public.content_locks;
    existing_lock public.content_locks;
BEGIN
    -- Check for existing valid lock
    SELECT * INTO existing_lock
    FROM public.content_locks
    WHERE content_id = p_content_id
    AND expires_at > NOW()
    AND locked_by != p_locked_by;
    
    IF FOUND THEN
        RAISE EXCEPTION 'Content is already locked by %', existing_lock.locked_by;
    END IF;
    
    -- Remove expired locks for this content
    DELETE FROM public.content_locks
    WHERE content_id = p_content_id
    AND (expires_at <= NOW() OR locked_by = p_locked_by);
    
    -- Create new lock
    INSERT INTO public.content_locks (
        content_id,
        locked_by,
        lock_type,
        expires_at,
        session_id,
        locked_by_id
    ) VALUES (
        p_content_id,
        p_locked_by,
        p_lock_type,
        NOW() + (p_duration_minutes || ' minutes')::INTERVAL,
        session_id(),
        auth.uid()
    ) RETURNING * INTO new_lock;
    
    RETURN new_lock;
END;
$$;

-- Function to release content lock
CREATE OR REPLACE FUNCTION release_content_lock(p_content_id UUID, p_locked_by TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.content_locks
    WHERE content_id = p_content_id
    AND locked_by = p_locked_by;
    
    RETURN FOUND;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_content_locks() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_content_lock(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION acquire_content_lock(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION release_content_lock(UUID, TEXT) TO authenticated;

-- ===============================================
-- 5. CREATE TRIGGERS FOR AUTOMATIC REVISION CREATION
-- ===============================================

-- Function to create content revision
CREATE OR REPLACE FUNCTION create_content_revision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_revision_number INTEGER;
    revision_summary TEXT;
BEGIN
    -- Only create revision if content actually changed
    IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title THEN
        -- Get next revision number
        SELECT COALESCE(MAX(revision_number), 0) + 1 INTO next_revision_number
        FROM public.content_revisions
        WHERE content_id = NEW.id;
        
        -- Create summary of changes
        revision_summary := CASE 
            WHEN OLD.content IS DISTINCT FROM NEW.content AND OLD.title IS DISTINCT FROM NEW.title THEN
                'Updated title and content'
            WHEN OLD.content IS DISTINCT FROM NEW.content THEN
                'Updated content'
            WHEN OLD.title IS DISTINCT FROM NEW.title THEN
                'Updated title'
            ELSE
                'Minor changes'
        END;
        
        -- Create revision record
        INSERT INTO public.content_revisions (
            content_id,
            revision_number,
            title,
            content,
            excerpt,
            changes_summary,
            created_by,
            is_current,
            created_by_id,
            word_count,
            character_count
        ) VALUES (
            NEW.id,
            next_revision_number,
            COALESCE(NEW.title, ''),
            COALESCE(NEW.content, ''),
            NEW.excerpt,
            revision_summary,
            COALESCE(NEW.last_edited_by, NEW.author, 'System'),
            FALSE,  -- Previous revision
            NEW.last_edited_by_id,
            COALESCE(NEW.word_count, 0),
            LENGTH(COALESCE(NEW.content, ''))
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic revision creation
DROP TRIGGER IF EXISTS create_content_revision_trigger ON public.content;
CREATE TRIGGER create_content_revision_trigger
    AFTER UPDATE ON public.content
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title)
    EXECUTE FUNCTION create_content_revision();

-- ===============================================
-- 6. VERIFICATION AND SUMMARY
-- ===============================================

DO $$
DECLARE
    tables_created INTEGER := 0;
    functions_created INTEGER := 0;
BEGIN
    -- Count created tables
    SELECT COUNT(*) INTO tables_created
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('content_locks', 'content_analytics', 'content_revisions');
    
    -- Count created functions
    SELECT COUNT(*) INTO functions_created
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'cleanup_expired_content_locks',
        'get_content_lock',
        'acquire_content_lock',
        'release_content_lock',
        'create_content_revision'
    );
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSING CONTENT TABLES CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Tables created: %/3', tables_created;
    RAISE NOTICE '✅ Functions created: %/5', functions_created;
    RAISE NOTICE '';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '- content_locks: For content editing locks';
    RAISE NOTICE '- content_analytics: For tracking content metrics';
    RAISE NOTICE '- content_revisions: For content version history';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions available:';
    RAISE NOTICE '- get_content_lock(content_id): Check active lock';
    RAISE NOTICE '- acquire_content_lock(content_id, user, type, duration): Lock content';
    RAISE NOTICE '- release_content_lock(content_id, user): Release lock';
    RAISE NOTICE '- cleanup_expired_content_locks(): Clean expired locks';
    RAISE NOTICE '';
    RAISE NOTICE 'The 404 errors should now be resolved!';
    RAISE NOTICE '========================================';
END $$;

COMMIT;