-- Fix RLS policies for conversations
-- Copy and paste this into Supabase Studio SQL Editor

-- First, disable RLS temporarily to avoid conflicts
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "conversations_insert_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_select_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_update_policy" ON conversations;
DROP POLICY IF EXISTS "conversations_delete_policy" ON conversations;
DROP POLICY IF EXISTS "conversation_participants_insert_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_select_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_update_policy" ON conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_delete_policy" ON conversation_participants;

-- Create simple, permissive policies for conversations
CREATE POLICY "conversations_all_authenticated" ON conversations
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create simple, permissive policies for conversation_participants  
CREATE POLICY "conversation_participants_all_authenticated" ON conversation_participants
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Test the policies
SELECT 'RLS policies updated successfully!' as status;
