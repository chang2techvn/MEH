-- Add story_reply to notification_type constraint and create story reply notification system
-- Update notification_type constraint to include story_reply
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_notification_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_notification_type_check 
CHECK (notification_type IN ('achievement', 'like', 'comment', 'follow', 'challenge', 'system', 'story_reply'));

-- Create function to create notification for story reply
CREATE OR REPLACE FUNCTION create_story_reply_notification(
  p_story_id UUID,
  p_story_author_id UUID,
  p_replier_id UUID,
  p_replier_name TEXT,
  p_reply_content TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
  v_conversation_id UUID;
  v_result JSON;
BEGIN
  -- Don't create notification if replier is the story author
  IF p_story_author_id = p_replier_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot notify self');
  END IF;
  
  -- Create notification for story author
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    notification_type,
    data,
    is_read
  ) VALUES (
    p_story_author_id,
    'New Story Reply',
    p_replier_name || ' replied to your story',
    'story_reply',
    json_build_object(
      'story_id', p_story_id,
      'replier_id', p_replier_id,
      'replier_name', p_replier_name,
      'reply_content', p_reply_content,
      'action_url', '/community'
    ),
    false
  ) RETURNING id INTO v_notification_id;
  
  -- Find or create conversation between story author and replier
  SELECT id INTO v_conversation_id
  FROM public.conversations c
  WHERE c.type = 'direct'
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp1 
      WHERE cp1.conversation_id = c.id AND cp1.user_id = p_story_author_id
    )
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp2 
      WHERE cp2.conversation_id = c.id AND cp2.user_id = p_replier_id
    )
  LIMIT 1;
  
  -- If no conversation exists, create one
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.conversations (
      title,
      status,
      type
    ) VALUES (
      'Story Reply Discussion',
      'active',
      'direct'
    ) RETURNING id INTO v_conversation_id;
    
    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id, role) VALUES
      (v_conversation_id, p_story_author_id, 'participant'),
      (v_conversation_id, p_replier_id, 'participant');
  END IF;
  
  -- Add the reply as a conversation message
  INSERT INTO public.conversation_messages (
    conversation_id,
    sender_id,
    content,
    message_type
  ) VALUES (
    v_conversation_id,
    p_replier_id,
    'Story Reply: ' || p_reply_content,
    'text'
  );
  
  -- Update conversation timestamp
  UPDATE public.conversations 
  SET last_message_at = NOW(), updated_at = NOW()
  WHERE id = v_conversation_id;
  
  v_result := json_build_object(
    'success', true,
    'notification_id', v_notification_id,
    'conversation_id', v_conversation_id
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_story_reply_notification(UUID, UUID, UUID, TEXT, TEXT) TO authenticated;
