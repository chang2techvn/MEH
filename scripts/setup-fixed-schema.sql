-- Fixed Complete Database Setup for English Learning Platform
-- Compatible with PostgreSQL 15+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  experience_points INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  student_id TEXT,
  account_status TEXT DEFAULT 'pending' CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  native_language TEXT DEFAULT 'Vietnamese',
  target_language TEXT DEFAULT 'English',
  proficiency_level TEXT DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  background_url TEXT,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  experience_points INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  completed_challenges INTEGER DEFAULT 0,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student', 'staff')),
  major TEXT,
  class_name TEXT,
  academic_year TEXT,
  student_id TEXT
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'audio')),
  media_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_evaluation JSONB,
  score INTEGER,
  original_video_id TEXT,
  user_image TEXT,
  username TEXT,
  thumbnail_url TEXT,
  media_urls JSONB DEFAULT '[]'
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB,
  points INTEGER DEFAULT 0,
  badge_type TEXT DEFAULT 'bronze' CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  key VARCHAR UNIQUE,
  category VARCHAR DEFAULT 'general',
  difficulty VARCHAR DEFAULT 'easy',
  requirement_type VARCHAR DEFAULT 'count',
  requirement_value INTEGER DEFAULT 1,
  requirement_data JSONB,
  badge_color VARCHAR DEFAULT 'bronze',
  is_hidden BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_assistants table
CREATE TABLE IF NOT EXISTS public.ai_assistants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar TEXT,
  model TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'education' CHECK (category IN ('education', 'practice', 'assessment', 'utility', 'business', 'entertainment', 'politics', 'literature', 'technology', 'science', 'arts', 'sports', 'lifestyle', 'culture')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  conversation_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  token_consumption BIGINT DEFAULT 0,
  personality_traits TEXT[] DEFAULT '{}',
  response_threshold NUMERIC DEFAULT 0.5,
  field TEXT DEFAULT 'General',
  role TEXT DEFAULT 'Assistant',
  experience TEXT DEFAULT 'Professional',
  tags TEXT[] DEFAULT '{}'
);

-- Create challenges table (unified daily videos + challenges)
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  embed_url TEXT,
  duration INTEGER CHECK (duration >= 0),
  topics TEXT[] DEFAULT '{}',
  transcript TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'daily' CHECK (challenge_type IN ('daily', 'practice', 'user_generated')),
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  user_id UUID REFERENCES auth.users(id),
  batch_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  required_watch_time INTEGER DEFAULT 180,
  transcript_start_time INTEGER DEFAULT 0,
  transcript_end_time INTEGER,
  transcript_version INTEGER DEFAULT 1,
  transcript_generated_at TIMESTAMP WITH TIME ZONE
);

-- Create challenge_submissions table
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  challenge_id UUID REFERENCES public.challenges(id),
  user_answer JSONB,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  time_taken INTEGER,
  ai_feedback JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  participants_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL DEFAULT 'direct'
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('admin', 'moderator', 'member', 'participant', 'guest', 'owner')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(conversation_id, user_id)
);

-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video')),
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.users(id),
  content TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  background_color TEXT DEFAULT '#000000',
  text_color TEXT DEFAULT '#ffffff',
  duration INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  text_elements JSONB DEFAULT '[]',
  media_transform JSONB,
  background_image TEXT,
  images JSONB DEFAULT '[]'
);

-- Create story_views table
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id),
  viewer_id UUID REFERENCES public.users(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reply_content TEXT,
  reaction_type TEXT CHECK (reaction_type IN ('❤️', '😍', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '💯')),
  interaction_type TEXT DEFAULT 'view' CHECK (interaction_type IN ('view', 'reply', 'reaction')),
  replied_at TIMESTAMP WITH TIME ZONE,
  reacted_at TIMESTAMP WITH TIME ZONE,
  reactions JSONB DEFAULT '[]',
  UNIQUE(story_id, viewer_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  online_link TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  event_type TEXT DEFAULT 'other' CHECK (event_type IN ('workshop', 'webinar', 'study_group', 'competition', 'social', 'other')),
  difficulty_level TEXT DEFAULT 'all' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')),
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'interested', 'not_attending', 'registered', 'attended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE(event_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id),
  user_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  post_id UUID REFERENCES public.posts(id),
  comment_id UUID REFERENCES public.comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reaction_type VARCHAR DEFAULT 'like',
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Create saved_posts table
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  post_id UUID REFERENCES public.posts(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('achievement', 'like', 'comment', 'follow', 'challenge', 'system', 'story_reply')),
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create natural_conversation_sessions table
CREATE TABLE IF NOT EXISTS public.natural_conversation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  title TEXT,
  conversation_mode TEXT DEFAULT 'natural_group' CHECK (conversation_mode IN ('natural_group', 'structured', 'mixed')),
  session_settings JSONB DEFAULT '{"response_timing": "natural", "allow_ai_questions": true, "max_ai_participants": 4, "topic_drift_allowed": true, "allow_ai_interruptions": true}',
  active_ai_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create natural_conversation_messages table
CREATE TABLE IF NOT EXISTS public.natural_conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.natural_conversation_sessions(id) NOT NULL,
  sender_id UUID REFERENCES public.users(id),
  ai_assistant_id UUID REFERENCES public.ai_assistants(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'ai_response', 'ai_question', 'ai_interaction', 'auto_ai_question', 'auto_ai_response')),
  response_type TEXT CHECK (response_type IN ('direct_answer', 'ai_to_ai_question', 'question_user', 'agreement', 'disagreement', 'interrupt', 'topic_shift', 'build_on_previous', 'natural_response')),
  conversation_intent TEXT CHECK (conversation_intent IN ('answer', 'clarify', 'engage', 'challenge', 'support', 'redirect')),
  interaction_type TEXT CHECK (interaction_type IN ('user_to_ai', 'ai_to_user', 'ai_to_ai', 'system', 'reply', 'ai_reply', 'auto_ai_to_ai', 'auto_ai_to_user')),
  target_ai_id UUID REFERENCES public.ai_assistants(id),
  vocabulary JSONB DEFAULT '[]',
  confidence_score NUMERIC,
  naturalness_score NUMERIC,
  processing_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reply_to_message_id UUID REFERENCES public.natural_conversation_messages(id),
  auto_interaction_metadata JSONB
);

-- Create auto_interaction_settings table
CREATE TABLE IF NOT EXISTS public.auto_interaction_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.natural_conversation_sessions(id) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  current_timeout_minutes INTEGER DEFAULT 2,
  last_user_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_auto_interaction TIMESTAMP WITH TIME ZONE,
  user_has_started_chat BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_goals table
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('vocabulary', 'grammar', 'speaking', 'listening', 'reading', 'writing')),
  target INTEGER NOT NULL DEFAULT 1,
  current INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'items',
  deadline DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create weekly_points table
CREATE TABLE IF NOT EXISTS public.weekly_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE,
  total_points INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  latest_post_points INTEGER DEFAULT 0,
  latest_post_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  achievement_id UUID REFERENCES public.achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- =====================================================
-- ADDITIONAL FEATURE TABLES
-- =====================================================

-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vocabulary_entries table
CREATE TABLE IF NOT EXISTS public.vocabulary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  term TEXT NOT NULL,
  meaning TEXT NOT NULL,
  pronunciation TEXT,
  definition TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT DEFAULT 'general',
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mastery_level INTEGER DEFAULT 1 CHECK (mastery_level >= 1 AND mastery_level <= 5),
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vocabulary_learning table
CREATE TABLE IF NOT EXISTS public.vocabulary_learning (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  session_id UUID REFERENCES public.natural_conversation_sessions(id),
  message_id UUID REFERENCES public.natural_conversation_messages(id),
  term TEXT NOT NULL,
  pronunciation TEXT,
  meaning TEXT NOT NULL,
  example TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  source_ai_id UUID REFERENCES public.ai_assistants(id),
  is_learned BOOLEAN DEFAULT FALSE,
  learning_count INTEGER DEFAULT 1,
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE RLS (Row Level Security)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natural_conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natural_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_interaction_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_learning ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE BASIC RLS POLICIES
-- =====================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Posts policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

-- AI assistants policies (public read)
DROP POLICY IF EXISTS "AI assistants are viewable by everyone" ON public.ai_assistants;
CREATE POLICY "AI assistants are viewable by everyone" ON public.ai_assistants
    FOR SELECT USING (TRUE);

-- Challenges policies (public read)
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON public.challenges;
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges
    FOR SELECT USING (TRUE);

-- Events policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (TRUE);

-- Basic policies for other tables
DROP POLICY IF EXISTS "Users can access their own data" ON public.challenge_submissions;
CREATE POLICY "Users can access their own data" ON public.challenge_submissions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access their own data" ON public.notifications;
CREATE POLICY "Users can access their own data" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access their own data" ON public.learning_goals;
CREATE POLICY "Users can access their own data" ON public.learning_goals
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access their own data" ON public.weekly_points;
CREATE POLICY "Users can access their own data" ON public.weekly_points
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- CREATE ESSENTIAL FUNCTIONS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table
    INSERT INTO public.users (id, email, name, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NOW()
    );
    
    -- Insert into profiles table
    INSERT INTO public.profiles (user_id, username, full_name, avatar_url, created_at)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the trigger
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('posts', 'posts', TRUE),
    ('stories', 'stories', TRUE),
    ('ai-assistant-avatars', 'ai-assistant-avatars', TRUE),
    ('profiles', 'profiles', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for posts bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
    FOR SELECT USING (bucket_id IN ('posts', 'stories', 'ai-assistant-avatars', 'profiles'));

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id IN ('posts', 'stories', 'profiles') AND auth.role() = 'authenticated');

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

-- Enable realtime for essential tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.natural_conversation_messages;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default AI assistants
INSERT INTO public.ai_assistants (name, description, category, system_prompt, model) VALUES
('Emma - Grammar Expert', 'Your friendly grammar specialist who helps with English grammar rules and corrections', 'education', 'You are Emma, a patient English grammar expert who loves helping students improve their grammar skills. Always provide clear explanations and examples.', 'gpt-4'),
('Alex - Conversation Partner', 'Practice natural conversations and improve your speaking skills', 'practice', 'You are Alex, a friendly conversation partner who helps students practice natural English conversations. Keep conversations engaging and natural.', 'gpt-4'),
('Sophie - Vocabulary Builder', 'Expand your vocabulary with new words and expressions', 'education', 'You are Sophie, an enthusiastic vocabulary expert who makes learning new words fun and memorable. Always provide examples and context.', 'gpt-4')
ON CONFLICT DO NOTHING;

-- Insert default achievements
INSERT INTO public.achievements (title, description, key, category, points, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first challenge', 'first_challenge', 'general', 10, 'count', 1),
('Social Butterfly', 'Make your first post', 'first_post', 'social', 5, 'count', 1),
('Streak Master', 'Maintain a 7-day streak', 'week_streak', 'consistency', 50, 'streak', 7),
('Vocabulary Explorer', 'Learn 50 new words', 'vocabulary_50', 'learning', 25, 'count', 50)
ON CONFLICT (key) DO NOTHING;

COMMIT;
