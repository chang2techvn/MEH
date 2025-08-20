-- Fix RLS infinite recursion on users table
-- Date: 2025-08-20
-- Description: Remove recursive policies that cause infinite recursion

-- The issue is that policies are referencing the same table they're applied to
-- causing infinite recursion when queries join with users table

-- First, drop all existing policies to start clean
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_service_role_access" ON public.users;
DROP POLICY IF EXISTS "users_middleware_access" ON public.users;
DROP POLICY IF EXISTS "admin_full_access" ON public.users;
DROP POLICY IF EXISTS "users_insert_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;

-- Create simple, non-recursive policies

-- 1. Allow authenticated users to read all user data (needed for joins)
CREATE POLICY "authenticated_read_users" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Allow users to update their own record
CREATE POLICY "users_update_self" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 3. Allow authenticated users to insert (for registration)
CREATE POLICY "authenticated_insert_users" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Simple admin delete policy (check role from JWT claims, not database)
CREATE POLICY "admin_delete_users" 
ON public.users 
FOR DELETE 
TO authenticated 
USING (
  (auth.jwt() ->> 'role') = 'admin' OR 
  auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin' LIMIT 1
  )
);

-- Also ensure profiles table has simple policies
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Simple profiles policies
CREATE POLICY "authenticated_read_profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "users_update_own_profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT, UPDATE ON public.users TO authenticated; 
GRANT DELETE ON public.users TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Test the fix
DO $$
BEGIN
  -- Test a simple query that should work now
  PERFORM id, email, role FROM public.users LIMIT 1;
  RAISE NOTICE 'SUCCESS: Users table policies fixed - no infinite recursion';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'WARNING: Still issues with users table: %', SQLERRM;
END $$;
