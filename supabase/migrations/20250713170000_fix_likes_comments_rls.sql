-- Fix RLS policies for likes table to allow reactions functionality

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
DROP POLICY IF EXISTS "Users can update their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view likes (needed for displaying reactions)
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own likes
CREATE POLICY "Users can insert their own likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own likes (changing reaction type)
CREATE POLICY "Users can update their own likes" ON likes
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own likes (removing reactions)
CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Also ensure comments table has proper RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view comments
CREATE POLICY "Users can view all comments" ON comments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own comments
CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);
