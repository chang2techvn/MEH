-- Fix storage policies for videos bucket - Final version
-- Drop all existing policies
DROP POLICY IF EXISTS "videos_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "videos_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "videos_bucket_update" ON storage.objects;
DROP POLICY IF EXISTS "videos_bucket_delete" ON storage.objects;
DROP POLICY IF EXISTS "videos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_delete_policy" ON storage.objects;

-- Create new storage policies for videos bucket
-- Allow public read access
CREATE POLICY "videos_bucket_select" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'videos');

-- Allow authenticated users to upload to their own folder
CREATE POLICY "videos_bucket_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own files
CREATE POLICY "videos_bucket_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own files
CREATE POLICY "videos_bucket_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Ensure the videos bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Success notice
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Videos bucket and storage policies created successfully';
END $$;
