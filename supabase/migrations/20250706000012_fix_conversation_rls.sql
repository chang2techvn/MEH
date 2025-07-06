-- Fix RLS policies for conversations and conversation_participants tables
-- Remove recursive policies that cause infinite recursion

-- Disable RLS temporarily for conversation_participants to break recursion
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;

DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON conversation_participants;

-- Grant basic permissions first
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversation_participants TO authenticated;
GRANT SELECT ON TABLE conversations TO anon;
GRANT SELECT ON TABLE conversation_participants TO anon;

-- Re-enable RLS with simple, non-recursive policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Simple policy for conversations - allow authenticated users to manage all conversations
CREATE POLICY "Authenticated users can manage conversations" ON conversations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- For conversation_participants, use a simple policy without recursion
-- We'll keep RLS disabled for now to avoid recursion issues
-- ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Authenticated users can manage participants" ON conversation_participants
--   FOR ALL USING (auth.uid() IS NOT NULL);

-- Add comments
COMMENT ON TABLE conversations IS 'RLS enabled with simple policies to avoid recursion';
COMMENT ON TABLE conversation_participants IS 'RLS disabled temporarily to avoid infinite recursion';
