-- Fix RLS policies for posts and profiles tables
-- Allow public access to read posts and profiles for community features

-- Fix posts table RLS policies
DROP POLICY IF EXISTS "Public can read posts" ON posts;
DROP POLICY IF EXISTS "Users can insert posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- Allow anyone to read public posts
CREATE POLICY "Public can read posts" ON posts
  FOR SELECT USING (is_public = true);

-- Allow authenticated users to insert posts
CREATE POLICY "Users can insert posts" ON posts
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Fix profiles table RLS policies
DROP POLICY IF EXISTS "Public can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert profile" ON profiles;

-- Allow anyone to read profiles (for community features)
CREATE POLICY "Public can read profiles" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert profile" ON profiles
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Ensure RLS is enabled on both tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE posts IS 'RLS enabled with public read access for community features';
COMMENT ON TABLE profiles IS 'RLS enabled with public read access for community features';
