-- Fix RLS policies for conversations
-- Copy and paste this into Supabase Studio SQL Editor

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants');

-- Drop existing policies
DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_delete_policy" ON conversations;
DROP POLICY IF EXISTS "conversation_participants_insert_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_select_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_update_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_delete_policy" ON conversation_participants;

-- Create very permissive policies for testing
CREATE POLICY "conversations_insert_policy" ON conversations
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "conversations_select_policy" ON conversations
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "conversations_update_policy" ON conversations
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "conversations_delete_policy" ON conversations
    FOR DELETE 
    TO authenticated
    USING (true);

-- Policies for conversation_participants
CREATE POLICY "conversation_participants_insert_policy" ON conversation_participants
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "conversation_participants_select_policy" ON conversation_participants
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "conversation_participants_update_policy" ON conversation_participants
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "conversation_participants_delete_policy" ON conversation_participants
    FOR DELETE 
    TO authenticated
    USING (true);

-- Ensure RLS is enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Check that policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('conversations', 'conversation_participants');

-- Test if auth.uid() works
SELECT auth.uid() as current_user_id;
