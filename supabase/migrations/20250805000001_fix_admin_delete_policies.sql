-- Fix admin delete policies for users and profiles
-- This migration allows admins to delete any user/profile

-- Add admin policies for profiles table
CREATE POLICY "Admins can delete any profile"
ON profiles
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.role = 'admin'
    )
);

-- Add admin policies for users table (if RLS is enabled)
-- First check if users table has RLS enabled
DO $$
BEGIN
    -- Enable RLS on users table if not already enabled
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Create admin policy for users table
    CREATE POLICY "Admins can delete any user"
    ON users
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
    );
    
    -- Allow admins to select any user
    CREATE POLICY "Admins can select any user"
    ON users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
        OR auth.uid() = id  -- Users can still see their own record
    );
    
    -- Allow admins to update any user
    CREATE POLICY "Admins can update any user"
    ON users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
        OR auth.uid() = id  -- Users can still update their own record
    );
    
    RAISE NOTICE 'Admin policies created for users table';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Some policies already exist, skipping...';
END $$;

-- Also add admin policies for profiles select/update
DO $$
BEGIN
    -- Allow admins to select any profile
    CREATE POLICY "Admins can select any profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
        OR auth.uid() = user_id  -- Users can still see their own profile
    );
    
    -- Allow admins to update any profile
    CREATE POLICY "Admins can update any profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
        OR auth.uid() = user_id  -- Users can still update their own profile
    );
    
    RAISE NOTICE 'Admin policies created for profiles table';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Some policies already exist, skipping...';
END $$;
