-- Create storage bucket for AI assistant avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-assistant-avatars',
  'ai-assistant-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create RLS policy for ai-assistant-avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ai-assistant-avatars');

CREATE POLICY "Users can upload their own avatar images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ai-assistant-avatars' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own avatar images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'ai-assistant-avatars' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own avatar images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ai-assistant-avatars' AND
    auth.role() = 'authenticated'
  );

-- Function to automatically clean up old avatar images when assistant is deleted or avatar is changed
CREATE OR REPLACE FUNCTION cleanup_ai_assistant_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- If assistant is being deleted, clean up avatar
  IF TG_OP = 'DELETE' THEN
    IF OLD.avatar IS NOT NULL AND OLD.avatar != '' THEN
      -- Extract file path from URL
      DECLARE
        file_path TEXT;
      BEGIN
        file_path := SUBSTRING(OLD.avatar FROM '/storage/v1/object/public/ai-assistant-avatars/(.*)');
        IF file_path IS NOT NULL THEN
          DELETE FROM storage.objects 
          WHERE bucket_id = 'ai-assistant-avatars' 
          AND name = file_path;
        END IF;
      END;
    END IF;
    RETURN OLD;
  END IF;

  -- If avatar is being updated, clean up old avatar
  IF TG_OP = 'UPDATE' THEN
    IF OLD.avatar IS NOT NULL AND OLD.avatar != '' 
       AND OLD.avatar != NEW.avatar THEN
      -- Extract file path from URL
      DECLARE
        file_path TEXT;
      BEGIN
        file_path := SUBSTRING(OLD.avatar FROM '/storage/v1/object/public/ai-assistant-avatars/(.*)');
        IF file_path IS NOT NULL THEN
          DELETE FROM storage.objects 
          WHERE bucket_id = 'ai-assistant-avatars' 
          AND name = file_path;
        END IF;
      END;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic cleanup
CREATE TRIGGER ai_assistant_avatar_cleanup
  BEFORE UPDATE OR DELETE ON ai_assistants
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_ai_assistant_avatar();
