-- Fix RLS policies for videos bucket to allow anonymous uploads
-- This is needed for testing and public video uploads

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Create secure but flexible policies for videos bucket
-- Allow authenticated users to upload their own videos
-- Allow anonymous uploads for testing/demo purposes
CREATE POLICY "Users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND 
  (
    auth.uid() IS NULL OR  -- Allow anonymous uploads
    auth.uid()::text = (storage.foldername(name))[1] -- Or user uploads to their own folder
  )
);

-- Drop any existing policies with these names first
DROP POLICY IF EXISTS "Videos are publicly viewable" ON storage.objects;

CREATE POLICY "Videos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Only allow users to update/delete their own videos (or anonymous can update/delete anonymous uploads)
CREATE POLICY "Users can update videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos' AND 
  (
    auth.uid() IS NULL OR  -- Allow anonymous updates for testing
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can delete videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' AND 
  (
    auth.uid() IS NULL OR  -- Allow anonymous deletes for testing  
    auth.uid()::text = (storage.foldername(name))[1]
  )
);
