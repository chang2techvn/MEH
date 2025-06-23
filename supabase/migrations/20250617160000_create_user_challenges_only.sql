-- Create user_challenges table (separate from existing challenges table)
-- This table stores video challenges created by users from YouTube videos

CREATE TABLE IF NOT EXISTS public.user_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    challenge_type TEXT DEFAULT 'listening' CHECK (challenge_type IN ('vocabulary', 'grammar', 'speaking', 'listening', 'writing', 'reading')),
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    content JSONB, -- Video data: videoUrl, embedUrl, thumbnailUrl, duration, topics, transcript, etc.
    points INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_created_at ON public.user_challenges(created_at);
CREATE INDEX IF NOT EXISTS idx_user_challenges_difficulty ON public.user_challenges(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_user_challenges_active ON public.user_challenges(is_active);

-- Enable Row Level Security
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view all user challenges" ON public.user_challenges;
CREATE POLICY "Users can view all user challenges" ON public.user_challenges
    FOR SELECT USING (true); -- Anyone can view challenges

DROP POLICY IF EXISTS "Users can create their own challenges" ON public.user_challenges;
CREATE POLICY "Users can create their own challenges" ON public.user_challenges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own challenges" ON public.user_challenges;
CREATE POLICY "Users can update their own challenges" ON public.user_challenges
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own challenges" ON public.user_challenges;
CREATE POLICY "Users can delete their own challenges" ON public.user_challenges
    FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_challenges_updated_at ON public.user_challenges;
CREATE TRIGGER update_user_challenges_updated_at
    BEFORE UPDATE ON public.user_challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
