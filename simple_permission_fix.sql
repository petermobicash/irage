-- Simple Permission Fix for Benirage
-- This script fixes the "No users found" and "Access Restricted" issues

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    access_level INTEGER DEFAULT 20,
    custom_permissions TEXT[] DEFAULT '{}',
    admin_access_permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create permissions table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    category TEXT,
    module TEXT,
    action TEXT,
    resource TEXT,
    is_system_permission BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "allow_authenticated_read_all" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_users_manage_own" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_super_admin_all" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_authenticated_read" ON public.permissions;
DROP POLICY IF EXISTS "allow_super_admin_manage_perms" ON public.permissions;

-- Create simple permissive policies
CREATE POLICY "allow_authenticated_read_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "allow_users_manage_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_service_role_all_profiles"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_all_read_permissions"
ON public.permissions
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "allow_service_role_manage_permissions"
ON public.permissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert default permissions
INSERT INTO public.permissions (name, slug, description, category, module, action, resource, is_system_permission, is_active, order_index)
VALUES 
    ('View Users', 'view.users', 'Can view user profiles', 'user-management', 'users', 'view', 'users', true, true, 1),
    ('Create Content', 'create.content', 'Can create new content', 'content-management', 'content', 'create', 'content', true, true, 2),
    ('Edit Content', 'edit.content', 'Can edit content', 'content-management', 'content', 'edit', 'content', true, true, 3),
    ('Delete Content', 'delete.content', 'Can delete content', 'content-management', 'content', 'delete', 'content', true, true, 4),
    ('Publish Content', 'publish.content', 'Can publish content', 'content-management', 'content', 'publish', 'content', true, true, 5),
    ('Manage Users', 'manage.users', 'Can manage users', 'user-management', 'users', 'manage', 'users', true, true, 6),
    ('System Administration', 'admin.system', 'Full system administration access', 'system-administration', 'system', 'admin', 'system', true, true, 7)
ON CONFLICT (slug) DO NOTHING;

-- Create function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND is_super_admin = true
        AND is_active = true
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, anon, service_role, dashboard_user, authenticator;

-- Create super admin function for creating admin users
CREATE OR REPLACE FUNCTION public.create_super_admin(email TEXT, password TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = $1;
    
    IF admin_user_id IS NULL THEN
        -- Generate new UUID for admin
        admin_user_id := uuid_generate_v4();
        
        -- Create auth user
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            '00000000-0000-0000-0000-000000000000',
            $1,
            crypt($2, gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"], "role": "super_admin"}',
            '{"full_name": "System Administrator", "username": "admin"}',
            'authenticated',
            'authenticated',
            NOW(),
            NOW()
        );
    END IF;
    
    -- Create or update user profile
    INSERT INTO public.user_profiles (
        user_id,
        username,
        display_name,
        full_name,
        role,
        is_super_admin,
        access_level,
        custom_permissions,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'admin',
        'System Administrator',
        'System Administrator',
        'super-admin',
        true,
        100,
        ARRAY['admin.system', 'manage.users', 'view.users', 'create.content', 'edit.content', 'delete.content', 'publish.content'],
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        is_super_admin = true,
        role = 'super-admin',
        access_level = 100,
        is_active = true,
        updated_at = NOW();
    
    RETURN admin_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_super_admin(TEXT, TEXT) TO service_role;

-- Create default super admin user
SELECT public.create_super_admin('admin@benirage.org', 'Admin123!@#');

-- Link existing auth users to user_profiles
INSERT INTO public.user_profiles (
    user_id,
    username,
    display_name,
    role,
    is_active,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    'user',
    true,
    NOW(),
    NOW()
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin ON public.user_profiles(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_permissions_slug ON public.permissions(slug);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);

-- Update todo status
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SIMPLE PERMISSION FIX COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ user_profiles table created with proper structure';
    RAISE NOTICE '✅ permissions table created with default permissions';
    RAISE NOTICE '✅ RLS policies configured for access';
    RAISE NOTICE '✅ Super admin function created';
    RAISE NOTICE '✅ Default super admin user created: admin@benirage.org';
    RAISE NOTICE '✅ All existing users linked to profiles';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'DEFAULT SUPER ADMIN CREDENTIALS:';
    RAISE NOTICE 'Email: admin@benirage.org';
    RAISE NOTICE 'Password: Admin123!@#';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '1. Log in with these credentials';
    RAISE NOTICE '2. Access user management features';
    RAISE NOTICE '3. Manage permissions and groups';
    RAISE NOTICE '========================================';
END $$;