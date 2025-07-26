-- Add RLS policies for natural conversation system tables

-- Enable RLS and add policies for ai_relationship_matrix
ALTER TABLE public.ai_relationship_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage ai_relationship_matrix" ON public.ai_relationship_matrix
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read ai_relationship_matrix" ON public.ai_relationship_matrix
  FOR SELECT 
  TO authenticated
  USING (true);

-- Enable RLS and add policies for natural_conversation_sessions
ALTER TABLE public.natural_conversation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage natural_conversation_sessions" ON public.natural_conversation_sessions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage their own conversation sessions" ON public.natural_conversation_sessions
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enable RLS and add policies for natural_conversation_messages
ALTER TABLE public.natural_conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage natural_conversation_messages" ON public.natural_conversation_messages
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- Enable RLS and add policies for ai_interactions
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage ai_interactions" ON public.ai_interactions
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read ai_interactions in their sessions" ON public.ai_interactions
  FOR SELECT 
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM natural_conversation_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Enable RLS and add policies for conversation_flows
ALTER TABLE public.conversation_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage conversation_flows" ON public.conversation_flows
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read conversation_flows in their sessions" ON public.conversation_flows
  FOR SELECT 
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM natural_conversation_sessions 
      WHERE user_id = auth.uid()
    )
  );

-- Grant necessary permissions to service_role
GRANT ALL ON public.ai_relationship_matrix TO service_role;
GRANT ALL ON public.natural_conversation_sessions TO service_role;
GRANT ALL ON public.natural_conversation_messages TO service_role;
GRANT ALL ON public.ai_interactions TO service_role;
GRANT ALL ON public.conversation_flows TO service_role;
