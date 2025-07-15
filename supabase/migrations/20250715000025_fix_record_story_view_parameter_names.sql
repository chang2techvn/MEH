-- Fix parameter names in record_story_view function to match client expectations
-- Keep original parameter names but use aliases inside function to avoid ambiguity

DROP FUNCTION IF EXISTS public.record_story_view(UUID, UUID);

-- Create function to record story view with original parameter names but aliases inside
CREATE OR REPLACE FUNCTION public.record_story_view(story_id UUID, viewer_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  p_story_id ALIAS FOR record_story_view.story_id;
  p_viewer_id ALIAS FOR record_story_view.viewer_id;
  story_author_id UUID;
  existing_view_id UUID;
BEGIN
  -- Get the story's author
  SELECT author_id INTO story_author_id 
  FROM public.stories 
  WHERE id = p_story_id;
  
  -- Don't record view if viewer is the author
  IF story_author_id = p_viewer_id THEN
    RETURN false;
  END IF;
  
  -- Check if already viewed
  SELECT id INTO existing_view_id 
  FROM public.story_views 
  WHERE story_views.story_id = p_story_id 
    AND story_views.viewer_id = p_viewer_id;
  
  -- If not already viewed, record the view
  IF existing_view_id IS NULL THEN
    INSERT INTO public.story_views (story_id, viewer_id)
    VALUES (p_story_id, p_viewer_id);
    
    -- Increment the views count
    PERFORM public.increment_story_views(p_story_id);
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.record_story_view(UUID, UUID) TO authenticated;
