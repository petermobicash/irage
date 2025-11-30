-- Create bulk email logs table for tracking bulk notifications
-- This table tracks bulk email campaigns sent through the Gmail notification system

CREATE TABLE IF NOT EXISTS public.bulk_email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject TEXT NOT NULL,
    template_used TEXT,
    total_recipients INTEGER DEFAULT 0,
    successful_sends INTEGER DEFAULT 0,
    failed_sends INTEGER DEFAULT 0,
    notification_type TEXT DEFAULT 'bulk_notification',
    sender_email TEXT DEFAULT 'nyirurugoclvr@gmail.com',
    sender_name TEXT DEFAULT 'BENIRAGE Organization',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bulk_email_logs_created_at ON public.bulk_email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_email_logs_notification_type ON public.bulk_email_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_bulk_email_logs_sender_email ON public.bulk_email_logs(sender_email);

-- Enable RLS
ALTER TABLE public.bulk_email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for bulk_email_logs
CREATE POLICY "Service role can manage all bulk email logs" ON public.bulk_email_logs
    FOR ALL USING (is_service_role());

CREATE POLICY "Authenticated users can view bulk email logs" ON public.bulk_email_logs
    FOR SELECT USING (auth.uid() IS NOT NULL OR public.safe_is_super_admin());

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_bulk_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_bulk_email_logs_updated_at
    BEFORE UPDATE ON public.bulk_email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_bulk_email_logs_updated_at();

-- Grant permissions
GRANT ALL ON public.bulk_email_logs TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Add sample data for testing (optional)
INSERT INTO public.bulk_email_logs (subject, template_used, total_recipients, successful_sends, failed_sends, notification_type)
VALUES 
    ('Welcome to BENIRAGE Community', 'welcome', 150, 148, 2, 'welcome_email'),
    ('Upcoming Cultural Festival Announcement', 'event', 200, 195, 5, 'event_invitation'),
    ('Monthly Organization Update', 'update', 300, 298, 2, 'organization_update')
ON CONFLICT DO NOTHING;

-- Grant additional permissions for RLS policies
GRANT EXECUTE ON FUNCTION public.is_service_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.safe_is_super_admin() TO anon, authenticated, service_role;

-- Create notification for successful table creation
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bulk_email_logs'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ Created bulk_email_logs table successfully';
        RAISE NOTICE '✅ Enabled RLS policies for security';
        RAISE NOTICE '✅ Created indexes for optimal performance';
        RAISE NOTICE '✅ Added sample data for testing';
        RAISE NOTICE '';
        RAISE NOTICE 'Bulk Email Features:';
        RAISE NOTICE '- Track bulk email campaigns';
        RAISE NOTICE '- Monitor success/failure rates';
        RAISE NOTICE '- Store metadata for analytics';
        RAISE NOTICE '- Integration with Gmail notification system';
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE '❌ Failed to create bulk_email_logs table';
    END IF;
END $$;