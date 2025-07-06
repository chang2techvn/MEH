-- Grant basic permissions to anon and authenticated roles
-- This is critical for public access to work

-- Grant usage on public schema to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select permissions on posts table to anon (for reading public posts)
GRANT SELECT ON TABLE posts TO anon;
GRANT SELECT ON TABLE posts TO authenticated;

-- Grant select permissions on profiles table to anon (for community features)
GRANT SELECT ON TABLE profiles TO anon;
GRANT SELECT ON TABLE profiles TO authenticated;

-- Grant all permissions to authenticated users for posts
GRANT INSERT, UPDATE, DELETE ON TABLE posts TO authenticated;

-- Grant all permissions to authenticated users for profiles
GRANT INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;

-- Grant permissions on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comment
COMMENT ON SCHEMA public IS 'Basic permissions granted to anon and authenticated roles';
