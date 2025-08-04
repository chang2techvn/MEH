-- Fix infinite recursion in RLS policies
-- This migration fixes the circular reference issue

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can select own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can select any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

DROP POLICY IF EXISTS "Admins can delete any user" ON users;
DROP POLICY IF EXISTS "Admins can select any user" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;

-- Create a simple function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    JOIN profiles p ON p.user_id = au.id
    WHERE au.id = user_id AND p.role = 'admin'
  );
$$;

-- Create simplified policies for profiles that avoid recursion
CREATE POLICY "Allow authenticated users to see profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
);

CREATE POLICY "Allow users to update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to update any profile"
ON profiles
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Allow users to insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own profile"
ON profiles
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR is_admin(auth.uid())
);

-- Create policies for users table
CREATE POLICY "Allow authenticated users to see users"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR is_admin(auth.uid())
);

CREATE POLICY "Allow users to update own user record"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to update any user"
ON users
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Allow admins to delete any user"
ON users
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
