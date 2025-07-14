-- Fix RLS policies for saved_posts table (retry)
-- File: supabase/migrations/20250714000003_fix_saved_posts_rls_retry.sql

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own saved posts" ON saved_posts;
DROP POLICY IF EXISTS "Users can save posts" ON saved_posts;
DROP POLICY IF EXISTS "Users can unsave their posts" ON saved_posts;
DROP POLICY IF EXISTS "saved_posts_select_policy" ON saved_posts;
DROP POLICY IF EXISTS "saved_posts_insert_policy" ON saved_posts;
DROP POLICY IF EXISTS "saved_posts_delete_policy" ON saved_posts;

-- Recreate policies with proper permissions
CREATE POLICY "saved_posts_select_policy" ON saved_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_posts_insert_policy" ON saved_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_posts_delete_policy" ON saved_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Make sure RLS is enabled
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON saved_posts TO authenticated;
