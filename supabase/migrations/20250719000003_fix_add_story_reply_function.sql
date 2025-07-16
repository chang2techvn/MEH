-- Fix add_story_reply function to work with new constraint structure
CREATE OR REPLACE FUNCTION add_story_reply(
  p_story_id UUID,
  p_viewer_id UUID, 
  p_reply_content TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_story_author_id UUID;
  v_replier_name TEXT;
  v_result JSON;
BEGIN
  -- Get story author
  SELECT author_id INTO v_story_author_id
  FROM public.stories 
  WHERE id = p_story_id AND is_active = true AND expires_at > NOW();
  
  IF v_story_author_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Story not found or expired');
  END IF;
  
  -- Prevent authors from replying to their own stories
  IF v_story_author_id = p_viewer_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot reply to your own story');
  END IF;
  
  -- Insert or update the story reply using the new unique index
  INSERT INTO public.story_views (
    story_id, 
    viewer_id, 
    interaction_type, 
    reply_content, 
    replied_at,
    viewed_at
  ) 
  VALUES (
    p_story_id, 
    p_viewer_id, 
    'reply', 
    p_reply_content, 
    NOW(),
    NOW()
  )
  ON CONFLICT (story_id, viewer_id) WHERE interaction_type = 'reply'
  DO UPDATE SET
    reply_content = p_reply_content,
    replied_at = NOW(),
    viewed_at = NOW();
    
  -- Get replier name for notification
  SELECT COALESCE(full_name, username, 'Unknown User') INTO v_replier_name
  FROM public.profiles 
  WHERE user_id = p_viewer_id;
  
  -- Create notification and conversation message
  PERFORM create_story_reply_notification(
    p_story_id,
    v_story_author_id,
    p_viewer_id,
    v_replier_name,
    p_reply_content
  );
    
  -- Return success
  v_result := json_build_object(
    'success', true, 
    'message', 'Reply added successfully'
  );
  
  RETURN v_result;
END;
$$;
