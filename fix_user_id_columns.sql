-- =====================================================
-- USER_ID COLUMN FIX SCRIPT
-- =====================================================
-- This script identifies which tables are missing user_id columns
-- and applies the necessary fixes
-- =====================================================

BEGIN;

\echo '========================================='
\echo 'FIXING MISSING USER_ID COLUMNS'
\echo '========================================='

-- =====================================================
-- STEP 1: IDENTIFY TABLES MISSING USER_ID
-- =====================================================

\echo 'Step 1: Identifying missing user_id columns...'

-- Check if user_profiles table has user_id column
DO $$
DECLARE
    profiles_has_user_id BOOLEAN;
    user_profiles_has_user_id BOOLEAN;
BEGIN
    -- Check profiles table
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name = 'user_id'
    ) INTO profiles_has_user_id;
    
    -- Check user_profiles table
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'user_id'
    ) INTO user_profiles_has_user_id;
    
    RAISE NOTICE 'profiles.user_id exists: %', profiles_has_user_id;
    RAISE NOTICE 'user_profiles.user_id exists: %', user_profiles_has_user_id;
END $$;

-- =====================================================
-- STEP 2: FIX USER_PROFILES TABLE (Most Common Issue)
-- =====================================================

\echo 'Step 2: Ensuring user_profiles table has user_id column...'

-- Add user_id column to user_profiles if missing
DO $$
DECLARE
    has_user_id BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'user_id'
    ) INTO has_user_id;
    
    IF NOT has_user_id THEN
        RAISE NOTICE 'Adding user_id column to user_profiles table...';
        ALTER TABLE public.user_profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
    ELSE
        RAISE NOTICE 'user_profiles.user_id column already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 3: ENSURE PROFILES TABLE HAS USER_ID
-- =====================================================

\echo 'Step 3: Ensuring profiles table has user_id column...'

-- Check and fix profiles table
DO $$
DECLARE
    has_user_id BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        AND column_name = 'user_id'
    ) INTO has_user_id;
    
    IF NOT has_user_id THEN
        RAISE NOTICE 'Adding user_id column to profiles table...';
        ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
    ELSE
        RAISE NOTICE 'profiles.user_id column already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 4: ADD USER_ID TO OTHER TABLES IF MISSING
-- =====================================================

\echo 'Step 4: Adding user_id to other required tables...'

-- Add user_id to newsletter_subscribers if missing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'newsletter_subscribers'
            AND column_name = 'user_id'
        ) THEN
            RAISE NOTICE 'Adding user_id to newsletter_subscribers...';
            ALTER TABLE public.newsletter_subscribers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user_id ON public.newsletter_subscribers(user_id);
        END IF;
    END IF;
END $$;

-- Add user_id to notifications if missing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'notifications'
            AND column_name = 'user_id'
        ) THEN
            RAISE NOTICE 'Adding user_id to notifications...';
            ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
        END IF;
    END IF;
END $$;

-- Add user_id to typing_indicators if missing
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'typing_indicators') THEN
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'typing_indicators'
            AND column_name = 'user_id'
        ) THEN
            RAISE NOTICE 'Adding user_id to typing_indicators...';
            ALTER TABLE public.typing_indicators ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_typing_indicators_user_id ON public.typing_indicators(user_id);
        END IF;
    END IF;
END $$;

-- =====================================================
-- STEP 5: FIX RLS POLICIES IF NEEDED
-- =====================================================

\echo 'Step 5: Updating RLS policies to use correct user_id references...'

-- Fix user_profiles policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
        CREATE POLICY "Users can view their own profile" ON public.user_profiles
            FOR SELECT USING ((SELECT auth.uid())::text = user_id);
            
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
        CREATE POLICY "Users can update their own profile" ON public.user_profiles
            FOR UPDATE USING ((SELECT auth.uid())::text = user_id)
            WITH CHECK ((SELECT auth.uid())::text = user_id);
    END IF;
END $$;

-- =====================================================
-- STEP 6: VERIFICATION
-- =====================================================

\echo 'Step 6: Verifying all fixes...'

-- Final verification
DO $$
DECLARE
    table_name TEXT;
    column_name TEXT;
    missing_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'FINAL VERIFICATION:';
    
    -- Check critical tables
    FOR table_name IN 
        SELECT unnest(ARRAY['profiles', 'user_profiles', 'newsletter_subscribers', 'notifications', 'typing_indicators'])
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name) THEN
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = table_name
                AND column_name = 'user_id'
            ) INTO column_name;
            
            IF column_name::BOOLEAN THEN
                RAISE NOTICE '✅ % table has user_id column', table_name;
            ELSE
                RAISE NOTICE '❌ % table MISSING user_id column', table_name;
                missing_count := missing_count + 1;
            END IF;
        ELSE
            RAISE NOTICE '⚠️  % table does not exist', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    IF missing_count = 0 THEN
        RAISE NOTICE '🎉 SUCCESS: All tables have user_id columns!';
        RAISE NOTICE 'The "column user_id does not exist" error should now be fixed.';
    ELSE
        RAISE NOTICE '⚠️  WARNING: % tables still missing user_id column', missing_count;
    END IF;
END $$;

\echo '========================================='
\echo 'USER_ID COLUMN FIX COMPLETE'
\echo '========================================='

END;