-- Migration: 119_add_missing_foreign_key_indexes
-- Fix performance issues by adding indexes for unindexed foreign keys
-- This addresses database linting warnings and improves query performance

BEGIN;

RAISE NOTICE '========================================';
RAISE NOTICE '🔧 ADDING MISSING FOREIGN KEY INDEXES';
RAISE NOTICE '========================================';

-- =====================================================
-- AUDIT LOGS TABLE INDEXES
-- =====================================================

-- Add index for audit_logs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON public.audit_logs(user_id);

RAISE NOTICE '✅ Added index for audit_logs.user_id';

-- =====================================================
-- CATEGORIES TABLE INDEXES  
-- =====================================================

-- Add index for categories.parent_id foreign key
CREATE INDEX IF NOT EXISTS idx_categories_parent_id 
ON public.categories(parent_id);

RAISE NOTICE '✅ Added index for categories.parent_id';

-- =====================================================
-- COMMENT REACTIONS TABLE INDEXES
-- =====================================================

-- Add index for comment_reactions.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id 
ON public.comment_reactions(user_id);

RAISE NOTICE '✅ Added index for comment_reactions.user_id';

-- =====================================================
-- CONTENT TABLE INDEXES
-- =====================================================

-- Add index for content.parent_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_parent_id 
ON public.content(parent_id);

RAISE NOTICE '✅ Added index for content.parent_id';

-- =====================================================
-- CONTENT ALERTS TABLE INDEXES
-- =====================================================

-- Add index for content_alerts.content_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_alerts_content_id 
ON public.content_alerts(content_id);

RAISE NOTICE '✅ Added index for content_alerts.content_id';

-- =====================================================
-- CONTENT CALENDAR TABLE INDEXES
-- =====================================================

-- Add index for content_calendar.content_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_id 
ON public.content_calendar(content_id);

RAISE NOTICE '✅ Added index for content_calendar.content_id';

-- =====================================================
-- CONTENT CATEGORIES TABLE INDEXES
-- =====================================================

-- Add index for content_categories.category_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_categories_category_id 
ON public.content_categories(category_id);

RAISE NOTICE '✅ Added index for content_categories.category_id';

-- =====================================================
-- CONTENT COMMENTS TABLE INDEXES
-- =====================================================

-- Add index for content_comments.content_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id 
ON public.content_comments(content_id);

-- Add index for content_comments.parent_comment_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_comment_id 
ON public.content_comments(parent_comment_id);

RAISE NOTICE '✅ Added indexes for content_comments.content_id and parent_comment_id';

-- =====================================================
-- CONTENT DEADLINES TABLE INDEXES
-- =====================================================

-- Add index for content_deadlines.content_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_deadlines_content_id 
ON public.content_deadlines(content_id);

RAISE NOTICE '✅ Added index for content_deadlines.content_id';

-- =====================================================
-- CONTENT MEDIA TABLE INDEXES
-- =====================================================

-- Add index for content_media.media_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_media_media_id 
ON public.content_media(media_id);

RAISE NOTICE '✅ Added index for content_media.media_id';

-- =====================================================
-- CONTENT PUBLICATION SCHEDULE TABLE INDEXES
-- =====================================================

-- Add index for content_publication_schedule.content_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_publication_schedule_content_id 
ON public.content_publication_schedule(content_id);

RAISE NOTICE '✅ Added index for content_publication_schedule.content_id';

-- =====================================================
-- CONTENT TAGS TABLE INDEXES
-- =====================================================

-- Add index for content_tags.tag_id foreign key
CREATE INDEX IF NOT EXISTS idx_content_tags_tag_id 
ON public.content_tags(tag_id);

RAISE NOTICE '✅ Added index for content_tags.tag_id';

-- =====================================================
-- FORM SUBMISSIONS TABLE INDEXES
-- =====================================================

-- Add index for form_submissions.form_template_id foreign key
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_template_id 
ON public.form_submissions(form_template_id);

RAISE NOTICE '✅ Added index for form_submissions.form_template_id';

-- =====================================================
-- GROUP PERMISSIONS TABLE INDEXES
-- =====================================================

-- Add index for group_permissions.permission_id foreign key
CREATE INDEX IF NOT EXISTS idx_group_permissions_permission_id 
ON public.group_permissions(permission_id);

RAISE NOTICE '✅ Added index for group_permissions.permission_id';

-- =====================================================
-- GROUP USERS TABLE INDEXES
-- =====================================================

-- Add index for group_users.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_group_users_user_id 
ON public.group_users(user_id);

RAISE NOTICE '✅ Added index for group_users.user_id';

-- =====================================================
-- GROUPS TABLE INDEXES
-- =====================================================

-- Add index for groups.parent_group_id foreign key
CREATE INDEX IF NOT EXISTS idx_groups_parent_group_id 
ON public.groups(parent_group_id);

RAISE NOTICE '✅ Added index for groups.parent_group_id';

-- =====================================================
-- NEWSLETTER CLICKS TABLE INDEXES
-- =====================================================

-- Add index for newsletter_clicks.link_id foreign key
CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_link_id 
ON public.newsletter_clicks(link_id);

-- Add index for newsletter_clicks.send_id foreign key
CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_send_id 
ON public.newsletter_clicks(send_id);

RAISE NOTICE '✅ Added indexes for newsletter_clicks.link_id and send_id';

-- =====================================================
-- NEWSLETTER LINKS TABLE INDEXES
-- =====================================================

-- Add index for newsletter_links.campaign_id foreign key
CREATE INDEX IF NOT EXISTS idx_newsletter_links_campaign_id 
ON public.newsletter_links(campaign_id);

RAISE NOTICE '✅ Added index for newsletter_links.campaign_id';

-- =====================================================
-- NEWSLETTER OPENS TABLE INDEXES
-- =====================================================

-- Add index for newsletter_opens.send_id foreign key
CREATE INDEX IF NOT EXISTS idx_newsletter_opens_send_id 
ON public.newsletter_opens(send_id);

RAISE NOTICE '✅ Added index for newsletter_opens.send_id';

-- =====================================================
-- NEWSLETTER SENDS TABLE INDEXES
-- =====================================================

-- Add index for newsletter_sends.subscriber_id foreign key
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_subscriber_id 
ON public.newsletter_sends(subscriber_id);

RAISE NOTICE '✅ Added index for newsletter_sends.subscriber_id';

-- =====================================================
-- NOTIFICATIONS TABLE INDEXES
-- =====================================================

-- Add index for notifications.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
ON public.notifications(user_id);

RAISE NOTICE '✅ Added index for notifications.user_id';

-- =====================================================
-- SUBSCRIBER LISTS TABLE INDEXES
-- =====================================================

-- Add index for subscriber_lists.list_id foreign key
CREATE INDEX IF NOT EXISTS idx_subscriber_lists_list_id 
ON public.subscriber_lists(list_id);

RAISE NOTICE '✅ Added index for subscriber_lists.list_id';

-- =====================================================
-- SUGGESTIONS TABLE INDEXES
-- =====================================================

-- Add index for suggestions.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id 
ON public.suggestions(user_id);

RAISE NOTICE '✅ Added index for suggestions.user_id';

-- =====================================================
-- VIDEO CALL EVENTS TABLE INDEXES
-- =====================================================

-- Add index for video_call_events.call_id foreign key
CREATE INDEX IF NOT EXISTS idx_video_call_events_call_id 
ON public.video_call_events(call_id);

-- Add index for video_call_events.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_video_call_events_user_id 
ON public.video_call_events(user_id);

RAISE NOTICE '✅ Added indexes for video_call_events.call_id and user_id';

-- =====================================================
-- VIDEO CALL PARTICIPANTS TABLE INDEXES
-- =====================================================

-- Add index for video_call_participants.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_video_call_participants_user_id 
ON public.video_call_participants(user_id);

RAISE NOTICE '✅ Added index for video_call_participants.user_id';

-- =====================================================
-- VIDEO CALLS TABLE INDEXES
-- =====================================================

-- Add index for video_calls.initiated_by foreign key
CREATE INDEX IF NOT EXISTS idx_video_calls_initiated_by 
ON public.video_calls(initiated_by);

RAISE NOTICE '✅ Added index for video_calls.initiated_by';

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
    index_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Count newly created indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    AND indexname IN (
        'idx_audit_logs_user_id',
        'idx_categories_parent_id',
        'idx_comment_reactions_user_id',
        'idx_content_parent_id',
        'idx_content_alerts_content_id',
        'idx_content_calendar_content_id',
        'idx_content_categories_category_id',
        'idx_content_comments_content_id',
        'idx_content_comments_parent_comment_id',
        'idx_content_deadlines_content_id',
        'idx_content_media_media_id',
        'idx_content_publication_schedule_content_id',
        'idx_content_tags_tag_id',
        'idx_form_submissions_form_template_id',
        'idx_group_permissions_permission_id',
        'idx_group_users_user_id',
        'idx_groups_parent_group_id',
        'idx_newsletter_clicks_link_id',
        'idx_newsletter_clicks_send_id',
        'idx_newsletter_links_campaign_id',
        'idx_newsletter_opens_send_id',
        'idx_newsletter_sends_subscriber_id',
        'idx_notifications_user_id',
        'idx_subscriber_lists_list_id',
        'idx_suggestions_user_id',
        'idx_video_call_events_call_id',
        'idx_video_call_events_user_id',
        'idx_video_call_participants_user_id',
        'idx_video_calls_initiated_by'
    );
    
    -- Count unique tables affected
    SELECT COUNT(DISTINCT tablename) INTO table_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    AND indexname IN (
        'idx_audit_logs_user_id',
        'idx_categories_parent_id',
        'idx_comment_reactions_user_id',
        'idx_content_parent_id',
        'idx_content_alerts_content_id',
        'idx_content_calendar_content_id',
        'idx_content_categories_category_id',
        'idx_content_comments_content_id',
        'idx_content_comments_parent_comment_id',
        'idx_content_deadlines_content_id',
        'idx_content_media_media_id',
        'idx_content_publication_schedule_content_id',
        'idx_content_tags_tag_id',
        'idx_form_submissions_form_template_id',
        'idx_group_permissions_permission_id',
        'idx_group_users_user_id',
        'idx_groups_parent_group_id',
        'idx_newsletter_clicks_link_id',
        'idx_newsletter_clicks_send_id',
        'idx_newsletter_links_campaign_id',
        'idx_newsletter_opens_send_id',
        'idx_newsletter_sends_subscriber_id',
        'idx_notifications_user_id',
        'idx_subscriber_lists_list_id',
        'idx_suggestions_user_id',
        'idx_video_call_events_call_id',
        'idx_video_call_events_user_id',
        'idx_video_call_participants_user_id',
        'idx_video_calls_initiated_by'
    );
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FOREIGN KEY INDEXES ADDED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added % indexes on % tables', index_count, table_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Performance Benefits:';
    RAISE NOTICE '  - Faster foreign key lookups';
    RAISE NOTICE '  - Improved JOIN performance';
    RAISE NOTICE '  - Better query planning';
    RAISE NOTICE '  - Reduced database linting warnings';
    RAISE NOTICE '';
    RAISE NOTICE 'Affected Tables:';
    RAISE NOTICE '  - audit_logs, categories, comment_reactions';
    RAISE NOTICE '  - content, content_alerts, content_calendar';
    RAISE NOTICE '  - content_categories, content_comments';
    RAISE NOTICE '  - content_deadlines, content_media';
    RAISE NOTICE '  - content_publication_schedule, content_tags';
    RAISE NOTICE '  - form_submissions, group_permissions';
    RAISE NOTICE '  - group_users, groups';
    RAISE NOTICE '  - newsletter_clicks, newsletter_links';
    RAISE NOTICE '  - newsletter_opens, newsletter_sends';
    RAISE NOTICE '  - notifications, subscriber_lists';
    RAISE NOTICE '  - suggestions, video_call_events';
    RAISE NOTICE '  - video_call_participants, video_calls';
    RAISE NOTICE '';
    RAISE NOTICE 'Database statistics updated (ANALYZE)';
    RAISE NOTICE '========================================';
END $$;

END;