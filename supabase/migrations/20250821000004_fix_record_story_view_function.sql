-- Drop and recreate record_story_view function with fixed parameter names
DROP FUNCTION IF EXISTS record_story_view(UUID, UUID);

CREATE OR REPLACE FUNCTION record_story_view(
  p_story_id UUID,
  p_viewer_id UUID
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update story view record
  INSERT INTO story_views (story_id, viewer_id, viewed_at)
  VALUES (p_story_id, p_viewer_id, NOW())
  ON CONFLICT (story_id, viewer_id) 
  DO UPDATE SET 
    viewed_at = NOW();
    
  -- Update views count in stories table
  UPDATE stories 
  SET views_count = views_count + 1
  WHERE id = p_story_id;
END;
$$;
