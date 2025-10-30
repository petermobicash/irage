-- =====================================================
-- FIX CHAT INFINITE LOOP ISSUES
-- =====================================================
-- This migration adds the missing update_user_presence function
-- and ensures all database functions are working properly
-- to prevent infinite loops in the chat system.
-- =====================================================

-- Create the missing update_user_presence function
CREATE OR REPLACE FUNCTION public.update_user_presence(
    p_user_id UUID,
    p_status TEXT DEFAULT 'online'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Update or insert user presence
    INSERT INTO public.user_profiles (user_id, username, full_name, is_active, last_seen)
    VALUES (
        p_user_id,
        COALESCE((SELECT email FROM auth.users WHERE id = p_user_id), 'unknown'),
        COALESCE((SELECT email FROM auth.users WHERE id = p_user_id), 'unknown'),
        true,
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        is_active = true,
        last_seen = NOW(),
        updated_at = NOW();
END;
$function$;

-- Ensure the is_super_admin function is properly configured
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid()
        AND username = 'admin'
    );
END;
$function$;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 080 completed: Fixed chat infinite loop issues';
    RAISE NOTICE 'Added update_user_presence function';
    RAISE NOTICE 'Ensured is_super_admin function is properly configured';
END $$;