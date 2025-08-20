-- Create videos bucket for video uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for videos bucket
CREATE POLICY "Videos bucket: authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Videos bucket: public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'videos');

CREATE POLICY "Videos bucket: users can update their own videos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Videos bucket: users can delete their own videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Success notice
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Videos bucket created with proper policies';
END $$;
