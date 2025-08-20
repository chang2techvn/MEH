-- Fix RLS policies for likes table (final)
-- Drop ALL existing policies completely
DO $$ 
BEGIN
  -- Drop all existing policies for likes table
  DROP POLICY IF EXISTS "Users can insert their own likes" ON public.likes;
  DROP POLICY IF EXISTS "Users can view all likes" ON public.likes;
  DROP POLICY IF EXISTS "Users can update their own likes" ON public.likes;
  DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
  
  -- Drop any other variations
  DROP POLICY IF EXISTS "likes_insert_policy" ON public.likes;
  DROP POLICY IF EXISTS "likes_select_policy" ON public.likes;
  DROP POLICY IF EXISTS "likes_update_policy" ON public.likes;
  DROP POLICY IF EXISTS "likes_delete_policy" ON public.likes;
  
  -- Drop policies without schema prefix
  DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
  DROP POLICY IF EXISTS "Users can view all likes" ON likes;
  DROP POLICY IF EXISTS "Users can update their own likes" ON likes;
  DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

-- Create new RLS policies for likes table with unique names
CREATE POLICY "likes_auth_insert" ON public.likes
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_auth_select" ON public.likes
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "likes_auth_update" ON public.likes
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_auth_delete" ON public.likes
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
