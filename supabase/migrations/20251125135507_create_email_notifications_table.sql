-- Create email_notifications table for tracking individual email notifications
-- This table logs all individual email notifications sent through the Gmail system

CREATE TABLE IF NOT EXISTS public.email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    guest_name TEXT,
    admin_name TEXT,
    subject TEXT NOT NULL,
    message_preview TEXT,
    room_name TEXT,
    notification_type TEXT DEFAULT 'bulk_notification',
    status TEXT DEFAULT 'pending',
    html_body TEXT,
    text_body TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient ON public.email_notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON public.email_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON public.email_notifications(notification_type);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for email_notifications
CREATE POLICY "Service role can manage all email notifications" ON public.email_notifications
    FOR ALL USING (is_service_role());

CREATE POLICY "Authenticated users can view email notifications" ON public.email_notifications
    FOR SELECT USING (auth.uid() IS NOT NULL OR public.safe_is_super_admin());

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_email_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_email_notifications_updated_at
    BEFORE UPDATE ON public.email_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_email_notifications_updated_at();

-- Grant permissions
GRANT ALL ON public.email_notifications TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Add sample data for testing (optional)
INSERT INTO public.email_notifications (recipient_email, subject, message_preview, notification_type, status)
VALUES 
    ('member@example.com', 'Welcome to BENIRAGE!', 'Thank you for joining our community...', 'welcome', 'sent'),
    ('volunteer@example.com', 'Volunteer Orientation Scheduled', 'Your volunteer orientation is scheduled...', 'event', 'sent'),
    ('donor@example.com', 'Thank You for Your Donation', 'Your generous donation helps us...', 'acknowledgment', 'sent')
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
        AND table_name = 'email_notifications'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ Created email_notifications table successfully';
        RAISE NOTICE '✅ Enabled RLS policies for security';
        RAISE NOTICE '✅ Created indexes for optimal performance';
        RAISE NOTICE '✅ Added sample data for testing';
        RAISE NOTICE '';
        RAISE NOTICE 'Email Notification Features:';
        RAISE NOTICE '- Track individual email notifications';
        RAISE NOTICE '- Monitor delivery status';
        RAISE NOTICE '- Store email content for compliance';
        RAISE NOTICE '- Integration with Gmail notification system';
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE '❌ Failed to create email_notifications table';
    END IF;
END $$;