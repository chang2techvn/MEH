-- Fix permissions for daily_challenges table
-- Grant service role access to daily_challenges

-- Disable RLS for daily_challenges (for automatic challenge creation)
ALTER TABLE daily_challenges DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role can manage daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "Public can read daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "Allow anonymous insert for testing" ON daily_challenges;

-- Grant all permissions to service_role
GRANT ALL ON daily_challenges TO service_role;

-- Grant permissions to authenticated users
GRANT SELECT ON daily_challenges TO authenticated;
GRANT SELECT ON daily_challenges TO anon;

-- Add comment
COMMENT ON TABLE daily_challenges IS 'Permissions granted to service_role for automatic challenge creation';
