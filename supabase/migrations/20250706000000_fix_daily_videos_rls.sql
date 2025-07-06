-- Fix RLS policies for daily_videos table
-- Allow service role to manage daily videos (for automatic video fetching)
-- Allow public access for reading (for displaying videos)

-- Drop all existing policies first
DROP POLICY IF EXISTS "Service role can manage daily videos" ON daily_videos;
DROP POLICY IF EXISTS "Authenticated users can insert daily videos" ON daily_videos;
DROP POLICY IF EXISTS "Authenticated users can update daily videos" ON daily_videos;
DROP POLICY IF EXISTS "Anyone can read daily videos" ON daily_videos;

-- Allow service role to do everything (for automatic video fetching system)
CREATE POLICY "Service role can manage daily videos" ON daily_videos
  FOR ALL USING (auth.role() = 'service_role');

-- Allow public read access (so users can view daily videos)
CREATE POLICY "Public can read daily videos" ON daily_videos
  FOR SELECT USING (true);

-- For testing: temporarily allow anonymous inserts (remove this in production)
CREATE POLICY "Allow anonymous insert for testing" ON daily_videos
  FOR INSERT WITH CHECK (true);
