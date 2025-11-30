-- ===============================================
-- SIMPLE FIX VERIFICATION
-- ===============================================
-- Quick test to confirm HTTP 500 fix worked

-- Test 1: Can we select from user_profiles? (this was failing before)
SELECT 'SELECT TEST SUCCESSFUL' as result FROM public.user_profiles LIMIT 1;

-- Test 2: Count of records  
SELECT COUNT(*) as total_profiles FROM public.user_profiles;

-- Test 3: Check if table structure exists
SELECT 
    COUNT(*) as columns_found,
    'user_profiles table structure OK' as status
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND table_schema = 'public';

-- Test 4: RLS policies check
SELECT COUNT(*) as rls_policies FROM pg_policies WHERE tablename = 'user_profiles';