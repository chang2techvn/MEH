-- Create stories bucket for storing story media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for stories bucket
CREATE POLICY "Stories are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'stories');

CREATE POLICY "Users can upload their own story files" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'stories' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own story files" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'stories' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own story files" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'stories' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
