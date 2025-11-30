-- ===============================================
-- QUICK FIX FOR HTTP 500 ERROR (42P17: undefined table)
-- ===============================================
-- Copy this entire script and paste into Supabase SQL Editor
-- This fixes the user_profiles table that your application is trying to access

BEGIN;

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
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
    custom_permissions TEXT[] DEFAULT '{}',
    admin_access_permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Remove conflicting policies
DROP POLICY IF EXISTS "User profiles policy" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins full access" ON public.user_profiles;

-- Create permissive policies
CREATE POLICY "profiles_select_all"
ON public.user_profiles
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "profiles_insert_own"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_service_role"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Link existing auth users to user_profiles
INSERT INTO public.user_profiles (user_id, username, display_name, status, is_online, role)
SELECT
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    'offline',
    false,
    'user'
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, user_profiles.username),
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
    updated_at = NOW();

-- Verify fix worked
DO $$
BEGIN
    RAISE NOTICE 'HTTP 500 ERROR FIX COMPLETED';
    RAISE NOTICE '==========================';
    RAISE NOTICE 'user_profiles table: %', 
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
             THEN 'CREATED/EXISTS' ELSE 'MISSING' END;
    RAISE NOTICE 'Total profiles: %', (SELECT COUNT(*) FROM public.user_profiles);
    RAISE NOTICE 'RLS policies: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_profiles');
    RAISE NOTICE '';
    RAISE NOTICE 'Your HTTP 500 error should now be resolved!';
    RAISE NOTICE 'Test: GET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?select=*&order=created_at.desc';
END $$;

COMMIT;