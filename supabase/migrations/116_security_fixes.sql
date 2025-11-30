-- Migration: Security Fixes
-- Date: 2025-11-20
-- Purpose: Fix Security Definer views and enable RLS on policy_backup table
-- Issues Addressed:
-- 1. Convert Security Definer views to Security Invoker
-- 2. Enable RLS on policy_backup table
-- 3. Add appropriate RLS policies

BEGIN;

-- ===============================================
-- 1. SECURITY DEFINER VIEW FIXES
-- ===============================================

-- Drop existing views to recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.user_statistics_view CASCADE;
DROP VIEW IF EXISTS public.user_management_view CASCADE;
DROP VIEW IF EXISTS public.active_users_summary CASCADE;

-- Recreate views with SECURITY INVOKER to use querying user's permissions
-- instead of view creator's permissions

-- User Statistics View with Security Invoker
CREATE OR REPLACE VIEW public.user_statistics_view AS
SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE is_super_admin = true) as admin_users,
    COUNT(*) FILTER (WHERE role = 'editor') as editor_users,
    COUNT(*) FILTER (WHERE role = 'author') as author_users,
    COUNT(*) FILTER (WHERE role = 'reviewer') as reviewer_users,
    MAX(last_login) as last_user_activity
FROM public.users;

-- Set security properties for user_statistics_view
ALTER VIEW public.user_statistics_view SET (security_invoker = true);

-- User Management View with Security Invoker
CREATE OR REPLACE VIEW public.user_management_view AS
SELECT
    up.id,
    up.user_id,
    up.username,
    up.display_name,
    up.bio,
    up.avatar_url,
    up.status,
    up.last_seen,
    up.is_online,
    up.phone_number,
    up.created_at as profile_created_at,
    u.name,
    u.email,
    u.role,
    u.groups,
    u.custom_permissions,
    u.last_login,
    u.is_active,
    u.is_super_admin,
    u.preferences,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at
FROM public.user_profiles up
LEFT JOIN public.users u ON up.user_id::text = u.user_id::text;

-- Set security properties for user_management_view
ALTER VIEW public.user_management_view SET (security_invoker = true);

-- Active Users Summary View with Security Invoker
CREATE OR REPLACE VIEW public.active_users_summary AS
SELECT
    COUNT(*) as total_active_users,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '24 hours' THEN 1 END) as users_last_24h,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '7 days' THEN 1 END) as users_last_7d,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '30 days' THEN 1 END) as users_last_30d
FROM public.user_profiles
WHERE is_active = true;

-- Set security properties for active_users_summary
ALTER VIEW public.active_users_summary SET (security_invoker = true);

-- ===============================================
-- 2. POLICY_BACKUP TABLE RLS FIX
-- ===============================================

-- Enable Row Level Security on policy_backup table
ALTER TABLE public.policy_backup ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view policy_backup" ON public.policy_backup;
DROP POLICY IF EXISTS "Allow service role full access to policy_backup" ON public.policy_backup;

-- Create RLS policies for policy_backup table
-- Only authenticated users can view the backup data (read-only)
CREATE POLICY "Allow authenticated users to view policy_backup" ON public.policy_backup
    FOR SELECT
    TO authenticated
    USING (true);

-- Service role has full access for administrative operations
CREATE POLICY "Allow service role full access to policy_backup" ON public.policy_backup
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ===============================================
-- 3. GRANTS AND PERMISSIONS
-- ===============================================

-- Ensure proper grants are in place for the views
-- These grants are important for PostgREST API access
GRANT SELECT ON public.user_statistics_view TO authenticated, service_role;
GRANT SELECT ON public.user_management_view TO authenticated, service_role;
GRANT SELECT ON public.active_users_summary TO authenticated, service_role;

-- Ensure policy_backup table has appropriate grants
GRANT SELECT ON public.policy_backup TO authenticated, service_role;
GRANT ALL ON public.policy_backup TO service_role;

-- ===============================================
-- 4. VERIFICATION
-- ===============================================

-- Verification queries to ensure fixes are applied
DO $
DECLARE
    view_count INTEGER;
    rls_enabled BOOLEAN;
BEGIN
    -- Check that views exist with SECURITY INVOKER
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('user_statistics_view', 'user_management_view', 'active_users_summary')
    ;
    
    -- Check that policy_backup has RLS enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class 
    WHERE relname = 'policy_backup' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Raise notices about the fixes
    RAISE NOTICE '✅ Security fixes applied successfully';
    RAISE NOTICE '✅ Views converted to SECURITY INVOKER: % views', view_count;
    RAISE NOTICE '✅ RLS enabled on policy_backup: %', rls_enabled;
    
    -- If verification fails, raise an error
    IF view_count < 3 THEN
        RAISE EXCEPTION '❌ Not all views were converted to SECURITY INVOKER';
    END IF;
    
    IF rls_enabled IS FALSE THEN
        RAISE EXCEPTION '❌ RLS was not enabled on policy_backup table';
    END IF;
    
    RAISE NOTICE '🎉 All security issues have been resolved!';
END $;

COMMIT;

-- ===============================================
-- ROLLBACK PROCEDURE (in case of issues)
-- ===============================================
/*
-- To rollback if needed, run this separately:
BEGIN;

-- Rollback view security settings
DROP VIEW IF EXISTS public.user_statistics_view CASCADE;
DROP VIEW IF EXISTS public.user_management_view CASCADE;
DROP VIEW IF EXISTS public.active_users_summary CASCADE;

-- Recreate views with SECURITY DEFINER (original state)
CREATE OR REPLACE VIEW public.user_statistics_view AS
SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE is_super_admin = true) as admin_users,
    COUNT(*) FILTER (WHERE role = 'editor') as editor_users,
    COUNT(*) FILTER (WHERE role = 'author') as author_users,
    COUNT(*) FILTER (WHERE role = 'reviewer') as reviewer_users,
    MAX(last_login) as last_user_activity
FROM public.users;

CREATE OR REPLACE VIEW public.user_management_view AS
SELECT
    up.id,
    up.user_id,
    up.username,
    up.display_name,
    up.bio,
    up.avatar_url,
    up.status,
    up.last_seen,
    up.is_online,
    up.phone_number,
    up.created_at as profile_created_at,
    u.name,
    u.email,
    u.role,
    u.groups,
    u.custom_permissions,
    u.last_login,
    u.is_active,
    u.is_super_admin,
    u.preferences,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at
FROM public.user_profiles up
LEFT JOIN public.users u ON up.user_id::text = u.user_id::text;

CREATE OR REPLACE VIEW public.active_users_summary AS
SELECT
    COUNT(*) as total_active_users,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '24 hours' THEN 1 END) as users_last_24h,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '7 days' THEN 1 END) as users_last_7d,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '30 days' THEN 1 END) as users_last_30d
FROM public.user_profiles
WHERE is_active = true;

-- Disable RLS on policy_backup table
ALTER TABLE public.policy_backup DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY IF EXISTS "Allow authenticated users to view policy_backup" ON public.policy_backup;
DROP POLICY IF EXISTS "Allow service role full access to policy_backup" ON public.policy_backup;

COMMIT;
*/