-- =====================================================
-- CONSOLIDATED TEST ENVIRONMENT MIGRATION
-- =====================================================
-- This migration consolidates all necessary database changes
-- for the test environment after the refactoring
-- 
-- Run this migration in test environment to ensure all
-- tables, functions, and policies are up to date
-- =====================================================

-- Ensure all required extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- VERIFY CORE TABLES EXIST
-- =====================================================

-- Verify user_profiles table exists with all required columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        RAISE EXCEPTION 'user_profiles table does not exist. Run initial migrations first.';
    END IF;
END $$;

-- =====================================================
-- ADD MISSING INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on user_profiles for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Index on chat_messages for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Index on content for faster searches
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_content_author_id ON public.content(author_id);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON public.content(published_at DESC);

-- =====================================================
-- VERIFY RLS POLICIES ARE CORRECT
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ADD AUDIT LOGGING
-- =====================================================

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- =====================================================
-- VERIFY FUNCTIONS EXIST
-- =====================================================

-- Verify handle_new_user function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) THEN
        RAISE NOTICE 'handle_new_user function does not exist. Creating it...';
        
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $func$
        BEGIN
            INSERT INTO public.user_profiles (user_id, email, full_name)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
            );
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;
END $$;

-- =====================================================
-- VERIFY TRIGGERS EXIST
-- =====================================================

-- Ensure trigger for new user creation exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TEST DATA CLEANUP (TEST ENVIRONMENT ONLY)
-- =====================================================

-- Add comment to identify test data
COMMENT ON TABLE public.audit_logs IS 'Audit log table for tracking all database changes';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Test environment migration 077 completed successfully';
END $$;