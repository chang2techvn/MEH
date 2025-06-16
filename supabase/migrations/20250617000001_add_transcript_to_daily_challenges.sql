-- Add transcript column to daily_challenges table
ALTER TABLE daily_challenges ADD COLUMN transcript TEXT;

-- Add index for text search on transcript if needed
CREATE INDEX idx_daily_challenges_transcript ON daily_challenges USING gin(to_tsvector('english', transcript)) WHERE transcript IS NOT NULL;

-- Update RLS policies to include transcript in select
-- (policies already allow reading all columns, so no change needed)

-- Update RLS policies to include transcript in select
DROP POLICY IF EXISTS "Anyone can read daily videos" ON daily_challenges;
CREATE POLICY "Anyone can read daily videos" ON daily_challenges
  FOR SELECT USING (true);
