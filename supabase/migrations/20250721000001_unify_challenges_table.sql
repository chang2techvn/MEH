-- Migration to unify all challenge types into a single challenges table
-- This replaces daily_videos, daily_challenges, and user_challenges with a unified approach

-- First, create the new unified challenges table with the exact schema from Supabase cloud
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NULL,
  video_url text NOT NULL,
  thumbnail_url text NULL,
  embed_url text NULL,
  duration integer NULL,
  topics text[] NULL,
  transcript text NULL,
  challenge_type text NOT NULL DEFAULT 'daily'::text,
  difficulty text NOT NULL DEFAULT 'intermediate'::text,
  points integer NOT NULL DEFAULT 10,
  user_id uuid NULL,
  batch_id text NULL,
  is_active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT challenges_challenge_type_check CHECK (
    challenge_type = ANY (ARRAY['daily'::text, 'practice'::text, 'user_generated'::text])
  ),
  CONSTRAINT challenges_difficulty_check CHECK (
    difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])
  ),
  CONSTRAINT challenges_duration_check CHECK (duration >= 0),
  CONSTRAINT challenges_points_check CHECK (points >= 0)
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_challenges_date ON public.challenges USING btree (date);
CREATE INDEX IF NOT EXISTS idx_challenges_challenge_type ON public.challenges USING btree (challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON public.challenges USING btree (difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON public.challenges USING btree (user_id) WHERE (user_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges USING btree (is_active) WHERE (is_active = true);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON public.challenges USING btree (featured) WHERE (featured = true);
CREATE INDEX IF NOT EXISTS idx_challenges_batch_id ON public.challenges USING btree (batch_id) WHERE (batch_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_challenges_type_difficulty ON public.challenges USING btree (challenge_type, difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_date_type_active ON public.challenges USING btree (date, challenge_type, is_active);

-- Full-text search index for transcript
CREATE INDEX IF NOT EXISTS idx_challenges_transcript_search ON public.challenges USING gin (
  to_tsvector('english'::regconfig, COALESCE(transcript, ''::text))
) WHERE (transcript IS NOT NULL);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS challenges_daily_unique_idx ON public.challenges USING btree (date, challenge_type) 
WHERE (challenge_type = 'daily'::text);

CREATE UNIQUE INDEX IF NOT EXISTS challenges_practice_video_unique_idx ON public.challenges USING btree (date, challenge_type, video_url) 
WHERE (challenge_type = ANY (ARRAY['practice'::text, 'user_generated'::text]));

-- Drop old views if they exist
DROP VIEW IF EXISTS practice_challenges_view CASCADE;
DROP VIEW IF EXISTS user_challenges_view CASCADE;

-- No data migration needed since old tables have been dropped

-- Create functions for automatic batch_id and updated_at
CREATE OR REPLACE FUNCTION set_challenges_batch_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Set batch_id for practice challenges if not provided
  IF NEW.challenge_type = 'practice' AND (NEW.batch_id IS NULL OR NEW.batch_id = '') THEN
    NEW.batch_id := 'practice_' || NEW.date::text || '_batch';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS challenges_batch_id_trigger ON challenges;
CREATE TRIGGER challenges_batch_id_trigger 
  BEFORE INSERT OR UPDATE ON challenges 
  FOR EACH ROW EXECUTE FUNCTION set_challenges_batch_id();

DROP TRIGGER IF EXISTS challenges_updated_at_trigger ON challenges;
CREATE TRIGGER challenges_updated_at_trigger 
  BEFORE UPDATE ON challenges 
  FOR EACH ROW EXECUTE FUNCTION update_challenges_updated_at();

-- Enable Row Level Security
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can read their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can create their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Service role can manage all challenges" ON public.challenges;

-- Create RLS policies
CREATE POLICY "Anyone can read active challenges" ON public.challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can read their own challenges" ON public.challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id AND challenge_type = 'user_generated');

CREATE POLICY "Users can update their own challenges" ON public.challenges
  FOR UPDATE USING (auth.uid() = user_id AND challenge_type = 'user_generated');

CREATE POLICY "Service role can manage all challenges" ON public.challenges
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Migration completed successfully
-- Old tables and views have been dropped manually
-- The unified challenges table is now ready for use
