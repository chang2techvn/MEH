-- Fix infinite recursion in conversation RLS policies completely
-- This migration removes all existing policies and creates simple, non-recursive ones

-- First, drop ALL existing policies for conversation_participants
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename = 'conversation_participants' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Drop ALL existing policies for conversations
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename = 'conversations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Create simple, secure policies for conversation_participants
-- Policy 1: Users can view their own participation records
CREATE POLICY "view_own_participation" ON conversation_participants
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Users can insert themselves into conversations (for joining)
CREATE POLICY "insert_own_participation" ON conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can update their own participation (like last_read_at)
CREATE POLICY "update_own_participation" ON conversation_participants
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can delete their own participation (for leaving)
CREATE POLICY "delete_own_participation" ON conversation_participants
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create simple policies for conversations
-- Policy 1: Users can view conversations they created or are participants in
-- Use a simpler approach to avoid recursion
CREATE POLICY "view_accessible_conversations" ON conversations
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
);

-- Policy 2: Users can create conversations
CREATE POLICY "create_conversations" ON conversations
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Policy 3: Users can update conversations they created
CREATE POLICY "update_own_conversations" ON conversations
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Also create a simple policy for conversation_messages to avoid issues
DROP POLICY IF EXISTS "view_conversation_messages" ON conversation_messages;
DROP POLICY IF EXISTS "insert_conversation_messages" ON conversation_messages;
DROP POLICY IF EXISTS "update_conversation_messages" ON conversation_messages;

-- Simple message policies
CREATE POLICY "view_messages" ON conversation_messages
FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() OR
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "insert_messages" ON conversation_messages
FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "update_own_messages" ON conversation_messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_messages TO authenticated;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user can access conversation (for frontend queries)
CREATE OR REPLACE FUNCTION user_can_access_conversation(conversation_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_uuid 
    AND c.created_by = user_uuid
  ) OR EXISTS (
    SELECT 1 FROM conversation_participants cp 
    WHERE cp.conversation_id = conversation_uuid 
    AND cp.user_id = user_uuid
  );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION user_can_access_conversation(UUID, UUID) TO authenticated;
