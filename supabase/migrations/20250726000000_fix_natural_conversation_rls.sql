-- Fix RLS policies for natural conversation system
-- Run this migration to fix permission issues

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can read their own conversation sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Users can create their own conversation sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Users can update their own conversation sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Users can manage their own conversation sessions" ON public.natural_conversation_sessions;

-- Create comprehensive policy for natural_conversation_sessions
CREATE POLICY "Users can manage their own conversation sessions" ON public.natural_conversation_sessions
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all conversation sessions" ON public.natural_conversation_sessions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Drop and recreate policies for natural_conversation_messages
DROP POLICY IF EXISTS "Users can read messages in their sessions" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "Users can manage messages in their sessions" ON public.natural_conversation_messages;

CREATE POLICY "Users can manage messages in their sessions" ON public.natural_conversation_messages
  FOR ALL 
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

CREATE POLICY "Service role can manage all messages" ON public.natural_conversation_messages
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix vocabulary_learning policies
DROP POLICY IF EXISTS "Users can read their own vocabulary" ON public.vocabulary_learning;
DROP POLICY IF EXISTS "Users can create their own vocabulary" ON public.vocabulary_learning;
DROP POLICY IF EXISTS "Users can update their own vocabulary" ON public.vocabulary_learning;

CREATE POLICY "Users can manage their own vocabulary" ON public.vocabulary_learning
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all vocabulary" ON public.vocabulary_learning
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure other tables have proper service role access
DROP POLICY IF EXISTS "Service role can manage ai_interactions" ON public.ai_interactions;
CREATE POLICY "Service role can manage ai_interactions" ON public.ai_interactions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage conversation_flows" ON public.conversation_flows;
CREATE POLICY "Service role can manage conversation_flows" ON public.conversation_flows
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.natural_conversation_sessions TO service_role;
GRANT ALL ON public.natural_conversation_messages TO service_role;
GRANT ALL ON public.ai_interactions TO service_role;
GRANT ALL ON public.conversation_flows TO service_role;
GRANT ALL ON public.vocabulary_learning TO service_role;
GRANT ALL ON public.ai_relationship_matrix TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
