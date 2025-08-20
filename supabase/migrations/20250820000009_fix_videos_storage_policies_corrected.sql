-- Fix storage policies for videos bucket - corrected version
-- Remove existing policies
DROP POLICY IF EXISTS "videos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_delete_policy" ON storage.objects;

-- Create corrected policies for videos bucket
-- Allow public read access to videos
CREATE POLICY "videos_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos to their own folder
CREATE POLICY "videos_insert_policy" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own videos
CREATE POLICY "videos_update_policy" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own videos
CREATE POLICY "videos_delete_policy" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Success notice
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Videos bucket storage policies fixed with correct syntax';
END $$;
