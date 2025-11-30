-- ===============================================
-- COMPLETE USER_PROFILES FIX FOR 42P17 ERROR
-- ===============================================
-- This script fixes the "relation user_profiles does not exist" error
-- by ensuring the table exists with proper structure and policies
--
-- Execute this in your Supabase SQL Editor to resolve the 500 error

BEGIN;

-- ===============================================
-- STEP 1: ENSURE USER_PROFILES TABLE EXISTS
-- ===============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    display_name TEXT,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'offline',
    last_seen TIMESTAMPTZ,
    is_online BOOLEAN DEFAULT false,
    phone_number TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    access_level INTEGER DEFAULT 20,
    approval_level INTEGER DEFAULT 20,
    profile_completed BOOLEAN DEFAULT false,
    profile_completion_percentage INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    login_count INTEGER DEFAULT 0,
    timezone TEXT DEFAULT 'Africa/Kigali',
    language_preference TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- STEP 2: CREATE USERS TABLE (IF NEEDED)
-- ===============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'author',
    avatar_url TEXT,
    groups TEXT[],
    custom_permissions TEXT[],
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- STEP 3: DROP CONFLICTING POLICIES
-- ===============================================

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "authenticated_select_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "anonymous_select_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "service_role_full_access_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "User profiles policy" ON public.user_profiles;
DROP POLICY IF EXISTS "User Profiles Management Policy" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Anonymous users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins full access" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;

-- ===============================================
-- STEP 4: CREATE PERMISSIVE RLS POLICIES
-- ===============================================

-- Create policies for user_profiles table
-- Policy 1: Allow all authenticated users to view all profiles
CREATE POLICY "authenticated_select_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow anonymous users to view profiles (for public content)
CREATE POLICY "anonymous_select_all_profiles"
ON public.user_profiles
FOR SELECT
TO anon
USING (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy 4: Users can insert their own profile
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy 5: Allow service role full access (for system operations)
CREATE POLICY "service_role_full_access_profiles"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for users table
CREATE POLICY "authenticated_select_all_users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_update_own_record"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "users_insert_own_record"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "service_role_full_access_users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ===============================================
-- STEP 5: CREATE PERFORMANCE INDEXES
-- ===============================================

-- Indexes for user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_online ON public.user_profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- ===============================================
-- STEP 6: CREATE TRIGGER FUNCTION FOR SYNC
-- ===============================================

-- Create function to sync auth.users with local tables
CREATE OR REPLACE FUNCTION public.sync_user_on_auth_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
    -- Disable RLS for this operation since auth.uid() is not set in triggers
    SET LOCAL row_security = off;

    -- Insert into user_profiles if not exists
    INSERT INTO public.user_profiles (user_id, username, display_name, status, is_online)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'offline',
        false
    )
    ON CONFLICT (user_id) DO UPDATE SET
        username = COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        updated_at = NOW();

    -- Insert into users table if not exists
    INSERT INTO public.users (user_id, name, email, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'author'),
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        email = NEW.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Create trigger for auth.users changes
DROP TRIGGER IF EXISTS sync_user_on_auth_change_trigger ON auth.users;
CREATE TRIGGER sync_user_on_auth_change_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_on_auth_change();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.sync_user_on_auth_change() TO authenticated, anon, service_role, dashboard_user, authenticator;

-- ===============================================
-- STEP 7: LINK EXISTING AUTH USERS
-- ===============================================

-- Create profiles for existing auth users
INSERT INTO public.user_profiles (user_id, username, display_name, status, is_online)
SELECT
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    'offline',
    false
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

-- Create user records for existing auth users
INSERT INTO public.users (user_id, name, email, role, is_active)
SELECT
    au.id,
    COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'author'),
    true
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.users WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- ===============================================
-- STEP 8: VERIFICATION AND SUMMARY
-- ===============================================

DO $$
DECLARE
    table_exists BOOLEAN;
    profile_count INTEGER;
    user_count INTEGER;
    auth_user_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'user_profiles'
        AND table_schema = 'public'
    ) INTO table_exists;

    -- Count records
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
    SELECT COUNT(*) INTO user_count FROM public.users;
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_profiles';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER_PROFILES 42P17 ERROR FIX COMPLETED';
    RAISE NOTICE '========================================';
    
    IF table_exists THEN
        RAISE NOTICE '✅ user_profiles table EXISTS in public schema';
    ELSE
        RAISE NOTICE '❌ user_profiles table MISSING from public schema';
    END IF;
    
    RAISE NOTICE '✅ Created % RLS policies for user_profiles', policy_count;
    RAISE NOTICE '✅ Linked % profiles to % auth users', profile_count, auth_user_count;
    RAISE NOTICE '✅ Created % user records', user_count;
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Set up sync trigger for new users';
    RAISE NOTICE '';
    RAISE NOTICE 'The 42P17 error should now be resolved!';
    RAISE NOTICE 'Test the API call again:';
    RAISE NOTICE 'GET /rest/v1/user_profiles?select=*&user_id=eq.[USER_ID]';
    RAISE NOTICE '========================================';
END $$;

COMMIT;