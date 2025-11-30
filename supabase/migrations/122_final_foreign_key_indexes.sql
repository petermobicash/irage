-- Migration: 122_final_foreign_key_indexes
-- Address remaining unindexed foreign keys identified in database linting
-- This migration completes the performance optimization by adding the final missing indexes

BEGIN;

RAISE NOTICE '========================================';
RAISE NOTICE '🔧 ADDING FINAL FOREIGN KEY INDEXES';
RAISE NOTICE '========================================';

-- =====================================================
-- CHAT MESSAGES TABLE INDEXES
-- =====================================================

-- Add index for chat_messages.reply_to_id foreign key
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id 
ON public.chat_messages(reply_to_id);

RAISE NOTICE '✅ Added index for chat_messages.reply_to_id';

-- =====================================================
-- CONTENT CALENDAR TABLE INDEXES
-- =====================================================

-- Add index for content_calendar.parent_event_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_calendar_parent_event_id 
ON public.content_calendar(parent_event_id);

RAISE NOTICE '✅ Added index for content_calendar.parent_event_id';

-- =====================================================
-- DIRECT MESSAGES TABLE INDEXES
-- =====================================================

-- Add index for direct_messages.reply_to_id foreign key
CREATE INDEX IF NOT EXISTS idx_direct_messages_reply_to_id 
ON public.direct_messages(reply_to_id);

RAISE NOTICE '✅ Added index for direct_messages.reply_to_id';

-- =====================================================
-- FORM FIELDS TABLE INDEXES
-- =====================================================

-- Add index for form_fields.form_template_id foreign key
CREATE INDEX IF NOT EXISTS idx_form_fields_form_template_id 
ON public.form_fields(form_template_id);

RAISE NOTICE '✅ Added index for form_fields.form_template_id';

-- =====================================================
-- GROUP MESSAGES TABLE INDEXES
-- =====================================================

-- Add index for group_messages.reply_to_id foreign key
CREATE INDEX IF NOT EXISTS idx_group_messages_reply_to_id 
ON public.group_messages(reply_to_id);

RAISE NOTICE '✅ Added index for group_messages.reply_to_id';

-- =====================================================
-- MONTHLY GOALS TABLE INDEXES
-- =====================================================

-- Add index for monthly_goals.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_monthly_goals_created_by 
ON public.monthly_goals(created_by);

RAISE NOTICE '✅ Added index for monthly_goals.created_by';

-- =====================================================
-- ROLES TABLE INDEXES
-- =====================================================

-- Add index for roles.parent_role_id foreign key
CREATE INDEX IF NOT EXISTS idx_roles_parent_role_id 
ON public.roles(parent_role_id);

RAISE NOTICE '✅ Added index for roles.parent_role_id';

-- =====================================================
-- SUGGESTIONS TABLE INDEXES
-- =====================================================

-- Add index for suggestions.reviewed_by foreign key
CREATE INDEX IF NOT EXISTS idx_suggestions_reviewed_by 
ON public.suggestions(reviewed_by);

RAISE NOTICE '✅ Added index for suggestions.reviewed_by';

-- =====================================================
-- USER GROUPS TABLE INDEXES
-- =====================================================

-- Add index for user_groups.parent_group_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_groups_parent_group_id 
ON public.user_groups(parent_group_id);

RAISE NOTICE '✅ Added index for user_groups.parent_group_id';

-- =====================================================
-- USER PROFILES TABLE INDEXES
-- =====================================================

-- Add index for user_profiles.department_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_profiles_department_id 
ON public.user_profiles(department_id);

RAISE NOTICE '✅ Added index for user_profiles.department_id';

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Update statistics for the query planner
ANALYZE;

-- =====================================================
-- VALIDATION AND SUMMARY
-- =====================================================

DO $$
DECLARE
    expected_indexes TEXT[] := ARRAY[
        'idx_chat_messages_reply_to_id',
        'idx_content_calendar_parent_event_id',
        'idx_direct_messages_reply_to_id',
        'idx_form_fields_form_template_id',
        'idx_group_messages_reply_to_id',
        'idx_monthly_goals_created_by',
        'idx_roles_parent_role_id',
        'idx_suggestions_reviewed_by',
        'idx_user_groups_parent_group_id',
        'idx_user_profiles_department_id'
    ];
    index_name TEXT;
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
    found_count INTEGER := 0;
BEGIN
    -- Count newly created indexes
    FOREACH index_name IN ARRAY expected_indexes
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname = index_name
        ) THEN
            found_count := found_count + 1;
        ELSE
            missing_indexes := array_append(missing_indexes, index_name);
        END IF;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL FOREIGN KEY INDEXES ADDED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added %/% final indexes', found_count, array_length(expected_indexes, 1);
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE NOTICE '⚠️  Missing indexes: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE '🎉 All final foreign key indexes created successfully!';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Performance Benefits:';
    RAISE NOTICE '  - Eliminated all unindexed foreign key warnings';
    RAISE NOTICE '  - Optimized query performance for message threading';
    RAISE NOTICE '  - Improved content calendar hierarchy queries';
    RAISE NOTICE '  - Enhanced user relationship lookups';
    RAISE NOTICE '  - Better role hierarchy performance';
    RAISE NOTICE '';
    RAISE NOTICE 'Affected Tables:';
    RAISE NOTICE '  - Communication: chat_messages, direct_messages, group_messages';
    RAISE NOTICE '  - Content Management: content_calendar, form_fields';
    RAISE NOTICE '  - User Management: user_profiles, user_groups, roles, suggestions';
    RAISE NOTICE '  - Goals: monthly_goals';
    RAISE NOTICE '';
    RAISE NOTICE 'Database statistics updated (ANALYZE)';
    RAISE NOTICE '========================================';
END $$;

END;