-- Grant permissions to service role for daily_videos table
-- This ensures the service role can insert daily videos

-- Grant all permissions to service_role
GRANT ALL ON TABLE daily_videos TO service_role;

-- Grant usage on the sequence if it exists
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions to anon role as well for testing
GRANT SELECT, INSERT ON TABLE daily_videos TO anon;

-- Double check: ensure RLS is disabled
ALTER TABLE daily_videos DISABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE daily_videos IS 'Permissions granted to service_role and anon for automatic video fetching';
