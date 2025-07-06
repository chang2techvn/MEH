-- Fix infinite recursion in conversation RLS policies
-- Keep RLS enabled but create simple, non-recursive policies

-- First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can delete conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert own participation" ON conversation_participants;
DROP POLICY IF EXISTS "Creators can add participants" ON conversation_participants;

-- SIMPLE POLICIES for conversations table (NO JOINS to avoid recursion)
-- Policy 1: Users can view conversations they created
CREATE POLICY "Simple view own conversations" ON conversations
  FOR SELECT 
  USING (created_by::text = auth.uid()::text);

-- Policy 2: Users can insert conversations
CREATE POLICY "Simple create conversations" ON conversations
  FOR INSERT 
  WITH CHECK (created_by::text = auth.uid()::text);

-- SIMPLE POLICIES for conversation_participants table (NO JOINS)
-- Policy 1: Users can view their own participation records
CREATE POLICY "Simple view own participation" ON conversation_participants
  FOR SELECT 
  USING (user_id::text = auth.uid()::text);

-- Policy 2: Users can insert their own participation
CREATE POLICY "Simple insert own participation" ON conversation_participants
  FOR INSERT 
  WITH CHECK (user_id::text = auth.uid()::text);

-- Keep RLS enabled for security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE conversations IS 'RLS enabled with simple non-recursive policies v2';
COMMENT ON TABLE conversation_participants IS 'RLS enabled with simple non-recursive policies v2';
