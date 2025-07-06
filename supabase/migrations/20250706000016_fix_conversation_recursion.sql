-- Fix infinite recursion in conversation_participants RLS policies
-- Disable RLS temporarily and create simple, non-recursive policies

-- Disable RLS to break the infinite recursion
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;

DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON conversation_participants;

-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for conversations
CREATE POLICY "Allow authenticated users to select conversations" ON conversations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert conversations" ON conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own conversations" ON conversations
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Allow users to delete their own conversations" ON conversations
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Create simple, non-recursive policies for conversation_participants
CREATE POLICY "Allow authenticated users to select participants" ON conversation_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert participants" ON conversation_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own participation" ON conversation_participants
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Allow users to delete their own participation" ON conversation_participants
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Add comment
COMMENT ON TABLE conversations IS 'RLS policies simplified to avoid infinite recursion';
COMMENT ON TABLE conversation_participants IS 'RLS policies simplified to avoid infinite recursion';
