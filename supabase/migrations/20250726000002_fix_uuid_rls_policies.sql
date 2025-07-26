-- Fix RLS policies for natural conversation system with UUID schema
-- Updated for actual schema with UUID primary keys

-- Drop existing policies first
DROP POLICY IF EXISTS "authenticated_users_can_create_sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "users_can_read_own_sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "users_can_update_own_sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "users_can_delete_own_sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "service_role_full_access_sessions" ON public.natural_conversation_sessions;

DROP POLICY IF EXISTS "authenticated_users_can_create_messages" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "users_can_read_messages_in_own_sessions" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "users_can_update_messages_in_own_sessions" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "service_role_full_access_messages" ON public.natural_conversation_messages;

-- Create updated RLS policies for natural_conversation_sessions
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

-- Create updated RLS policies for natural_conversation_messages
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

-- Ensure RLS is enabled
ALTER TABLE public.natural_conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natural_conversation_messages ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.natural_conversation_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.natural_conversation_messages TO authenticated;

-- Since tables use UUID, no sequences to grant
-- But ensure users table access for foreign key constraints
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.ai_assistants TO authenticated;
