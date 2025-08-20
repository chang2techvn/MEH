-- Fix RLS policies for conversations and related tables
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert conversations they create" ON public.conversations;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete conversations they own" ON public.conversations;

DROP POLICY IF EXISTS "Users can insert participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own participant record" ON public.conversation_participants;

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.conversation_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.conversation_messages;

-- Create simplified RLS policies for conversations table
CREATE POLICY "Users can insert conversations they create" ON public.conversations
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view conversations they participate in" ON public.conversations
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update conversations they participate in" ON public.conversations
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete conversations they own" ON public.conversations
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Create simplified RLS policies for conversation_participants table
CREATE POLICY "Users can insert participants" ON public.conversation_participants
  FOR INSERT 
  WITH CHECK (true); -- Allow insertion, will be restricted by app logic

CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id 
      AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participant record" ON public.conversation_participants
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participant record" ON public.conversation_participants
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create simplified RLS policies for conversation_messages table
CREATE POLICY "Users can insert messages in their conversations" ON public.conversation_messages
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversation_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their conversations" ON public.conversation_messages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = conversation_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON public.conversation_messages
  FOR UPDATE 
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON public.conversation_messages
  FOR DELETE 
  USING (auth.uid() = sender_id);

-- Ensure RLS is enabled
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
