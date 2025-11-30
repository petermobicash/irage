-- =====================================================
-- USER_ID COLUMN DIAGNOSTIC SCRIPT
-- =====================================================
-- This script checks for missing user_id columns across all tables
-- that are expected to have them based on the application structure
-- =====================================================

\echo '========================================='
\echo 'CHECKING FOR MISSING USER_ID COLUMNS'
\echo '========================================='
\echo ''

-- =====================================================
-- 1. CHECK PROFILES TABLE
-- =====================================================
\echo '1. Checking profiles table...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = 'user_id'
        ) 
        THEN '✅ profiles.user_id EXISTS'
        ELSE '❌ profiles.user_id MISSING'
    END as profiles_user_id_status;

-- Show actual columns in profiles
\echo '   Actual columns in profiles:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

\echo ''

-- =====================================================
-- 2. CHECK USER_PROFILES TABLE
-- =====================================================
\echo '2. Checking user_profiles table...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles'
            AND column_name = 'user_id'
        ) 
        THEN '✅ user_profiles.user_id EXISTS'
        ELSE '❌ user_profiles.user_id MISSING'
    END as user_profiles_user_id_status;

-- Show actual columns in user_profiles
\echo '   Actual columns in user_profiles:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

\echo ''

-- =====================================================
-- 3. CHECK ALL TABLES FOR USER_ID REFERENCES
-- =====================================================
\echo '3. All tables that should have user_id:'
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND information_schema.columns.table_name = all_tables.table_name
            AND column_name = 'user_id'
        ) 
        THEN '✅ HAS user_id'
        ELSE '❌ MISSING user_id'
    END as user_id_status
FROM (
    SELECT DISTINCT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name IN (
        'profiles', 'user_profiles', 'chat_messages', 'direct_messages', 
        'group_messages', 'message_read_receipts', 'notifications', 
        'typing_indicators', 'video_call_events', 'video_call_participants',
        'newsletter_subscribers', 'subscriber_lists'
    )
) all_tables
ORDER BY table_name;

\echo ''

-- =====================================================
-- 4. CHECK FOREIGN KEY CONSTRAINTS
-- =====================================================
\echo '4. Foreign key constraints that reference user_id:'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND (kcu.column_name = 'user_id' OR ccu.column_name = 'user_id')
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- =====================================================
-- SUMMARY
-- =====================================================
\echo '========================================='
\echo 'DIAGNOSTIC SUMMARY'
\echo '========================================='
\echo ''
\echo 'Based on the above results:'
\echo '  - Identify which table is missing user_id'
\echo '  - Check if the table exists at all'
\echo '  - Look at foreign key relationships'
\echo ''
\echo 'Next steps:'
\echo '  1. If table exists but missing user_id: Add the column'
\echo '  2. If table doesn't exist: Create it with user_id'
\echo '  3. If wrong column name: Update references in code'
\echo '========================================='