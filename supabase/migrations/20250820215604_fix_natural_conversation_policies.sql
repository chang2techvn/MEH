-- Fix RLS policies for natural conversation tables
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.natural_conversation_sessions;

DROP POLICY IF EXISTS "Users can insert messages in their sessions" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.natural_conversation_messages;

-- Create RLS policies for natural_conversation_sessions table
CREATE POLICY "Users can insert their own sessions" ON public.natural_conversation_sessions
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON public.natural_conversation_sessions
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.natural_conversation_sessions
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.natural_conversation_sessions
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for natural_conversation_messages table
CREATE POLICY "Users can insert messages in their sessions" ON public.natural_conversation_messages
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM natural_conversation_sessions 
      WHERE id = natural_conversation_messages.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their sessions" ON public.natural_conversation_messages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM natural_conversation_sessions 
      WHERE id = natural_conversation_messages.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON public.natural_conversation_messages
  FOR UPDATE 
  USING (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM natural_conversation_sessions 
      WHERE id = natural_conversation_messages.session_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM natural_conversation_sessions 
      WHERE id = natural_conversation_messages.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own messages" ON public.natural_conversation_messages
  FOR DELETE 
  USING (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM natural_conversation_sessions 
      WHERE id = natural_conversation_messages.session_id 
      AND user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.natural_conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natural_conversation_messages ENABLE ROW LEVEL SECURITY;
