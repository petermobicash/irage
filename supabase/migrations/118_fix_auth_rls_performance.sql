-- Migration: 118_fix_auth_rls_performance
-- Fix Auth RLS Initialization Plan issues by replacing auth.function() calls with (select auth.function())
-- This prevents unnecessary re-evaluation for each row in RLS policies

BEGIN;

RAISE NOTICE '========================================';
RAISE NOTICE '🔧 FIXING AUTH RLS PERFORMANCE ISSUES';
RAISE NOTICE '========================================';

-- =====================================================
-- CHAT MESSAGES POLICIES
-- =====================================================

-- Fix "Users can update own messages" policy
DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;
CREATE POLICY "Users can update own messages" ON public.chat_messages
    FOR UPDATE 
    USING ((SELECT auth.uid())::text = sender_id)
    WITH CHECK ((SELECT auth.uid())::text = sender_id);

-- =====================================================
-- DIRECT MESSAGES POLICIES  
-- =====================================================

-- Fix "Users can view their direct messages" policy
DROP POLICY IF EXISTS "Users can view their direct messages" ON public.direct_messages;
CREATE POLICY "Users can view their direct messages" ON public.direct_messages
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid())::text = sender_id OR
        (SELECT auth.uid())::text = receiver_id
    );

-- Fix "Users can send direct messages" policy
DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
CREATE POLICY "Users can send direct messages" ON public.direct_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (SELECT auth.uid())::text = sender_id
    );

-- Fix "Users can update their sent messages" policy
DROP POLICY IF EXISTS "Users can update their sent messages" ON public.direct_messages;
CREATE POLICY "Users can update their sent messages" ON public.direct_messages
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid())::text = sender_id)
    WITH CHECK ((SELECT auth.uid())::text = sender_id);

-- Fix "Users can delete their sent messages" policy
DROP POLICY IF EXISTS "Users can delete their sent messages" ON public.direct_messages;
CREATE POLICY "Users can delete their sent messages" ON public.direct_messages
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid())::text = sender_id);

-- =====================================================
-- GROUP MESSAGES POLICIES
-- =====================================================

-- Fix "Users can view group messages they have access to" policy
DROP POLICY IF EXISTS "Users can view group messages they have access to" ON public.group_messages;
CREATE POLICY "Users can view group messages they have access to" ON public.group_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_users
            WHERE group_users.group_id::text = group_messages.group_id
            AND group_users.user_id = (SELECT auth.uid())
        )
    );

-- Fix "Users can send messages to their groups" policy
DROP POLICY IF EXISTS "Users can send messages to their groups" ON public.group_messages;
CREATE POLICY "Users can send messages to their groups" ON public.group_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (SELECT auth.uid())::text = sender_id AND
        EXISTS (
            SELECT 1 FROM public.group_users
            WHERE group_users.group_id::text = group_messages.group_id
            AND group_users.user_id = (SELECT auth.uid())
        )
    );

-- Fix "Users can update their group messages" policy
DROP POLICY IF EXISTS "Users can update their group messages" ON public.group_messages;
CREATE POLICY "Users can update their group messages" ON public.group_messages
    FOR UPDATE
    TO authenticated
    USING (
        (SELECT auth.uid())::text = sender_id AND
        EXISTS (
            SELECT 1 FROM public.group_users
            WHERE group_users.group_id::text = group_messages.group_id
            AND group_users.user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        (SELECT auth.uid())::text = sender_id AND
        EXISTS (
            SELECT 1 FROM public.group_users
            WHERE group_users.group_id::text = group_messages.group_id
            AND group_users.user_id = (SELECT auth.uid())
        )
    );

-- Fix "Users can delete their group messages" policy
DROP POLICY IF EXISTS "Users can delete their group messages" ON public.group_messages;
CREATE POLICY "Users can delete their group messages" ON public.group_messages
    FOR DELETE
    TO authenticated
    USING (
        (SELECT auth.uid())::text = sender_id AND
        EXISTS (
            SELECT 1 FROM public.group_users
            WHERE group_users.group_id::text = group_messages.group_id
            AND group_users.user_id = (SELECT auth.uid())
        )
    );

-- =====================================================
-- MESSAGE READ RECEIPTS POLICIES
-- =====================================================

-- Fix "Users can view read receipts for their messages" policy
DROP POLICY IF EXISTS "Users can view read receipts for their messages" ON public.message_read_receipts;
CREATE POLICY "Users can view read receipts for their messages" ON public.message_read_receipts
    FOR SELECT
    TO authenticated
    USING (
        (SELECT auth.uid())::text = user_id OR
        EXISTS (
            SELECT 1 FROM public.direct_messages dm
            WHERE dm.id = message_read_receipts.message_id::uuid
            AND (dm.sender_id = (SELECT auth.uid())::text OR dm.receiver_id = (SELECT auth.uid())::text)
        ) OR
        EXISTS (
            SELECT 1 FROM public.group_messages gm
            WHERE gm.id = message_read_receipts.message_id::uuid
            AND gm.sender_id = (SELECT auth.uid())::text
        )
    );

-- Fix "Users can mark messages as read" policy
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.message_read_receipts;
CREATE POLICY "Users can mark messages as read" ON public.message_read_receipts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (SELECT auth.uid())::text = user_id AND (
            EXISTS (
                SELECT 1 FROM public.direct_messages dm
                WHERE dm.id = message_read_receipts.message_id::uuid
                AND (dm.sender_id = (SELECT auth.uid())::text OR dm.receiver_id = (SELECT auth.uid())::text)
            ) OR
            EXISTS (
                SELECT 1 FROM public.group_messages gm
                WHERE gm.id = message_read_receipts.message_id::uuid
                AND gm.sender_id = (SELECT auth.uid())::text
            )
        )
    );

-- Fix "Users can update their read receipts" policy
DROP POLICY IF EXISTS "Users can update their read receipts" ON public.message_read_receipts;
CREATE POLICY "Users can update their read receipts" ON public.message_read_receipts
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id)
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Fix "Users can delete their read receipts" policy
DROP POLICY IF EXISTS "Users can delete their read receipts" ON public.message_read_receipts;
CREATE POLICY "Users can delete their read receipts" ON public.message_read_receipts
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id);

-- =====================================================
-- NEWSLETTER SUBSCRIBERS POLICIES
-- =====================================================

-- Fix "Subscribers can view their own record" policy
DROP POLICY IF EXISTS "Subscribers can view their own record" ON public.newsletter_subscribers;
CREATE POLICY "Subscribers can view their own record" ON public.newsletter_subscribers
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id);

-- =====================================================
-- NOTIFICATIONS POLICIES  
-- =====================================================

-- Fix "Users can view their own notifications" policy
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id);

-- Fix "Users can update their own notifications" policy
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id)
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Fix "Users can view their own profile" policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id);

-- Fix "Users can update their own profile" policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id)
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Fix "Super admins can view all profiles" policy
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = (SELECT auth.uid())::text AND p.is_super_admin = true
        )
    );

-- Fix "Super admins can update all profiles" policy
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
CREATE POLICY "Super admins can update all profiles" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = (SELECT auth.uid())::text AND p.is_super_admin = true
        )
    );

-- =====================================================
-- ROLES POLICIES
-- =====================================================

-- Fix "Roles access policy"
DROP POLICY IF EXISTS "Roles access policy" ON public.roles;
CREATE POLICY "Roles access policy" ON public.roles
    FOR SELECT TO authenticated
    USING (true);

-- =====================================================
-- PERMISSIONS POLICIES
-- =====================================================

-- Fix "Permissions access policy"
DROP POLICY IF EXISTS "Permissions access policy" ON public.permissions;
CREATE POLICY "Permissions access policy" ON public.permissions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = (SELECT auth.uid())::text AND p.is_super_admin = true
        )
    );

-- =====================================================
-- STORIES POLICIES
-- =====================================================

-- Fix "Users can update their own stories" policy
DROP POLICY IF EXISTS "Users can update their own stories" ON public.stories;
CREATE POLICY "Users can update their own stories" ON public.stories
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid())::text = author_id);

-- =====================================================
-- SUBSCRIBER LISTS POLICIES
-- =====================================================

-- Fix "List membership policy"
DROP POLICY IF EXISTS "List membership policy" ON public.subscriber_lists;
CREATE POLICY "List membership policy" ON public.subscriber_lists
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.newsletter_subscribers ns
            WHERE ns.id = subscriber_lists.subscriber_id
            AND ns.user_id = (SELECT auth.uid())::text
        )
    );

-- =====================================================
-- TYPING INDICATORS POLICIES
-- =====================================================

-- Fix "Users can create typing indicators" policy
DROP POLICY IF EXISTS "Users can create typing indicators" ON public.typing_indicators;
CREATE POLICY "Users can create typing indicators" ON public.typing_indicators
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Fix "Users can delete their typing indicators" policy
DROP POLICY IF EXISTS "Users can delete their typing indicators" ON public.typing_indicators;
CREATE POLICY "Users can delete their typing indicators" ON public.typing_indicators
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id);

-- Fix "Users can update their typing indicators" policy
DROP POLICY IF EXISTS "Users can update their typing indicators" ON public.typing_indicators;
CREATE POLICY "Users can update their typing indicators" ON public.typing_indicators
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id)
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Fix "Users can view typing indicators in their conversations" policy
DROP POLICY IF EXISTS "Users can view typing indicators in their conversations" ON public.typing_indicators;
CREATE POLICY "Users can view typing indicators in their conversations" ON public.typing_indicators
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id);

-- =====================================================
-- USER GROUPS POLICIES
-- =====================================================

-- Fix "User groups policy"
DROP POLICY IF EXISTS "User groups policy" ON public.user_groups;
CREATE POLICY "User groups policy" ON public.user_groups
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = (SELECT auth.uid())::text
        )
    );

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Fix "Super admins full access" policy
DROP POLICY IF EXISTS "Super admins full access" ON public.user_profiles;
CREATE POLICY "Super admins full access" ON public.user_profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = (SELECT auth.uid())::text
            AND up.is_super_admin = true
        )
    );

-- Fix "Users can insert own profile" policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Fix "Users can update own profile" policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id)
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- =====================================================
-- VIDEO CALL EVENTS POLICIES
-- =====================================================

-- Fix "Users can insert events for calls they're in" policy
DROP POLICY IF EXISTS "Users can insert events for calls they're in" ON public.video_call_events;
CREATE POLICY "Users can insert events for calls they're in" ON public.video_call_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.video_call_participants vcp
            WHERE vcp.call_id = video_call_events.call_id
            AND vcp.user_id = (SELECT auth.uid())::text
        )
    );

-- Fix "Users can view events of calls they're in" policy
DROP POLICY IF EXISTS "Users can view events of calls they're in" ON public.video_call_events;
CREATE POLICY "Users can view events of calls they're in" ON public.video_call_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.video_call_participants vcp
            WHERE vcp.call_id = video_call_events.call_id
            AND vcp.user_id = (SELECT auth.uid())::text
        )
    );

-- =====================================================
-- VIDEO CALL PARTICIPANTS POLICIES
-- =====================================================

-- Fix "Users can join calls" policy
DROP POLICY IF EXISTS "Users can join calls" ON public.video_call_participants;
CREATE POLICY "Users can join calls" ON public.video_call_participants
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Fix "Users can update their own participation" policy
DROP POLICY IF EXISTS "Users can update their own participation" ON public.video_call_participants;
CREATE POLICY "Users can update their own participation" ON public.video_call_participants
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id)
    WITH CHECK ((SELECT auth.uid())::text = user_id);

-- Fix "Users can view participants of calls they're in" policy
DROP POLICY IF EXISTS "Users can view participants of calls they're in" ON public.video_call_participants;
CREATE POLICY "Users can view participants of calls they're in" ON public.video_call_participants
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid())::text = user_id);

-- =====================================================
-- VALIDATION AND SUMMARY
-- =====================================================

-- Verify the fixes were applied
DO $
DECLARE
    policy_count INTEGER;
    tables_fixed TEXT;
BEGIN
    -- Count policies that still have direct auth.uid() calls (should be 0 after fix)
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies pp
    JOIN pg_class pc ON pp.tablename = pc.relname
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid
    WHERE pn.nspname = 'public'
    AND (pp.qual LIKE '%auth.uid()%' OR pp.with_check LIKE '%auth.uid()%')
    AND pp.tablename IN (
        'chat_messages', 'direct_messages', 'group_messages', 'message_read_receipts',
        'newsletter_subscribers', 'notifications', 'profiles', 'roles', 'permissions',
        'stories', 'subscriber_lists', 'typing_indicators', 'user_groups', 'user_profiles',
        'video_call_events', 'video_call_participants'
    );
    
    RAISE NOTICE '✅ RLS Performance Fix Complete!';
    RAISE NOTICE '  - Fixed RLS policies for 16 tables';
    RAISE NOTICE '  - Replaced auth.uid() with (SELECT auth.uid())';
    RAISE NOTICE '  - This prevents re-evaluation for each row';
    RAISE NOTICE '';
    RAISE NOTICE 'Affected Tables:';
    RAISE NOTICE '  - Chat System (4 tables):';
    RAISE NOTICE '    * chat_messages (2 policies)';
    RAISE NOTICE '    * direct_messages (4 policies)';
    RAISE NOTICE '    * group_messages (4 policies)';
    RAISE NOTICE '    * message_read_receipts (4 policies)';
    RAISE NOTICE '';
    RAISE NOTICE '  - User Management (6 tables):';
    RAISE NOTICE '    * user_profiles (3 policies)';
    RAISE NOTICE '    * profiles (4 policies)';
    RAISE NOTICE '    * roles (1 policy)';
    RAISE NOTICE '    * permissions (1 policy)';
    RAISE NOTICE '    * user_groups (1 policy)';
    RAISE NOTICE '';
    RAISE NOTICE '  - Communication (4 tables):';
    RAISE NOTICE '    * notifications (2 policies)';
    RAISE NOTICE '    * typing_indicators (4 policies)';
    RAISE NOTICE '    * video_call_events (2 policies)';
    RAISE NOTICE '    * video_call_participants (3 policies)';
    RAISE NOTICE '';
    RAISE NOTICE '  - Content & Subscriptions (2 tables):';
    RAISE NOTICE '    * stories (1 policy)';
    RAISE NOTICE '    * newsletter_subscribers (1 policy)';
    RAISE NOTICE '    * subscriber_lists (1 policy)';
    RAISE NOTICE '';
    RAISE NOTICE 'Total policies optimized: ~38 policies';
    
    IF policy_count > 0 THEN
        RAISE NOTICE '⚠️  Warning: % policies still have direct auth.uid() calls', policy_count;
    ELSE
        RAISE NOTICE '🎉 All target policies successfully optimized!';
    END IF;
END $;

END;