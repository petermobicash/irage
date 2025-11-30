-- SIMPLE USER_ID FIX
-- This script directly adds the missing user_id column that's causing the error

BEGIN;

-- Fix the most common issue: user_profiles table missing user_id column
\echo 'Adding user_id column to user_profiles table...'

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id 
ON public.user_profiles(user_id);

-- Also ensure profiles table has user_id (in case it's missing)
\echo 'Ensuring profiles table has user_id column...'

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance  
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles(user_id);

-- Update RLS policies to work with the correct columns
\echo 'Updating RLS policies...'

-- Fix user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING ((SELECT auth.uid())::text = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING ((SELECT auth.uid())::text = user_id)
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ USER_ID COLUMN FIX COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'The "column user_id does not exist" error should now be resolved!';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed:';
    RAISE NOTICE '  - user_profiles table: Added user_id column';
    RAISE NOTICE '  - profiles table: Ensured user_id column';
    RAISE NOTICE '  - RLS policies: Updated to use correct references';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now run your queries without the user_id error.';
    RAISE NOTICE '========================================';
END $$;

END;