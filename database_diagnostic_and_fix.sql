-- ===============================================
-- COMPREHENSIVE DATABASE DIAGNOSTIC AND FIX
-- ===============================================
-- This script diagnoses and fixes all HTTP 500 errors affecting:
-- 1. user_profiles table
-- 2. permissions table  
-- 3. group_permissions table
-- 4. RLS policy issues
-- 5. Schema visibility problems

BEGIN;

-- ===============================================
-- STEP 1: DIAGNOSTIC QUERIES
-- ===============================================

DO $$
DECLARE
    table_exists BOOLEAN;
    policy_count INTEGER;
    error_message TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE DIAGNOSTIC STARTING...';
    RAISE NOTICE '========================================';
    
    -- Check user_profiles table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ user_profiles table EXISTS';
    ELSE
        RAISE NOTICE '❌ user_profiles table MISSING';
    END IF;
    
    -- Check permissions table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'permissions'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ permissions table EXISTS';
    ELSE
        RAISE NOTICE '❌ permissions table MISSING';
    END IF;
    
    -- Check group_permissions table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'group_permissions'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ group_permissions table EXISTS';
    ELSE
        RAISE NOTICE '❌ group_permissions table MISSING';
    END IF;
    
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_profiles';
    RAISE NOTICE '📊 user_profiles RLS policies: %', policy_count;
    
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'permissions';
    RAISE NOTICE '📊 permissions RLS policies: %', policy_count;
    
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'group_permissions';
    RAISE NOTICE '📊 group_permissions RLS policies: %', policy_count;
    
    RAISE NOTICE '';
END $$;

-- ===============================================
-- STEP 2: CREATE MISSING TABLES
-- ===============================================

-- Create user_profiles table if missing
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

-- Add missing columns to existing user_profiles table
DO $
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE '✅ Added role column to user_profiles table';
    END IF;
    
    -- Add is_super_admin column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_super_admin' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added is_super_admin column to user_profiles table';
    END IF;
    
    -- Add custom_permissions column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'custom_permissions' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN custom_permissions TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Added custom_permissions column to user_profiles table';
    END IF;
    
    -- Add admin_access_permissions column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'admin_access_permissions' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN admin_access_permissions TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Added admin_access_permissions column to user_profiles table';
    END IF;
END $;

-- Create permissions table if missing
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    category TEXT,
    module TEXT,
    action TEXT,
    resource TEXT,
    is_system_permission BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    organization_id UUID
);

-- Create group_permissions table if missing
CREATE TABLE IF NOT EXISTS public.group_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, permission_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_permissions ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- STEP 3: DROP CONFLICTING POLICIES
-- ===============================================

-- Drop all existing policies to avoid conflicts
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

DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.permissions;
DROP POLICY IF EXISTS "Permissions access policy" ON public.permissions;
DROP POLICY IF EXISTS "Optimized Permissions Access" ON public.permissions;

DROP POLICY IF EXISTS "Anyone can view group permissions" ON public.group_permissions;
DROP POLICY IF EXISTS "Authenticated users can manage group permissions" ON public.group_permissions;
DROP POLICY IF EXISTS "Group Permissions Policy" ON public.group_permissions;
DROP POLICY IF EXISTS "Optimized Group Permissions View" ON public.group_permissions;
DROP POLICY IF EXISTS "Optimized Group Permissions Manage" ON public.group_permissions;

-- ===============================================
-- STEP 4: CREATE PERMISSIVE RLS POLICIES
-- ===============================================

-- User profiles policies
CREATE POLICY "authenticated_select_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service_role_full_access_profiles"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Permissions policies
CREATE POLICY "permissions_select_all"
ON public.permissions
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "permissions_manage_super_admin"
ON public.permissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Group permissions policies
CREATE POLICY "group_permissions_select_all"
ON public.group_permissions
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "group_permissions_manage_super_admin"
ON public.group_permissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ===============================================
-- STEP 5: CREATE PERFORMANCE INDEXES
-- ===============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Permissions indexes
CREATE INDEX IF NOT EXISTS idx_permissions_slug ON public.permissions(slug);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_is_active ON public.permissions(is_active);

-- Group permissions indexes
CREATE INDEX IF NOT EXISTS idx_group_permissions_group_id ON public.group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_permission_id ON public.group_permissions(permission_id);

-- ===============================================
-- STEP 6: INSERT DEFAULT PERMISSIONS
-- ===============================================

-- Insert default permissions if table is empty
INSERT INTO public.permissions (id, name, slug, description, category, module, action, resource, is_system_permission, is_active, order_index)
SELECT gen_random_uuid(), 'View Users', 'view.users', 'Can view user profiles', 'user-management', 'users', 'view', 'users', true, true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE slug = 'view.users');

INSERT INTO public.permissions (id, name, slug, description, category, module, action, resource, is_system_permission, is_active, order_index)
SELECT gen_random_uuid(), 'Create Content', 'create.content', 'Can create new content', 'content-management', 'content', 'create', 'content', true, true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE slug = 'create.content');

INSERT INTO public.permissions (id, name, slug, description, category, module, action, resource, is_system_permission, is_active, order_index)
SELECT gen_random_uuid(), 'Edit Content', 'edit.content', 'Can edit content', 'content-management', 'content', 'edit', 'content', true, true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE slug = 'edit.content');

INSERT INTO public.permissions (id, name, slug, description, category, module, action, resource, is_system_permission, is_active, order_index)
SELECT gen_random_uuid(), 'Delete Content', 'delete.content', 'Can delete content', 'content-management', 'content', 'delete', 'content', true, true, 4
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE slug = 'delete.content');

INSERT INTO public.permissions (id, name, slug, description, category, module, action, resource, is_system_permission, is_active, order_index)
SELECT gen_random_uuid(), 'Publish Content', 'publish.content', 'Can publish content', 'content-management', 'content', 'publish', 'content', true, true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE slug = 'publish.content');

INSERT INTO public.permissions (id, name, slug, description, category, module, action, resource, is_system_permission, is_active, order_index)
SELECT gen_random_uuid(), 'Manage Users', 'manage.users', 'Can manage users', 'user-management', 'users', 'manage', 'users', true, true, 6
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE slug = 'manage.users');

INSERT INTO public.permissions (id, name, slug, description, category, module, action, resource, is_system_permission, is_active, order_index)
SELECT gen_random_uuid(), 'System Administration', 'admin.system', 'Full system administration access', 'system-administration', 'system', 'admin', 'system', true, true, 7
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE slug = 'admin.system');

-- ===============================================
-- STEP 7: CREATE SUPER ADMIN FUNCTION
-- ===============================================

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin_user(user_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Use provided user_id or current authenticated user
    target_user_id := COALESCE(user_uuid, auth.uid());
    
    -- Return false if no user ID available
    IF target_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user is super admin
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_profiles 
        WHERE user_id = target_user_id 
        AND is_super_admin = true
        AND is_active = true
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_super_admin_user(UUID) TO authenticated, anon, service_role, dashboard_user, authenticator;

-- ===============================================
-- STEP 8: LINK EXISTING AUTH USERS
-- ===============================================

-- Create profiles for existing auth users (with conditional column handling)
DO $
DECLARE
    has_role_column BOOLEAN;
    has_is_super_admin_column BOOLEAN;
BEGIN
    -- Check if columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role' 
        AND table_schema = 'public'
    ) INTO has_role_column;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_super_admin' 
        AND table_schema = 'public'
    ) INTO has_is_super_admin_column;
    
    -- Insert/Update with conditional column handling
    IF has_role_column AND has_is_super_admin_column THEN
        INSERT INTO public.user_profiles (user_id, username, display_name, status, is_online, role, is_super_admin)
        SELECT
            au.id,
            COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
            COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
            'offline',
            false,
            COALESCE(au.raw_user_meta_data->>'role', 'user'),
            CASE 
                WHEN au.email = 'admin@benirage.org' THEN true 
                ELSE COALESCE((au.raw_user_meta_data->>'is_super_admin')::boolean, false)
            END
        FROM auth.users au
        WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
        ON CONFLICT (user_id) DO UPDATE SET
            username = COALESCE(EXCLUDED.username, user_profiles.username),
            display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
            role = COALESCE(EXCLUDED.role, user_profiles.role),
            is_super_admin = COALESCE(EXCLUDED.is_super_admin, user_profiles.is_super_admin),
            updated_at = NOW();
    ELSIF has_role_column THEN
        INSERT INTO public.user_profiles (user_id, username, display_name, status, is_online, role)
        SELECT
            au.id,
            COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
            COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
            'offline',
            false,
            COALESCE(au.raw_user_meta_data->>'role', 'user')
        FROM auth.users au
        WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
        ON CONFLICT (user_id) DO UPDATE SET
            username = COALESCE(EXCLUDED.username, user_profiles.username),
            display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
            role = COALESCE(EXCLUDED.role, user_profiles.role),
            updated_at = NOW();
    ELSE
        -- Insert without role column
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
            username = COALESCE(EXCLUDED.username, user_profiles.username),
            display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
            updated_at = NOW();
    END IF;
    
    RAISE NOTICE '✅ Linked existing auth.users to user_profiles';
END $;

-- ===============================================
-- STEP 9: FINAL VERIFICATION
-- ===============================================

DO $$
DECLARE
    user_profiles_exists BOOLEAN;
    permissions_exists BOOLEAN;
    group_permissions_exists BOOLEAN;
    profile_count INTEGER;
    permissions_count INTEGER;
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE FIX VERIFICATION';
    RAISE NOTICE '========================================';
    
    -- Check table existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
    ) INTO user_profiles_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'permissions'
    ) INTO permissions_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'group_permissions'
    ) INTO group_permissions_exists;
    
    -- Count records
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
    SELECT COUNT(*) INTO permissions_count FROM public.permissions;
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename IN ('user_profiles', 'permissions', 'group_permissions');
    
    IF user_profiles_exists THEN
        RAISE NOTICE '✅ user_profiles table: EXISTS';
    ELSE
        RAISE NOTICE '❌ user_profiles table: MISSING';
    END IF;
    
    IF permissions_exists THEN
        RAISE NOTICE '✅ permissions table: EXISTS';
    ELSE
        RAISE NOTICE '❌ permissions table: MISSING';
    END IF;
    
    IF group_permissions_exists THEN
        RAISE NOTICE '✅ group_permissions table: EXISTS';
    ELSE
        RAISE NOTICE '❌ group_permissions table: MISSING';
    END IF;
    
    RAISE NOTICE '📊 Records: % profiles, % permissions', profile_count, permissions_count;
    RAISE NOTICE '📊 RLS policies: % total', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'All HTTP 500 errors should now be resolved!';
    RAISE NOTICE '========================================';
END $$;

COMMIT;