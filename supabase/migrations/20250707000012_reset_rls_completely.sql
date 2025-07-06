-- Complete reset of RLS policies for conversations table
-- This migration removes ALL policies and creates simple, non-recursive ones

-- Step 1: Disable RLS temporarily to clear everything
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (including any hidden ones)
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on conversations
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversations' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON conversations';
        RAISE NOTICE 'Dropped conversations policy: %', pol.policyname;
    END LOOP;
    
    -- Drop all policies on conversation_participants  
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversation_participants' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON conversation_participants';
        RAISE NOTICE 'Dropped participants policy: %', pol.policyname;
    END LOOP;
    
    -- Drop all policies on conversation_messages
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversation_messages' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON conversation_messages';
        RAISE NOTICE 'Dropped messages policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 3: Create SIMPLE, non-recursive policies for conversations
CREATE POLICY "conversations_insert_policy" ON conversations
    FOR INSERT 
    TO authenticated 
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "conversations_select_policy" ON conversations
    FOR SELECT 
    TO authenticated 
    USING (created_by = auth.uid());

CREATE POLICY "conversations_update_policy" ON conversations
    FOR UPDATE 
    TO authenticated 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "conversations_delete_policy" ON conversations
    FOR DELETE 
    TO authenticated 
    USING (created_by = auth.uid());

-- Step 4: Create SIMPLE policies for conversation_participants
CREATE POLICY "participants_insert_policy" ON conversation_participants
    FOR INSERT 
    TO authenticated 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "participants_select_policy" ON conversation_participants
    FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid());

CREATE POLICY "participants_update_policy" ON conversation_participants
    FOR UPDATE 
    TO authenticated 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "participants_delete_policy" ON conversation_participants
    FOR DELETE 
    TO authenticated 
    USING (user_id = auth.uid());

-- Step 5: Create SIMPLE policies for conversation_messages
CREATE POLICY "messages_insert_policy" ON conversation_messages
    FOR INSERT 
    TO authenticated 
    WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_select_policy" ON conversation_messages
    FOR SELECT 
    TO authenticated 
    USING (sender_id = auth.uid());

CREATE POLICY "messages_update_policy" ON conversation_messages
    FOR UPDATE 
    TO authenticated 
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Step 6: Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Step 7: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_messages TO authenticated;

-- Step 8: Create a function to test if policies work
CREATE OR REPLACE FUNCTION test_conversation_creation(user_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    conv_id UUID;
BEGIN
    -- Test insert
    INSERT INTO conversations (title, type, status, created_by, created_at, updated_at)
    VALUES ('Test Conversation', 'direct', 'active', user_uuid, NOW(), NOW())
    RETURNING id INTO conv_id;
    
    RAISE NOTICE 'Successfully created conversation: %', conv_id;
    RETURN conv_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating conversation: %', SQLERRM;
        RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION test_conversation_creation(UUID) TO authenticated;
