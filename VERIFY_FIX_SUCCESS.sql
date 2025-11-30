-- ===============================================
-- VERIFY HTTP 500 ERROR FIX
-- ===============================================
-- Run this after applying the fix to confirm it worked

-- Test 1: Check if user_profiles table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'user_profiles' 
            AND table_schema = 'public'
        ) 
        THEN '✅ user_profiles table EXISTS'
        ELSE '❌ user_profiles table MISSING'
    END as table_status;

-- Test 2: Check if we can query the table (this should work without error)
SELECT 
    COUNT(*) as profile_count,
    COUNT(CASE WHEN is_super_admin = true THEN 1 END) as admin_count
FROM public.user_profiles;

-- Test 3: Check RLS policies
SELECT 
    COUNT(*) as total_policies,
    array_agg(policyname) as policy_names
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test 4: Check if auth.users are linked
SELECT 
    COUNT(*) as auth_users,
    COUNT(up.user_id) as linked_profiles
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id;

-- Test 5: Test the exact query that was failing
-- This mimics: GET /rest/v1/user_profiles?select=*&order=created_at.desc
SELECT 
    'TEST QUERY SUCCESSFUL' as result,
    (SELECT COUNT(*) FROM public.user_profiles) as total_records,
    (SELECT MAX(created_at) FROM public.user_profiles) as latest_profile
FROM public.user_profiles
LIMIT 1;