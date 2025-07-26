-- Fix RLS policies for natural conversation system
-- Allow users to create sessions even without existing sessions

-- First, let's check and fix the natural_conversation_sessions table policies
DROP POLICY IF EXISTS "Users can manage their own conversation sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Service role can manage all conversation sessions" ON public.natural_conversation_sessions;

-- Create more permissive policies for session management
CREATE POLICY "authenticated_users_can_create_sessions" ON public.natural_conversation_sessions
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_read_own_sessions" ON public.natural_conversation_sessions
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_can_update_own_sessions" ON public.natural_conversation_sessions
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_sessions" ON public.natural_conversation_sessions
  FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Service role policy for admin access
CREATE POLICY "service_role_full_access_sessions" ON public.natural_conversation_sessions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix messages policies too
DROP POLICY IF EXISTS "Users can manage messages in their sessions" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "Service role can manage all messages" ON public.natural_conversation_messages;

-- More granular message policies
CREATE POLICY "authenticated_users_can_create_messages" ON public.natural_conversation_messages
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM natural_conversation_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_read_messages_in_own_sessions" ON public.natural_conversation_messages
  FOR SELECT 
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM natural_conversation_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_messages_in_own_sessions" ON public.natural_conversation_messages
  FOR UPDATE 
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM natural_conversation_sessions 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM natural_conversation_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Service role policy for messages
CREATE POLICY "service_role_full_access_messages" ON public.natural_conversation_messages
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Make sure RLS is enabled on both tables
ALTER TABLE public.natural_conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natural_conversation_messages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.natural_conversation_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.natural_conversation_messages TO authenticated;

-- Since tables use UUID, no sequences exist
-- But ensure users table access for foreign key constraints
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.ai_assistants TO authenticated;
