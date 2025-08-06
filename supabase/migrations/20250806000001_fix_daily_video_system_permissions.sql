-- Fix Topics Table Permissions and Daily Video System Issues
-- Migration: 20250806000001_fix_daily_video_system_permissions.sql

-- 1. Fix Topics Table Permissions
-- Grant necessary permissions for topics table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.topics TO authenticated;
GRANT ALL ON public.topics TO service_role;

-- Create RLS policies for topics if they don't exist
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Topics are viewable by everyone" ON public.topics;
    DROP POLICY IF EXISTS "Topics can be managed by service role" ON public.topics;
    DROP POLICY IF EXISTS "Authenticated users can view topics" ON public.topics;
    
    -- Create new policies
    CREATE POLICY "Topics are viewable by everyone" 
        ON public.topics FOR SELECT 
        USING (true);
    
    CREATE POLICY "Topics can be managed by service role" 
        ON public.topics FOR ALL 
        USING (auth.jwt() ->> 'role' = 'service_role');
        
    CREATE POLICY "Authenticated users can view topics" 
        ON public.topics FOR SELECT 
        TO authenticated 
        USING (true);
        
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating topics policies: %', SQLERRM;
END $$;

-- Enable RLS on topics table
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- 2. Ensure Daily Video Settings table exists and has proper permissions
CREATE TABLE IF NOT EXISTS public.daily_video_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auto_fetch_enabled boolean DEFAULT true,
    schedule_time time DEFAULT '23:59:00',
    timezone text DEFAULT 'Asia/Ho_Chi_Minh',
    default_watch_time integer DEFAULT 180,
    min_watch_time integer DEFAULT 60,
    max_watch_time integer DEFAULT 600,
    topic_selection_mode text DEFAULT 'random',
    preferred_topics uuid[] DEFAULT NULL,
    avoid_recent_topics boolean DEFAULT true,
    topic_rotation_days integer DEFAULT 7,
    transcript_extraction_mode text DEFAULT 'beginning',
    require_transcript boolean DEFAULT true,
    custom_topics_enabled boolean DEFAULT false,
    topic_ids uuid[] DEFAULT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT daily_video_settings_topic_selection_mode_check 
        CHECK (topic_selection_mode IN ('random', 'sequential', 'weighted')),
    CONSTRAINT daily_video_settings_transcript_extraction_mode_check 
        CHECK (transcript_extraction_mode IN ('beginning', 'middle', 'custom', 'full'))
);

-- Grant permissions for daily_video_settings
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_video_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_video_settings TO authenticated;
GRANT ALL ON public.daily_video_settings TO service_role;

-- RLS policies for daily_video_settings
ALTER TABLE public.daily_video_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Daily video settings viewable by everyone" ON public.daily_video_settings;
DROP POLICY IF EXISTS "Daily video settings manageable by service role" ON public.daily_video_settings;

CREATE POLICY "Daily video settings viewable by everyone" 
    ON public.daily_video_settings FOR SELECT 
    USING (true);

CREATE POLICY "Daily video settings manageable by service role" 
    ON public.daily_video_settings FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. Insert default topics if table is empty
INSERT INTO public.topics (name, description, category, keywords, is_active, weight)
SELECT * FROM (VALUES
    ('English Learning', 'General English language learning content', 'education', ARRAY['english', 'learning', 'language'], true, 5),
    ('Business English', 'Professional and business communication', 'business', ARRAY['business', 'professional', 'work'], true, 4),
    ('Grammar', 'English grammar rules and explanations', 'education', ARRAY['grammar', 'rules', 'structure'], true, 4),
    ('Vocabulary', 'Word learning and expansion', 'education', ARRAY['vocabulary', 'words', 'meaning'], true, 5),
    ('Pronunciation', 'Speaking and pronunciation guides', 'education', ARRAY['pronunciation', 'speaking', 'accent'], true, 3),
    ('Conversation', 'Daily conversation and dialogue practice', 'social', ARRAY['conversation', 'dialogue', 'chat'], true, 4),
    ('Technology', 'Tech-related English content', 'technology', ARRAY['technology', 'tech', 'innovation'], true, 3),
    ('Science', 'Science and research topics', 'science', ARRAY['science', 'research', 'discovery'], true, 3),
    ('Art', 'Art, culture, and creative content', 'culture', ARRAY['art', 'culture', 'creative'], true, 2),
    ('Travel', 'Travel and adventure content', 'lifestyle', ARRAY['travel', 'adventure', 'places'], true, 2)
) AS t(name, description, category, keywords, is_active, weight)
WHERE NOT EXISTS (SELECT 1 FROM public.topics LIMIT 1);

-- 4. Insert default daily video settings if table is empty
INSERT INTO public.daily_video_settings (
    auto_fetch_enabled,
    schedule_time,
    timezone,
    default_watch_time,
    min_watch_time,
    max_watch_time,
    topic_selection_mode,
    avoid_recent_topics,
    topic_rotation_days,
    transcript_extraction_mode,
    require_transcript,
    custom_topics_enabled
)
SELECT 
    true,
    '23:59:00'::time,
    'Asia/Ho_Chi_Minh',
    180,
    60,
    600,
    'random',
    true,
    7,
    'beginning',
    true,
    false
WHERE NOT EXISTS (SELECT 1 FROM public.daily_video_settings LIMIT 1);

-- 5. Create updated_at trigger for daily_video_settings
CREATE OR REPLACE FUNCTION update_daily_video_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS daily_video_settings_updated_at_trigger ON public.daily_video_settings;
CREATE TRIGGER daily_video_settings_updated_at_trigger
    BEFORE UPDATE ON public.daily_video_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_video_settings_updated_at();

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_active_weight ON public.topics (is_active, weight) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics (category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_daily_video_settings_enabled ON public.daily_video_settings (auto_fetch_enabled) WHERE auto_fetch_enabled = true;

-- 7. Update challenges table to ensure proper indexing for daily video system
-- Ensure indexes exist for daily video queries
CREATE INDEX IF NOT EXISTS idx_challenges_daily_video_queries ON public.challenges (challenge_type, date, is_active) 
    WHERE challenge_type = 'daily' AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_challenges_practice_video_queries ON public.challenges (challenge_type, date, difficulty, is_active) 
    WHERE challenge_type = 'practice' AND is_active = true;

-- 8. Grant storage permissions for video thumbnails and media
-- Note: This would typically be done in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('video-thumbnails', 'video-thumbnails', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('daily-videos', 'daily-videos', true) ON CONFLICT DO NOTHING;

COMMIT;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Daily Video System permissions and setup completed successfully!';
    RAISE NOTICE 'Topics table: % records', (SELECT count(*) FROM public.topics);
    RAISE NOTICE 'Daily video settings: % records', (SELECT count(*) FROM public.daily_video_settings);
    RAISE NOTICE 'Challenges table indexes: optimized for daily video queries';
END $$;
