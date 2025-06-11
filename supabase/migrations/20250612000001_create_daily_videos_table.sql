-- Create daily_videos table for storing daily challenge videos
CREATE TABLE daily_videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  embed_url TEXT,
  duration INTEGER,
  topics TEXT[],
  date DATE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast date lookups
CREATE INDEX idx_daily_videos_date ON daily_videos(date);

-- RLS policies
ALTER TABLE daily_videos ENABLE ROW LEVEL SECURITY;

-- Allow all users to read daily videos
CREATE POLICY "Anyone can read daily videos" ON daily_videos
  FOR SELECT USING (true);

-- Only service role can insert/update daily videos
CREATE POLICY "Service role can manage daily videos" ON daily_videos
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_daily_videos_updated_at
  BEFORE UPDATE ON daily_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
