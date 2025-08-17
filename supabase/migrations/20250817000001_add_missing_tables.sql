-- Add missing tables from old schema
-- Run: npx supabase db push --password 0397571231Aa

-- Create ai_relationship_matrix table
CREATE TABLE IF NOT EXISTS public.ai_relationship_matrix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ai1_id UUID REFERENCES public.ai_assistants(id) NOT NULL,
  ai2_id UUID REFERENCES public.ai_assistants(id) NOT NULL,
  interaction_count INTEGER DEFAULT 0,
  agreement_ratio NUMERIC DEFAULT 0.5,
  collaboration_score NUMERIC DEFAULT 0.5,
  topic_overlap NUMERIC DEFAULT 0.0,
  communication_style TEXT DEFAULT 'neutral',
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_video_settings table
CREATE TABLE IF NOT EXISTS public.daily_video_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_fetch_enabled BOOLEAN DEFAULT TRUE,
  schedule_time TIME WITHOUT TIME ZONE DEFAULT '06:00:00',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  default_watch_time INTEGER DEFAULT 180,
  min_watch_time INTEGER DEFAULT 60,
  max_watch_time INTEGER DEFAULT 600,
  topic_selection_mode TEXT DEFAULT 'random' CHECK (topic_selection_mode IN ('random', 'sequential', 'weighted')),
  preferred_topics TEXT[] DEFAULT '{}',
  avoid_recent_topics BOOLEAN DEFAULT TRUE,
  topic_rotation_days INTEGER DEFAULT 7,
  transcript_extraction_mode TEXT DEFAULT 'beginning' CHECK (transcript_extraction_mode IN ('beginning', 'middle', 'custom', 'full')),
  require_transcript BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  custom_topics_enabled BOOLEAN DEFAULT FALSE,
  topic_ids TEXT[] DEFAULT '{}'
);

-- Create learning_progress table
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  goal_id UUID REFERENCES public.learning_goals(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('vocabulary_learned', 'grammar_practice', 'speaking_session', 'listening_exercise', 'reading_comprehension', 'writing_practice')),
  activity_data JSONB DEFAULT '{}',
  progress_value INTEGER NOT NULL DEFAULT 1,
  session_duration INTEGER,
  accuracy_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create messages table (simple direct messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id),
  receiver_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'file')),
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_deliveries table
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id),
  user_id UUID REFERENCES public.users(id),
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT DEFAULT 'delivered' CHECK (delivery_status IN ('delivered', 'failed', 'bounced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'push', 'system')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_settings table
CREATE TABLE IF NOT EXISTS public.practice_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_count INTEGER DEFAULT 15 CHECK (display_count >= 1 AND display_count <= 50),
  selection_mode TEXT DEFAULT 'latest' CHECK (selection_mode IN ('latest', 'random', 'featured', 'manual')),
  auto_generation_enabled BOOLEAN DEFAULT TRUE,
  daily_generation_count INTEGER DEFAULT 3 CHECK (daily_generation_count >= 1 AND daily_generation_count <= 10),
  daily_generation_time TIME WITHOUT TIME ZONE DEFAULT '23:59:00',
  difficulty_distribution JSONB DEFAULT '{"advanced": 1, "beginner": 1, "intermediate": 1}',
  avoid_recent_days INTEGER DEFAULT 7 CHECK (avoid_recent_days >= 0 AND avoid_recent_days <= 30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled_messages table
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('email', 'push', 'system')),
  template_id UUID REFERENCES public.notification_templates(id),
  recipient_filter JSONB,
  recipient_count INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  recurring_pattern TEXT CHECK (recurring_pattern IN ('none', 'daily', 'weekly', 'monthly')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (length(name) >= 2),
  description TEXT,
  category TEXT DEFAULT 'general',
  keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  weight INTEGER DEFAULT 1 CHECK (weight >= 0 AND weight <= 10),
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_topics table
CREATE TABLE IF NOT EXISTS public.video_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  keywords TEXT[] NOT NULL,
  description TEXT,
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  last_used_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.ai_relationship_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_video_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_topics ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for new tables

-- AI relationship matrix (admin only)
CREATE POLICY "Admin can manage AI relationships" ON public.ai_relationship_matrix
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Daily video settings (admin only)
CREATE POLICY "Admin can manage video settings" ON public.daily_video_settings
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Learning progress (users can see their own)
CREATE POLICY "Users can access their own learning progress" ON public.learning_progress
    FOR ALL USING (auth.uid() = user_id);

-- Messages (users can see their own messages)
CREATE POLICY "Users can see their own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Topics and video topics (public read)
CREATE POLICY "Topics are viewable by everyone" ON public.topics
    FOR SELECT USING (TRUE);

CREATE POLICY "Video topics are viewable by everyone" ON public.video_topics
    FOR SELECT USING (TRUE);

-- Notification templates (public read)
CREATE POLICY "Notification templates are viewable by everyone" ON public.notification_templates
    FOR SELECT USING (TRUE);

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Add updated_at triggers for new tables
CREATE TRIGGER update_ai_relationship_matrix_updated_at 
    BEFORE UPDATE ON public.ai_relationship_matrix
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_video_settings_updated_at 
    BEFORE UPDATE ON public.daily_video_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at 
    BEFORE UPDATE ON public.notification_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practice_settings_updated_at 
    BEFORE UPDATE ON public.practice_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_messages_updated_at 
    BEFORE UPDATE ON public.scheduled_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_topics_updated_at 
    BEFORE UPDATE ON public.topics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_topics_updated_at 
    BEFORE UPDATE ON public.video_topics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
