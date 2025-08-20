
-- Fix RLS for users table
-- Run this in Supabase SQL Editor

-- Enable RLS on users table  
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "authenticated_users_can_read_all" ON public.users;
DROP POLICY IF EXISTS "users_can_read_all" ON public.users;
DROP POLICY IF EXISTS "admin_full_access" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own" ON public.users;

-- Create policy for authenticated users to read all users
CREATE POLICY "authenticated_users_can_read_all" 
ON public.users FOR SELECT 
TO authenticated 
USING (true);

-- Create policy for admin full access  
CREATE POLICY "admin_full_access" 
ON public.users FOR ALL 
TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Create policy for users to update their own records
CREATE POLICY "users_can_update_own" 
ON public.users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- If the above doesn't work, disable RLS temporarily:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
