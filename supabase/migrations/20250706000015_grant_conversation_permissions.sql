-- Grant comprehensive permissions for conversations tables
-- This should fix all permission issues for chat functionality

-- Ensure service role has full access
GRANT ALL PRIVILEGES ON TABLE conversations TO service_role;
GRANT ALL PRIVILEGES ON TABLE conversation_participants TO service_role;
GRANT ALL PRIVILEGES ON TABLE conversation_messages TO service_role;

-- Grant authenticated users full access to conversations
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversation_messages TO authenticated;

-- Grant anon users read access (for public features if needed)
GRANT SELECT ON TABLE conversations TO anon;
GRANT SELECT ON TABLE conversation_participants TO anon;
GRANT SELECT ON TABLE conversation_messages TO anon;

-- Grant usage on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure schema access
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Enable RLS but allow service role to bypass (if not already done)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;

DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON conversation_participants;

-- Create simple, non-recursive RLS policies
-- For conversations: users can see/manage conversations they participate in
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert conversations" ON conversations
  FOR INSERT WITH CHECK (created_by::text = auth.uid()::text);

CREATE POLICY "Users can update conversations they participate in" ON conversations
  FOR UPDATE USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id::text = auth.uid()::text
    )
  );

-- For conversation_participants: users can manage their own participation
CREATE POLICY "Users can view their own participation" ON conversation_participants
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own participation" ON conversation_participants
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own participation" ON conversation_participants
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own participation" ON conversation_participants
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Add comment
COMMENT ON TABLE conversations IS 'Comprehensive permissions granted with safe RLS policies';
COMMENT ON TABLE conversation_participants IS 'Comprehensive permissions granted with safe RLS policies';
