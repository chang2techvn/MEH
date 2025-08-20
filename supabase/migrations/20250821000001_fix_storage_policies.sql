-- Fix storage RLS policy for videos bucket - simplified version
-- Only create/update policies, don't modify table structure

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload videos to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view videos in their own folder" ON storage.objects; 
DROP POLICY IF EXISTS "Users can delete videos from their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to videos bucket" ON storage.objects;

-- Create policies using split_part function instead of storage.foldername()
-- This should work more reliably to extract user ID from path

-- Policy for INSERT (upload) - users can only upload to their own folder
CREATE POLICY "Users can upload videos to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND
  split_part(name, '/', 1) = auth.uid()::text
);

-- Policy for SELECT (view/download) - users can view their own videos
CREATE POLICY "Users can view videos in their own folder" ON storage.objects
FOR SELECT USING (
  bucket_id = 'videos' AND
  split_part(name, '/', 1) = auth.uid()::text
);

-- Policy for DELETE - users can delete their own videos
CREATE POLICY "Users can delete videos from their own folder" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' AND
  split_part(name, '/', 1) = auth.uid()::text
);

-- Public access policy for viewing (but RLS still controls upload)
CREATE POLICY "Public read access to videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Ensure videos bucket exists with public access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'videos', 
  'videos', 
  true, 
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm']
) 
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
