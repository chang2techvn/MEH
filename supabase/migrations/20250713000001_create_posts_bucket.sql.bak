-- Create posts bucket for community post media uploads
-- This bucket will store images and videos from Create Post feature

-- Create the posts bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts', 
  'posts',
  true, -- Public bucket for easy access
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/avi'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing policies for posts bucket
DROP POLICY IF EXISTS "Posts uploads are allowed" ON storage.objects;
DROP POLICY IF EXISTS "Posts are publicly viewable" ON storage.objects;  
DROP POLICY IF EXISTS "Posts can be updated" ON storage.objects;
DROP POLICY IF EXISTS "Posts can be deleted" ON storage.objects;

-- Policy 1: Allow anyone to upload to posts bucket
-- This is for community posts, so we allow public uploads
CREATE POLICY "Posts uploads are allowed" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts'
);

-- Policy 2: Allow public read access to all posts media
CREATE POLICY "Posts are publicly viewable" ON storage.objects
FOR SELECT USING (
  bucket_id = 'posts'
);

-- Policy 3: Allow updates to posts media
-- For now, allow anyone to update (can be restricted later)
CREATE POLICY "Posts can be updated" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posts'
);

-- Policy 4: Allow deletion of posts media
-- For now, allow anyone to delete (can be restricted later)
CREATE POLICY "Posts can be deleted" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts'
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
