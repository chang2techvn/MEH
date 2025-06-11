-- Migration to add notification templates and scheduled messages tables

-- Notification templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'push', 'system')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled messages
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('email', 'push', 'system')),
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    recipient_filter JSONB, -- For storing filter criteria like user roles, segments, etc.
    recipient_count INTEGER DEFAULT 0,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    recurring_pattern TEXT CHECK (recurring_pattern IN ('none', 'daily', 'weekly', 'monthly')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification delivery tracking (for engagement metrics)
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    delivery_status TEXT DEFAULT 'delivered' CHECK (delivery_status IN ('delivered', 'failed', 'bounced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_scheduled_for ON public.scheduled_messages(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON public.scheduled_messages(status);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id ON public.notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user_id ON public.notification_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_delivered_at ON public.notification_deliveries(delivered_at);

-- Insert sample notification templates
INSERT INTO public.notification_templates (name, subject, content, notification_type) VALUES
('New Event Announcement', 'Join Our Upcoming Event!', 'We''re excited to announce our upcoming event on {date}. Don''t miss out on this opportunity to {benefit}.', 'email'),
('Weekly Challenge', 'Your Weekly English Challenge is Here', 'This week''s challenge focuses on {topic}. Complete it by {date} to earn bonus points!', 'email'),
('Course Update', 'Important Course Update', 'We''ve updated the {course_name} with new materials. Check it out now to enhance your learning experience.', 'email'),
('Achievement Unlocked', 'Congratulations! You''ve Unlocked a New Achievement', 'You''ve successfully completed {achievement_name}. Keep up the great work!', 'push'),
('Daily Reminder', 'Don''t Forget Your Daily Practice', 'Take a few minutes today to practice your English skills. Your consistency is key to success!', 'push');

-- Insert sample scheduled messages
INSERT INTO public.scheduled_messages (title, message_type, scheduled_for, recurring_pattern, recipient_count) VALUES
('Weekly Newsletter', 'email', NOW() + INTERVAL '1 week', 'weekly', 876),
('New Course Announcement', 'email', NOW() + INTERVAL '3 days', 'none', 1254),
('Weekend Challenge', 'email', NOW() + INTERVAL '5 days', 'weekly', 542),
('Monthly Progress Report', 'email', NOW() + INTERVAL '1 month', 'monthly', 1254);

-- Disable RLS for admin access (these tables are admin-only)
ALTER TABLE public.notification_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries DISABLE ROW LEVEL SECURITY;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_deliveries;
