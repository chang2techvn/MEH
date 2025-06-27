-- Fix RLS policy for conversation_participants table
-- Allow users to see all participants in conversations they participate in

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own participation records" ON conversation_participants;

-- Create new policy that allows users to see all participants in their conversations
CREATE POLICY "Users can view participants in shared conversations" ON conversation_participants
FOR SELECT 
TO authenticated 
USING (
  conversation_id IN (
    SELECT cp.conversation_id 
    FROM conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);
