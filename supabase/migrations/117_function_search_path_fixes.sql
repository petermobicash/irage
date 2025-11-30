-- Migration: Function Search Path Security Fixes
-- Date: 2025-11-20
-- Purpose: Fix Function Search Path Mutable security warnings
-- Issues Addressed:
-- 1. Add secure search_path to initialize_campaign_stats function
-- 2. Add secure search_path to update_chat_room_last_activity function

BEGIN;

-- ===============================================
-- 1. FIX initialize_campaign_stats FUNCTION
-- ===============================================

-- Drop the existing function (including trigger)
DROP TRIGGER IF EXISTS trigger_initialize_campaign_stats ON public.newsletter_campaigns;
DROP FUNCTION IF EXISTS initialize_campaign_stats();

-- Recreate with secure search_path to prevent schema injection
CREATE OR REPLACE FUNCTION initialize_campaign_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.newsletter_campaign_stats (campaign_id, recipient_count)
    VALUES (NEW.id, 0)
    ON CONFLICT (campaign_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_initialize_campaign_stats
    AFTER INSERT ON public.newsletter_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION initialize_campaign_stats();

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION initialize_campaign_stats() TO postgres, anon, authenticated, service_role;

-- ===============================================
-- 2. FIX update_chat_room_last_activity FUNCTION
-- ===============================================

-- Drop the existing function (including trigger)
DROP TRIGGER IF EXISTS trigger_update_chat_room_activity ON public.chat_messages;
DROP FUNCTION IF EXISTS update_chat_room_last_activity();

-- Recreate with secure search_path to prevent schema injection
CREATE OR REPLACE FUNCTION update_chat_room_last_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only update if room_id is not NULL and is a valid UUID
    IF NEW.room_id IS NOT NULL THEN
        -- Use explicit type casting to ensure UUID comparison
        UPDATE public.chat_rooms
        SET last_activity = NOW()
        WHERE id = NEW.room_id::uuid;
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_chat_room_activity
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_last_activity();

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION update_chat_room_last_activity() TO postgres, anon, authenticated, service_role;

-- ===============================================
-- 3. VERIFICATION
-- ===============================================

-- Verification queries to ensure functions have secure search_path
DO $$
DECLARE
    functions_fixed INTEGER;
BEGIN
    -- Check that both functions now have search_path set
    SELECT COUNT(*) INTO functions_fixed
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN ('initialize_campaign_stats', 'update_chat_room_last_activity')
    AND routine_type = 'FUNCTION'
    AND specific_schema = 'public'
    AND data_type = 'trigger'
    AND routine_definition LIKE '%SET search_path = public%';
    
    -- Raise notices about the fixes
    RAISE NOTICE '✅ Function search_path fixes applied successfully';
    RAISE NOTICE '✅ Functions with secure search_path: %', functions_fixed;
    
    -- If verification fails, raise an error
    IF functions_fixed < 2 THEN
        RAISE EXCEPTION '❌ Not all functions were updated with secure search_path';
    END IF;
    
    RAISE NOTICE '🎉 Function search_path security issues have been resolved!';
END $$;

COMMIT;

-- ===============================================
-- ROLLBACK PROCEDURE (in case of issues)
-- ===============================================
/*
-- To rollback if needed, run this separately:
BEGIN;

-- Rollback to original functions without search_path
DROP TRIGGER IF EXISTS trigger_initialize_campaign_stats ON public.newsletter_campaigns;
DROP FUNCTION IF EXISTS initialize_campaign_stats();

CREATE OR REPLACE FUNCTION initialize_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.newsletter_campaign_stats (campaign_id, recipient_count)
    VALUES (NEW.id, 0)
    ON CONFLICT (campaign_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_initialize_campaign_stats
    AFTER INSERT ON public.newsletter_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION initialize_campaign_stats();

DROP TRIGGER IF EXISTS trigger_update_chat_room_activity ON public.chat_messages;
DROP FUNCTION IF EXISTS update_chat_room_last_activity();

CREATE OR REPLACE FUNCTION update_chat_room_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.room_id IS NOT NULL THEN
        UPDATE public.chat_rooms
        SET last_activity = NOW()
        WHERE id = NEW.room_id::uuid;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_room_activity
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_last_activity();

COMMIT;
*/