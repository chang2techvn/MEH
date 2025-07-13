-- Fix RLS policies for likes and comments tables
-- Drop existing policies and recreate them properly

-- Drop existing policies for likes table
DROP POLICY IF EXISTS "likes_select_policy" ON "public"."likes";
DROP POLICY IF EXISTS "likes_insert_policy" ON "public"."likes";
DROP POLICY IF EXISTS "likes_update_policy" ON "public"."likes";
DROP POLICY IF EXISTS "likes_delete_policy" ON "public"."likes";

-- Drop existing policies for comments table
DROP POLICY IF EXISTS "comments_select_policy" ON "public"."comments";
DROP POLICY IF EXISTS "comments_insert_policy" ON "public"."comments";
DROP POLICY IF EXISTS "comments_update_policy" ON "public"."comments";
DROP POLICY IF EXISTS "comments_delete_policy" ON "public"."comments";

-- Enable RLS
ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

-- Create new policies for likes table
CREATE POLICY "likes_select_all" ON "public"."likes"
FOR SELECT USING (true);

CREATE POLICY "likes_insert_authenticated" ON "public"."likes"
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

CREATE POLICY "likes_update_own" ON "public"."likes"
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

CREATE POLICY "likes_delete_own" ON "public"."likes"
FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

-- Create new policies for comments table
CREATE POLICY "comments_select_all" ON "public"."comments"
FOR SELECT USING (true);

CREATE POLICY "comments_insert_authenticated" ON "public"."comments"
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

CREATE POLICY "comments_update_own" ON "public"."comments"
FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

CREATE POLICY "comments_delete_own" ON "public"."comments"
FOR DELETE USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

-- Grant necessary permissions
GRANT ALL ON "public"."likes" TO authenticated;
GRANT ALL ON "public"."comments" TO authenticated;
