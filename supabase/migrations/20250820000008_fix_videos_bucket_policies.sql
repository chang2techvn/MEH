-- Fix RLS policies for videos bucket
-- Remove existing policies if any
DROP POLICY IF EXISTS "videos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_delete_policy" ON storage.objects;

-- Create proper policies for videos bucket
-- Allow public read access to videos
CREATE POLICY "videos_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "videos_insert_policy" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own videos
CREATE POLICY "videos_update_policy" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own videos
CREATE POLICY "videos_delete_policy" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Success notice
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Videos bucket RLS policies fixed';
END $$;
