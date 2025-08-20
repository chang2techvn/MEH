-- Migration: Fix RLS policies for users table
-- Date: 2025-08-20
-- Description: Add proper Row Level Security policies for users table to allow authenticated users to read user data

-- First, ensure RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_select_all" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_can_read_all" ON public.users;
DROP POLICY IF EXISTS "users_can_read_all" ON public.users;
DROP POLICY IF EXISTS "admin_full_access" ON public.users;
DROP POLICY IF EXISTS "users_can_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin" ON public.users;

-- Policy 1: Allow authenticated users to SELECT all user records
-- This is needed for admin panel and user listings
CREATE POLICY "users_select_authenticated" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy 2: Allow users to UPDATE their own profile
CREATE POLICY "users_update_own" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow admin users full access (INSERT, UPDATE, DELETE)
CREATE POLICY "admin_full_access" 
ON public.users 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.id = auth.uid() 
    AND admin_user.role = 'admin'
    AND admin_user.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.id = auth.uid() 
    AND admin_user.role = 'admin'
    AND admin_user.is_active = true
  )
);

-- Policy 4: Allow authenticated users to INSERT new user records (for registration)
CREATE POLICY "users_insert_authenticated" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy 5: Allow admin users to DELETE users
CREATE POLICY "users_delete_admin" 
ON public.users 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users admin_user 
    WHERE admin_user.id = auth.uid() 
    AND admin_user.role = 'admin'
    AND admin_user.is_active = true
  )
);

-- Grant necessary permissions to authenticated role
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
GRANT DELETE ON public.users TO authenticated;

-- Optional: Create a function to check if user is admin (for better performance)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id 
    AND role = 'admin' 
    AND is_active = true
  );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- Create optimized policies using the function (optional optimization)
/*
-- These are alternative policies using the function for better performance
-- Uncomment if you want to use the function-based approach

DROP POLICY IF EXISTS "admin_full_access" ON public.users;

CREATE POLICY "admin_full_access" 
ON public.users 
FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "users_delete_admin" ON public.users;

CREATE POLICY "users_delete_admin" 
ON public.users 
FOR DELETE 
TO authenticated 
USING (public.is_admin(auth.uid()));
*/

-- Add comments for documentation
COMMENT ON POLICY "users_select_authenticated" ON public.users IS 'Allow authenticated users to read all user data for admin panel and user listings';
COMMENT ON POLICY "users_update_own" ON public.users IS 'Allow users to update their own profile information';
COMMENT ON POLICY "admin_full_access" ON public.users IS 'Give admin users full CRUD access to all user records';
COMMENT ON POLICY "users_insert_authenticated" ON public.users IS 'Allow authenticated users to create new user records during registration';
COMMENT ON POLICY "users_delete_admin" ON public.users IS 'Allow only admin users to delete user records';

-- Verify the policies are created
DO $$
BEGIN
  RAISE NOTICE 'RLS Policies created successfully for public.users table';
  RAISE NOTICE 'Policies: users_select_authenticated, users_update_own, admin_full_access, users_insert_authenticated, users_delete_admin';
END $$;
