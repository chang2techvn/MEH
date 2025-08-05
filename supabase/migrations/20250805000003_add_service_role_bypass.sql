-- Temporarily add service role bypass for admin operations
-- This ensures admin operations work while we debug RLS policies

-- Add service role policy for users table
CREATE POLICY "Service role can do anything on users"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add service role policy for profiles table  
CREATE POLICY "Service role can do anything on profiles"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Also add a bypass for authenticated users in admin context
-- Create a function to check admin role more reliably
CREATE OR REPLACE FUNCTION check_admin_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get role from current user's profile
    SELECT p.role INTO user_role
    FROM profiles p
    WHERE p.user_id = auth.uid();
    
    -- Return true if user is admin
    RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
    WHEN OTHERS THEN
        -- If any error occurs, return false for safety
        RETURN false;
END;
$$;

-- Update the delete policy for users to use the new function
DROP POLICY IF EXISTS "Allow admins to delete any user" ON users;
CREATE POLICY "Allow admins to delete any user"
ON users
FOR DELETE
TO authenticated
USING (check_admin_role());

-- Update the delete policy for profiles to use the new function  
DROP POLICY IF EXISTS "Allow users to delete own profile" ON profiles;
CREATE POLICY "Allow users to delete own profile"
ON profiles
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR check_admin_role()
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_admin_role() TO authenticated;
