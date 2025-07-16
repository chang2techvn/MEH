-- Create function to add story reply
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
  
  -- Insert or update the story reply
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
  ON CONFLICT (story_id, viewer_id, interaction_type, reaction_type)
  DO UPDATE SET
    reply_content = p_reply_content,
    replied_at = NOW(),
    viewed_at = NOW();
    
  -- Get replier name for notification
  DECLARE
    v_replier_name TEXT;
  BEGIN
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
  END;
    
  -- Return success
  v_result := json_build_object(
    'success', true, 
    'message', 'Reply added successfully'
  );
  
  RETURN v_result;
END;
$$;

-- Create function to get story replies for author
CREATE OR REPLACE FUNCTION get_story_replies(
  p_story_id UUID,
  p_author_id UUID
)
RETURNS TABLE (
  id UUID,
  viewer_id UUID,
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  viewer_username TEXT,
  viewer_full_name TEXT,
  viewer_avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is the story author
  IF NOT EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = p_story_id AND stories.author_id = p_author_id
  ) THEN
    RAISE EXCEPTION 'Only story author can view replies';
  END IF;
  
  -- Return story replies with user info
  RETURN QUERY
  SELECT 
    sv.id,
    sv.viewer_id,
    sv.reply_content,
    sv.replied_at,
    p.username as viewer_username,
    p.full_name as viewer_full_name,
    p.avatar_url as viewer_avatar_url
  FROM public.story_views sv
  JOIN public.profiles p ON p.user_id = sv.viewer_id
  WHERE sv.story_id = p_story_id 
    AND sv.interaction_type = 'reply'
    AND sv.reply_content IS NOT NULL
  ORDER BY sv.replied_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_story_reply(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_story_replies(UUID, UUID) TO authenticated;
