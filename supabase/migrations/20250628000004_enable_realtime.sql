-- Enable the realtime extension (cloud compatible)
-- Note: In cloud Supabase, realtime is already enabled by default

-- Enable realtime for tables that need it
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Enable realtime publication for these tables (cloud compatible)
-- Note: supabase_realtime publication exists by default in cloud
DO $$
BEGIN
  -- Check if publication exists and add tables
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Add tables to existing publication, ignore if already added
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- Table already in publication
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Grant realtime permissions
GRANT SELECT ON public.conversation_messages TO anon;
GRANT SELECT ON public.conversation_participants TO anon;
GRANT SELECT ON public.conversations TO anon;

-- Create RLS policies for realtime access (with IF NOT EXISTS handling)
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.conversation_messages;

-- Conversations policy
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversations.id 
    AND user_id = auth.uid()
  )
);

-- Messages policy
CREATE POLICY "Users can view messages in their conversations" ON public.conversation_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversation_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

-- Participants policy
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants AS cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.user_id = auth.uid()
  )
);

-- Insert policy for messages (for testing)
CREATE POLICY "Users can insert messages in their conversations" ON public.conversation_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversation_messages.conversation_id 
    AND user_id = auth.uid()
  )
);
