-- Fix RLS for users table based on actual schema
-- Run this in Supabase SQL Editor

-- First, enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "authenticated_users_can_read_all" ON public.users;
DROP POLICY IF EXISTS "users_can_read_all" ON public.users;
DROP POLICY IF EXISTS "admin_full_access" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own" ON public.users;
DROP POLICY IF EXISTS "users_can_insert" ON public.users;
DROP POLICY IF EXISTS "users_can_delete" ON public.users;

-- Policy 1: Allow authenticated users to read all users
-- This is needed for admin panel and user listings
CREATE POLICY "authenticated_users_can_read_all" 
ON public.users FOR SELECT 
TO authenticated 
USING (true);

-- Policy 2: Allow users to update their own records
CREATE POLICY "users_can_update_own" 
ON public.users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Policy 3: Allow admin users full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "admin_full_access" 
ON public.users FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
);

-- Policy 4: Allow service role full access (for server-side operations)
CREATE POLICY "service_role_full_access" 
ON public.users FOR ALL 
TO service_role 
USING (true);

-- Policy 5: Allow authenticated users to insert new users (for registration)
CREATE POLICY "authenticated_users_can_insert" 
ON public.users FOR INSERT 
TO authenticated 
WITH CHECK (
  -- Either admin or the user is creating their own record
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ) OR auth.uid() = id
);

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Test the policies
SELECT 'RLS enabled for users table' as status;
