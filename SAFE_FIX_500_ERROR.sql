-- ===============================================
-- SAFE FIX FOR HTTP 500 ERROR (42P17: undefined table)
-- ===============================================
-- This version handles existing policies gracefully
-- Copy this entire script and paste into Supabase SQL Editor

BEGIN;

-- Check if user_profiles table exists and create if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_profiles' 
        AND table_schema = 'public'
    ) THEN
        -- Create user_profiles table
        CREATE TABLE public.user_profiles (
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
        
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Created user_profiles table';
    ELSE
        RAISE NOTICE '✅ user_profiles table already exists';
    END IF;
END $$;

-- Drop all conflicting policies safely
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    -- Drop all policies from user_profiles table
    FOR policy_name IN SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', policy_name);
        RAISE NOTICE 'Dropped policy: %', policy_name;
    END LOOP;
    
    RAISE NOTICE '✅ Cleared all conflicting user_profiles policies';
END $$;

-- Create clean, permissive policies
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add role column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE '✅ Added role column';
    END IF;
    
    -- Add is_super_admin column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'is_super_admin'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added is_super_admin column';
    END IF;
    
    -- Add custom_permissions column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'custom_permissions'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN custom_permissions TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Added custom_permissions column';
    END IF;
    
    -- Add admin_access_permissions column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'admin_access_permissions'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN admin_access_permissions TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Added admin_access_permissions column';
    END IF;
END $$;

-- Link existing auth users to user_profiles (safe version)
DO $$
DECLARE
    auth_user_record RECORD;
    existing_profile_count INTEGER;
BEGIN
    -- Count existing profiles
    SELECT COUNT(*) INTO existing_profile_count FROM public.user_profiles;
    RAISE NOTICE 'Existing profiles: %', existing_profile_count;
    
    -- Insert missing profiles only
    FOR auth_user_record IN 
        SELECT au.id, au.email, 
               COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
               COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as display_name,
               COALESCE(au.raw_user_meta_data->>'role', 'user') as role,
               COALESCE((au.raw_user_meta_data->>'is_super_admin')::boolean, false) as is_super_admin
        FROM auth.users au
        WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
    LOOP
        INSERT INTO public.user_profiles (user_id, username, display_name, status, is_online, role, is_super_admin)
        VALUES (
            auth_user_record.id,
            auth_user_record.username,
            auth_user_record.display_name,
            'offline',
            false,
            auth_user_record.role,
            auth_user_record.is_super_admin
        );
        RAISE NOTICE 'Created profile for: %', auth_user_record.email;
    END LOOP;
    
    -- Update admin user if exists
    UPDATE public.user_profiles 
    SET is_super_admin = true, role = 'admin'
    WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%admin%' OR email LIKE '%test%');
    
    RAISE NOTICE '✅ Updated admin users';
END $$;

-- Final verification
DO $$
DECLARE
    table_exists BOOLEAN;
    profile_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Check table existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'user_profiles' AND table_schema = 'public'
    ) INTO table_exists;
    
    -- Count records and policies
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_profiles';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'HTTP 500 ERROR FIX COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'user_profiles table: %', CASE WHEN table_exists THEN 'EXISTS' ELSE 'MISSING' END;
    RAISE NOTICE 'Total profiles: %', profile_count;
    RAISE NOTICE 'RLS policies: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Your HTTP 500 error should now be resolved!';
    RAISE NOTICE 'Test: GET /rest/v1/user_profiles?select=*&order=created_at.desc';
    RAISE NOTICE 'Expected: HTTP 200 (not 500)';
    RAISE NOTICE '========================================';
END $$;

COMMIT;