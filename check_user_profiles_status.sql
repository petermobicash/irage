-- Check current state of user_profiles table and policies
-- Run this in your Supabase SQL Editor to see what exists

-- Check if user_profiles table exists
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public';

-- Check existing RLS policies
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'user_profiles'
  AND schemaname = 'public'
ORDER BY indexname;

-- Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_profiles';

-- Check data
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as linked_profiles,
    COUNT(CASE WHEN username = 'admin' THEN 1 END) as admin_count
FROM public.user_profiles;