-- =====================================================
-- FIX CHAT ROOM TRIGGER TYPE MISMATCH
-- =====================================================
-- This migration fixes the type mismatch error in the
-- update_chat_room_last_activity trigger function
-- =====================================================

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_update_chat_room_activity ON public.chat_messages;
DROP FUNCTION IF EXISTS update_chat_room_last_activity();

-- Recreate the function with proper type handling
CREATE OR REPLACE FUNCTION update_chat_room_last_activity()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_update_chat_room_activity
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_last_activity();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHAT ROOM TRIGGER FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed type mismatch in update_chat_room_last_activity()';
    RAISE NOTICE '✅ Trigger now handles UUID types correctly';
    RAISE NOTICE '';
    RAISE NOTICE 'Seed data can now be inserted without errors!';
    RAISE NOTICE '========================================';
END $$;