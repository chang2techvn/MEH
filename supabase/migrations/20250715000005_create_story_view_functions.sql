-- Create increment_story_views function and improve view logic
-- This migration adds the missing function and prevents self-viewing

-- Create function to increment story views count
CREATE OR REPLACE FUNCTION public.increment_story_views(story_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.stories 
  SET views_count = views_count + 1,
      updated_at = NOW()
  WHERE id = story_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.increment_story_views(UUID) TO authenticated;

-- Create function to record story view (with author check)
CREATE OR REPLACE FUNCTION public.record_story_view(story_id UUID, viewer_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  story_author_id UUID;
  existing_view_id UUID;
BEGIN
  -- Get the story's author
  SELECT author_id INTO story_author_id 
  FROM public.stories 
  WHERE id = story_id;
  
  -- Don't record view if viewer is the author
  IF story_author_id = viewer_id THEN
    RETURN false;
  END IF;
  
  -- Check if already viewed
  SELECT id INTO existing_view_id 
  FROM public.story_views 
  WHERE story_id = record_story_view.story_id 
    AND viewer_id = record_story_view.viewer_id;
  
  -- If not already viewed, record the view
  IF existing_view_id IS NULL THEN
    INSERT INTO public.story_views (story_id, viewer_id)
    VALUES (record_story_view.story_id, record_story_view.viewer_id);
    
    -- Increment the views count
    PERFORM public.increment_story_views(record_story_view.story_id);
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.record_story_view(UUID, UUID) TO authenticated;
