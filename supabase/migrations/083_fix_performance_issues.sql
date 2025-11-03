-- =====================================================
-- FIX PERFORMANCE ISSUES
-- =====================================================
-- This migration addresses database linter performance warnings:
-- 1. Adds missing indexes for foreign keys
-- 2. Adds primary key to policy_backup table
-- 3. Removes unused indexes
-- =====================================================

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- Add missing indexes for foreign keys that don't have covering indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id ON public.chat_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_parent_event_id ON public.content_calendar(parent_event_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_reply_to_id ON public.direct_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_template_id ON public.form_fields(form_template_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_reply_to_id ON public.group_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_created_by ON public.monthly_goals(created_by);
CREATE INDEX IF NOT EXISTS idx_roles_parent_role_id ON public.roles(parent_role_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_reviewed_by ON public.suggestions(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_user_groups_parent_group_id ON public.user_groups(parent_group_id);

-- =====================================================
-- 2. ADD PRIMARY KEY TO POLICY_BACKUP TABLE
-- =====================================================

-- Check if policy_backup table exists and add primary key if missing
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'policy_backup') THEN
        -- Check if it already has a primary key
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = 'public'
            AND table_name = 'policy_backup'
            AND constraint_type = 'PRIMARY KEY'
        ) THEN
            -- Add an id column and make it primary key
            ALTER TABLE public.policy_backup ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 3. REMOVE UNUSED INDEXES
-- =====================================================

-- Drop unused indexes (only drop if they exist and are confirmed unused)
-- Note: Be careful with this in production - only drop if you're certain they're unused

-- Content table unused indexes
DROP INDEX IF EXISTS idx_content_slug;
DROP INDEX IF EXISTS idx_content_status;
DROP INDEX IF EXISTS idx_content_author_id;
DROP INDEX IF EXISTS idx_content_created_at;

-- Content comments unused indexes
DROP INDEX IF EXISTS idx_content_comments_content_id;
DROP INDEX IF EXISTS idx_content_comments_status;
DROP INDEX IF EXISTS idx_content_comments_created_at;

-- Chat messages unused indexes
DROP INDEX IF EXISTS idx_chat_messages_conversation_id;
DROP INDEX IF EXISTS idx_chat_messages_group_id;
DROP INDEX IF EXISTS idx_chat_messages_sender_id;
DROP INDEX IF EXISTS idx_chat_messages_created_at;
DROP INDEX IF EXISTS idx_chat_messages_is_deleted;

-- Direct messages unused indexes
DROP INDEX IF EXISTS idx_direct_messages_conversation_id;
DROP INDEX IF EXISTS idx_direct_messages_sender_id;
DROP INDEX IF EXISTS idx_direct_messages_receiver_id;
DROP INDEX IF EXISTS idx_direct_messages_created_at;
DROP INDEX IF EXISTS idx_direct_messages_is_deleted;

-- Group messages unused indexes
DROP INDEX IF EXISTS idx_group_messages_group_id;
DROP INDEX IF EXISTS idx_group_messages_sender_id;
DROP INDEX IF EXISTS idx_group_messages_created_at;
DROP INDEX IF EXISTS idx_group_messages_is_deleted;

-- User profiles unused indexes
DROP INDEX IF EXISTS idx_user_profiles_user_id;
DROP INDEX IF EXISTS idx_user_profiles_status;
DROP INDEX IF EXISTS idx_user_profiles_is_online;

-- Typing indicators unused indexes
DROP INDEX IF EXISTS idx_typing_indicators_conversation_id;
DROP INDEX IF EXISTS idx_typing_indicators_group_id;
DROP INDEX IF EXISTS idx_typing_indicators_user_id;

-- Message read receipts unused indexes
DROP INDEX IF EXISTS idx_message_read_receipts_message_id;
DROP INDEX IF EXISTS idx_message_read_receipts_user_id;

-- Chat messages room_id index (unused)
DROP INDEX IF EXISTS idx_chat_messages_room_id;

-- Content unused indexes
DROP INDEX IF EXISTS idx_content_type;
DROP INDEX IF EXISTS idx_content_published_at;

-- Content comments unused indexes
DROP INDEX IF EXISTS idx_content_comments_parent_comment_id;
DROP INDEX IF EXISTS idx_content_comments_author_id;

-- Comment reactions unused indexes
DROP INDEX IF EXISTS idx_comment_reactions_comment_id;
DROP INDEX IF EXISTS idx_comment_reactions_user_id;
DROP INDEX IF EXISTS idx_comment_reactions_reaction_type;

-- Content unused indexes
DROP INDEX IF EXISTS idx_content_featured_image;
DROP INDEX IF EXISTS idx_content_gallery;
DROP INDEX IF EXISTS idx_content_enhanced_status;
DROP INDEX IF EXISTS idx_content_scheduled_for;
DROP INDEX IF EXISTS idx_content_featured;
DROP INDEX IF EXISTS idx_content_sticky;
DROP INDEX IF EXISTS idx_content_priority;
DROP INDEX IF EXISTS idx_content_parent_id;
DROP INDEX IF EXISTS idx_content_seo_keywords;

-- Media unused indexes
DROP INDEX IF EXISTS idx_media_type;
DROP INDEX IF EXISTS idx_media_uploaded_by;
DROP INDEX IF EXISTS idx_media_uploaded_at;
DROP INDEX IF EXISTS idx_media_is_public;
DROP INDEX IF EXISTS idx_media_tags;

-- Categories unused indexes
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_categories_parent_id;
DROP INDEX IF EXISTS idx_categories_is_active;

-- Tags unused indexes
DROP INDEX IF EXISTS idx_tags_slug;
DROP INDEX IF EXISTS idx_tags_is_active;

-- Form submissions unused indexes
DROP INDEX IF EXISTS idx_form_submissions_template_id;
DROP INDEX IF EXISTS idx_form_submissions_status;
DROP INDEX IF EXISTS idx_form_submissions_submitted_at;

-- Users unused indexes
DROP INDEX IF EXISTS idx_users_user_id;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_users_groups;

-- Content categories unused indexes
DROP INDEX IF EXISTS idx_content_categories_content_id;
DROP INDEX IF EXISTS idx_content_categories_category_id;

-- Content tags unused indexes
DROP INDEX IF EXISTS idx_content_tags_content_id;
DROP INDEX IF EXISTS idx_content_tags_tag_id;

-- Content media unused indexes
DROP INDEX IF EXISTS idx_content_media_content_id;
DROP INDEX IF EXISTS idx_content_media_media_id;

-- Newsletter subscribers unused indexes
DROP INDEX IF EXISTS idx_newsletter_subscribers_email;
DROP INDEX IF EXISTS idx_newsletter_subscribers_status;
DROP INDEX IF EXISTS idx_newsletter_subscribers_subscribed_at;
DROP INDEX IF EXISTS idx_newsletter_subscribers_tags;
DROP INDEX IF EXISTS idx_newsletter_subscribers_confirmed_at;

-- Newsletter campaigns unused indexes
DROP INDEX IF EXISTS idx_newsletter_campaigns_status;
DROP INDEX IF EXISTS idx_newsletter_campaigns_type;
DROP INDEX IF EXISTS idx_newsletter_campaigns_scheduled_for;
DROP INDEX IF EXISTS idx_newsletter_campaigns_sent_at;
DROP INDEX IF EXISTS idx_newsletter_campaigns_created_by;

-- Newsletter sends unused indexes
DROP INDEX IF EXISTS idx_newsletter_sends_campaign_id;
DROP INDEX IF EXISTS idx_newsletter_sends_subscriber_id;
DROP INDEX IF EXISTS idx_newsletter_sends_status;
DROP INDEX IF EXISTS idx_newsletter_sends_sent_at;

-- Newsletter links unused indexes
DROP INDEX IF EXISTS idx_newsletter_links_campaign_id;
DROP INDEX IF EXISTS idx_newsletter_links_url;

-- Newsletter clicks unused indexes
DROP INDEX IF EXISTS idx_newsletter_clicks_send_id;
DROP INDEX IF EXISTS idx_newsletter_clicks_link_id;
DROP INDEX IF EXISTS idx_newsletter_clicks_clicked_at;

-- Newsletter opens unused indexes
DROP INDEX IF EXISTS idx_newsletter_opens_send_id;
DROP INDEX IF EXISTS idx_newsletter_opens_opened_at;

-- Subscriber lists unused indexes
DROP INDEX IF EXISTS idx_subscriber_lists_subscriber_id;
DROP INDEX IF EXISTS idx_subscriber_lists_list_id;

-- Content calendar unused indexes
DROP INDEX IF EXISTS idx_content_calendar_content_id;
DROP INDEX IF EXISTS idx_content_calendar_event_type;
DROP INDEX IF EXISTS idx_content_calendar_status;
DROP INDEX IF EXISTS idx_content_calendar_start_date;
DROP INDEX IF EXISTS idx_content_calendar_end_date;
DROP INDEX IF EXISTS idx_content_calendar_assigned_to;
DROP INDEX IF EXISTS idx_content_calendar_tags;
DROP INDEX IF EXISTS idx_content_calendar_is_recurring;

-- Content deadlines unused indexes
DROP INDEX IF EXISTS idx_content_deadlines_content_id;
DROP INDEX IF EXISTS idx_content_deadlines_deadline_type;
DROP INDEX IF EXISTS idx_content_deadlines_status;
DROP INDEX IF EXISTS idx_content_deadlines_due_date;
DROP INDEX IF EXISTS idx_content_deadlines_assigned_to;

-- Content workflow stages unused indexes
DROP INDEX IF EXISTS idx_content_workflow_stages_content_id;
DROP INDEX IF EXISTS idx_content_workflow_stages_status;
DROP INDEX IF EXISTS idx_content_workflow_stages_assigned_to;

-- Content publication schedule unused indexes
DROP INDEX IF EXISTS idx_content_publication_schedule_content_id;
DROP INDEX IF EXISTS idx_content_publication_schedule_scheduled_date;
DROP INDEX IF EXISTS idx_content_publication_schedule_status;

-- Content performance metrics unused indexes
DROP INDEX IF EXISTS idx_content_performance_metrics_content_id;
DROP INDEX IF EXISTS idx_content_performance_metrics_metric_date;

-- Content alerts unused indexes
DROP INDEX IF EXISTS idx_content_alerts_content_id;
DROP INDEX IF EXISTS idx_content_alerts_alert_type;
DROP INDEX IF EXISTS idx_content_alerts_severity;
DROP INDEX IF EXISTS idx_content_alerts_is_read;
DROP INDEX IF EXISTS idx_content_alerts_assigned_to;

-- Suggestions unused indexes
DROP INDEX IF EXISTS idx_suggestions_content_id;
DROP INDEX IF EXISTS idx_suggestions_user_id;
DROP INDEX IF EXISTS idx_suggestions_status;
DROP INDEX IF EXISTS idx_suggestions_created_at;

-- Monthly goals unused indexes
DROP INDEX IF EXISTS idx_monthly_goals_status;
DROP INDEX IF EXISTS idx_monthly_goals_end_date;
DROP INDEX IF EXISTS idx_monthly_goals_category;

-- Security events unused indexes
DROP INDEX IF EXISTS idx_security_events_event_type;
DROP INDEX IF EXISTS idx_security_events_function_name;
DROP INDEX IF EXISTS idx_security_events_created_at;

-- User activity log unused indexes
DROP INDEX IF EXISTS idx_user_activity_log_user_id;
DROP INDEX IF EXISTS idx_user_activity_log_created_at;

-- User sessions unused indexes
DROP INDEX IF EXISTS idx_user_sessions_user_id;
DROP INDEX IF EXISTS idx_user_sessions_token;
DROP INDEX IF EXISTS idx_user_sessions_is_active;

-- User profiles unused indexes
DROP INDEX IF EXISTS idx_user_profiles_is_active;
DROP INDEX IF EXISTS idx_user_profiles_username;

-- Groups unused indexes
DROP INDEX IF EXISTS idx_groups_parent_group_id;
DROP INDEX IF EXISTS idx_groups_is_active;
DROP INDEX IF EXISTS idx_groups_is_system_group;
DROP INDEX IF EXISTS idx_groups_created_by;

-- Group users unused indexes
DROP INDEX IF EXISTS idx_group_users_group_id;
DROP INDEX IF EXISTS idx_group_users_user_id;
DROP INDEX IF EXISTS idx_group_users_is_active;
DROP INDEX IF EXISTS idx_group_users_assigned_at;

-- Group permissions unused indexes
DROP INDEX IF EXISTS idx_group_permissions_group_id;
DROP INDEX IF EXISTS idx_group_permissions_permission_id;

-- Permissions unused indexes
DROP INDEX IF EXISTS idx_permissions_slug;
DROP INDEX IF EXISTS idx_permissions_module;
DROP INDEX IF EXISTS idx_permissions_is_active;
DROP INDEX IF EXISTS idx_permissions_created_by;

-- Donations unused indexes
DROP INDEX IF EXISTS idx_donations_donation_date;
DROP INDEX IF EXISTS idx_donations_payment_status;
DROP INDEX IF EXISTS idx_donations_donor_email;

-- Membership applications unused indexes
DROP INDEX IF EXISTS idx_membership_applications_email;
DROP INDEX IF EXISTS idx_membership_applications_status;
DROP INDEX IF EXISTS idx_membership_applications_submission_date;

-- Contact submissions unused indexes
DROP INDEX IF EXISTS idx_contact_submissions_email;
DROP INDEX IF EXISTS idx_contact_submissions_status;
DROP INDEX IF EXISTS idx_contact_submissions_submission_date;

-- Partnership applications unused indexes
DROP INDEX IF EXISTS idx_partnership_applications_email;
DROP INDEX IF EXISTS idx_partnership_applications_status;
DROP INDEX IF EXISTS idx_partnership_applications_submission_date;

-- Volunteer applications unused indexes
DROP INDEX IF EXISTS idx_volunteer_applications_email;
DROP INDEX IF EXISTS idx_volunteer_applications_status;
DROP INDEX IF EXISTS idx_volunteer_applications_submission_date;

-- Activity logs unused indexes
DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP INDEX IF EXISTS idx_activity_logs_timestamp;
DROP INDEX IF EXISTS idx_activity_logs_resource_type;

-- Video calls unused indexes
DROP INDEX IF EXISTS idx_video_calls_call_id;
DROP INDEX IF EXISTS idx_video_calls_room_id;
DROP INDEX IF EXISTS idx_video_calls_conversation_id;
DROP INDEX IF EXISTS idx_video_calls_initiated_by;
DROP INDEX IF EXISTS idx_video_calls_status;
DROP INDEX IF EXISTS idx_video_calls_started_at;

-- Video call participants unused indexes
DROP INDEX IF EXISTS idx_video_call_participants_call_id;
DROP INDEX IF EXISTS idx_video_call_participants_user_id;
DROP INDEX IF EXISTS idx_video_call_participants_joined_at;

-- Video call events unused indexes
DROP INDEX IF EXISTS idx_video_call_events_call_id;
DROP INDEX IF EXISTS idx_video_call_events_user_id;
DROP INDEX IF EXISTS idx_video_call_events_created_at;

-- Chat messages message_status unused index
DROP INDEX IF EXISTS idx_chat_messages_message_status;

-- Audit logs unused indexes
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_action;
DROP INDEX IF EXISTS idx_audit_logs_resource;
DROP INDEX IF EXISTS idx_audit_logs_timestamp;
DROP INDEX IF EXISTS idx_audit_logs_severity;
DROP INDEX IF EXISTS idx_audit_logs_category;
DROP INDEX IF EXISTS idx_audit_logs_organization_id;

-- Notifications unused indexes
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_organization_id;

-- Content versions unused indexes
DROP INDEX IF EXISTS idx_content_versions_content_id;
DROP INDEX IF EXISTS idx_content_versions_version_number;
DROP INDEX IF EXISTS idx_content_versions_created_at;
DROP INDEX IF EXISTS idx_content_versions_organization_id;

-- Organizations unused indexes
DROP INDEX IF EXISTS idx_organizations_slug;
DROP INDEX IF EXISTS idx_organizations_is_active;

-- User profiles access_level unused index
DROP INDEX IF EXISTS idx_user_profiles_access_level;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PERFORMANCE ISSUES FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added missing indexes for foreign keys';
    RAISE NOTICE '✅ Added primary key to policy_backup table';
    RAISE NOTICE '✅ Removed unused indexes to improve performance';
    RAISE NOTICE '';
    RAISE NOTICE 'Database performance has been optimized.';
    RAISE NOTICE '========================================';
END $$;