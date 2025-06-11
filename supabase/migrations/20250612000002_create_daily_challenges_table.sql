-- Create daily_challenges table for storing 10 daily challenge videos
CREATE TABLE daily_challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  embed_url TEXT,
  duration INTEGER,
  topics TEXT[],
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  featured BOOLEAN DEFAULT false,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast date and difficulty lookups
CREATE INDEX idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX idx_daily_challenges_difficulty ON daily_challenges(difficulty);
CREATE INDEX idx_daily_challenges_date_difficulty ON daily_challenges(date, difficulty);

-- RLS policies
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Allow all users to read daily challenges
CREATE POLICY "Anyone can read daily challenges" ON daily_challenges
  FOR SELECT USING (true);

-- Only service role can insert/update daily challenges
CREATE POLICY "Service role can manage daily challenges" ON daily_challenges
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger to automatically update updated_at
CREATE TRIGGER update_daily_challenges_updated_at
  BEFORE UPDATE ON daily_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
