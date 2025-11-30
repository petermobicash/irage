-- XHR 400 Error Diagnostic for user_profiles Query
-- Run this in your Supabase SQL Editor to diagnose the issue

DO $$
DECLARE
    table_exists BOOLEAN;
    column_info TEXT;
    profile_count INTEGER;
    new_status_count INTEGER;
    sample_profiles TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'XHR 400 ERROR DIAGNOSTIC - user_profiles';
    RAISE NOTICE '========================================';
    
    -- Check 1: Does user_profiles table exist?
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_profiles' 
        AND table_schema = 'public'
    ) INTO table_exists;

    IF table_exists THEN
        RAISE NOTICE '✅ user_profiles table EXISTS in public schema';
    ELSE
        RAISE NOTICE '❌ user_profiles table MISSING from public schema';
        RAISE NOTICE '   This would cause a 500 error, not 400';
        RETURN;
    END IF;

    -- Check 2: Get column information
    SELECT STRING_AGG(
        column_name || ' (' || data_type || ')', 
        ', '
        ORDER BY ordinal_position
    ) INTO column_info
    FROM information_schema.columns
    WHERE table_name = 'user_profiles' 
    AND table_schema = 'public';

    RAISE NOTICE '📋 Table Columns: %', column_info;

    -- Check 3: Count total profiles
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
    RAISE NOTICE '👥 Total Profiles: %', profile_count;

    -- Check 4: Look for "new" status profiles
    SELECT COUNT(*) INTO new_status_count 
    FROM public.user_profiles 
    WHERE status = 'new';
    
    RAISE NOTICE '🆕 Profiles with status="new": %', new_status_count;

    -- Check 5: Get sample data
    SELECT STRING_AGG(
        'id=' || id::text || ', user_id=' || user_id::text || ', status=' || status || ', username=' || COALESCE(username, 'NULL'),
        ' | '
        ORDER BY created_at DESC
    ) INTO sample_profiles
    FROM (
        SELECT id, user_id, status, username, created_at
        FROM public.user_profiles 
        LIMIT 5
    ) samples;

    RAISE NOTICE '📝 Sample Profiles: %', sample_profiles;

    -- Check 6: Test the problematic query structure
    RAISE NOTICE '';
    RAISE NOTICE '🔍 TESTING QUERY PATTERNS';
    RAISE NOTICE '==========================';

    -- Test: Would id=eq.new work?
    RAISE NOTICE '❌ Problematic Query: id=eq.new';
    RAISE NOTICE '   Reason: "id" is UUID field, "new" is not valid UUID';
    RAISE NOTICE '   Expected UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

    -- Test: status=eq.new
    IF new_status_count > 0 THEN
        RAISE NOTICE '✅ Alternative Query: status=eq.new';
        RAISE NOTICE '   This would work and return % profiles', new_status_count;
    ELSE
        RAISE NOTICE '⚠️  Alternative Query: status=eq.new';
        RAISE NOTICE '   No profiles with status="new" found';
    END IF;

    -- Check 7: RLS Policies
    RAISE NOTICE '';
    RAISE NOTICE '🔒 RLS POLICIES';
    RAISE NOTICE '===============';
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE '✅ RLS policies exist for user_profiles';
        SELECT COUNT(*) INTO FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND schemaname = 'public';
        RAISE NOTICE '   Policy count: %', COUNT(*);
    ELSE
        RAISE NOTICE '⚠️  No RLS policies found for user_profiles';
    END IF;

    -- Final Summary
    RAISE NOTICE '';
    RAISE NOTICE '📋 DIAGNOSIS SUMMARY';
    RAISE NOTICE '=====================';
    RAISE NOTICE 'The XHR 400 error occurs because:';
    RAISE NOTICE '1. Query uses: user_profiles?select=user_id&id=eq.new';
    RAISE NOTICE '2. The "id" field expects a UUID, but "new" is text';
    RAISE NOTICE '3. PostgreSQL rejects the invalid UUID syntax with 400';
    
    RAISE NOTICE '';
    RAISE NOTICE '💡 RECOMMENDED FIXES:';
    
    IF new_status_count > 0 THEN
        RAISE NOTICE 'Option 1: Change filter to status=eq.new';
        RAISE NOTICE '  Query: user_profiles?select=user_id&status=eq.new';
        RAISE NOTICE '  Will return % profiles with status "new"', new_status_count;
    END IF;
    
    RAISE NOTICE 'Option 2: Use username field if "new" is a username';
    RAISE NOTICE '  Query: user_profiles?select=user_id&username=eq.new';
    
    RAISE NOTICE 'Option 3: Query by user_id with actual UUID';
    RAISE NOTICE '  Query: user_profiles?select=user_id&user_id=eq.[ACTUAL_UUID]';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Run the diagnostic and implement the appropriate fix';
    RAISE NOTICE '========================================';

END $$;