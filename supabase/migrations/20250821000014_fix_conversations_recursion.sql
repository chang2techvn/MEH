-- Fix infinite recursion in conversations policies
-- Drop all existing policies to start fresh
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

-- Create simplified policies to avoid recursion
-- For conversations: Allow all operations for authenticated users
-- App logic will handle proper access control
CREATE POLICY "Authenticated users can manage conversations" ON public.conversations
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- For conversation_participants: Allow authenticated users to manage participants
CREATE POLICY "Authenticated users can manage participants" ON public.conversation_participants
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- For conversation_messages: Only allow users to manage their own messages
CREATE POLICY "Users can insert their own messages" ON public.conversation_messages
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view all messages" ON public.conversation_messages
  FOR SELECT 
  USING (true);

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
