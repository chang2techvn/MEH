-- Add transcript column to daily_videos table
ALTER TABLE daily_videos ADD COLUMN transcript TEXT;

-- Add index for text search on transcript if needed
CREATE INDEX idx_daily_videos_transcript ON daily_videos USING gin(to_tsvector('english', transcript)) WHERE transcript IS NOT NULL;

-- Update RLS policies to include transcript in select
DROP POLICY IF EXISTS "Anyone can read daily videos" ON daily_videos;
CREATE POLICY "Anyone can read daily videos" ON daily_videos
  FOR SELECT USING (true);
