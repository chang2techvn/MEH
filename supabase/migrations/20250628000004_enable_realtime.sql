-- Enable the realtime extension
CREATE EXTENSION IF NOT EXISTS "supabase_realtime" WITH SCHEMA "extensions";

-- Enable realtime for tables that need it
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Enable realtime publication for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Grant realtime permissions
GRANT SELECT ON public.conversation_messages TO anon;
GRANT SELECT ON public.conversation_participants TO anon;
GRANT SELECT ON public.conversations TO anon;

-- Create RLS policies for realtime access
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
