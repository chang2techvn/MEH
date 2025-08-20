-- Fix RLS policies for natural_conversation_messages table
-- Drop existing policies if any
DROP POLICY IF EXISTS "natural_conversation_messages_select_policy" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "natural_conversation_messages_insert_policy" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "natural_conversation_messages_update_policy" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "natural_conversation_messages_delete_policy" ON public.natural_conversation_messages;

-- Enable RLS
ALTER TABLE public.natural_conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for natural_conversation_messages
-- Allow all authenticated users to select messages
CREATE POLICY "natural_conversation_messages_select_policy" ON public.natural_conversation_messages
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to insert messages if they are the sender OR if it's an AI message (sender_id is null)
CREATE POLICY "natural_conversation_messages_insert_policy" ON public.natural_conversation_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id IS NULL OR 
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.natural_conversation_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Allow users to update their own messages or messages in their sessions
CREATE POLICY "natural_conversation_messages_update_policy" ON public.natural_conversation_messages
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.natural_conversation_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.natural_conversation_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Allow users to delete their own messages or messages in their sessions
CREATE POLICY "natural_conversation_messages_delete_policy" ON public.natural_conversation_messages
  FOR DELETE TO authenticated
  USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.natural_conversation_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Success notice
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Natural conversation messages RLS policies fixed';
END $$;
