-- Fix RLS policy for users table to allow viewing participants in shared conversations
-- This migration addresses the issue where users can't see other participants in their conversations

-- First, enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view participants in shared conversations" ON public.users;

-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (id = auth.uid());

-- Policy 2: Users can view other users who share a conversation with them
CREATE POLICY "Users can view participants in shared conversations" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT DISTINCT cp.user_id
    FROM conversation_participants cp
    WHERE cp.conversation_id IN (
      SELECT cp2.conversation_id 
      FROM conversation_participants cp2 
      WHERE cp2.user_id = auth.uid()
    )
  )
);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 4: Allow new user registration
CREATE POLICY "Enable insert for registration" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
