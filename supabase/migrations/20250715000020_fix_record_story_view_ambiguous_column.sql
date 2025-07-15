-- Fix ambiguous column reference in record_story_view function
-- Replace the function with proper parameter naming to avoid conflicts

DROP FUNCTION IF EXISTS public.record_story_view(UUID, UUID);

-- Create function to record story view (with author check) - Fixed version
CREATE OR REPLACE FUNCTION public.record_story_view(p_story_id UUID, p_viewer_id UUID)
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
  WHERE id = p_story_id;
  
  -- Don't record view if viewer is the author
  IF story_author_id = p_viewer_id THEN
    RETURN false;
  END IF;
  
  -- Check if already viewed
  SELECT id INTO existing_view_id 
  FROM public.story_views 
  WHERE story_id = p_story_id 
    AND viewer_id = p_viewer_id;
  
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
