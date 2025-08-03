-- Fix RLS policies for profiles table to resolve access issues
-- This migration simplifies the policies to ensure proper access

-- Drop all existing policies first
DROP POLICY IF EXISTS "Students can view classmates profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile info" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create simplified policies that work properly
-- 1. Allow users to select their own profile
CREATE POLICY "Users can select own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Allow users to update their own profile  
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own profile (optional)
CREATE POLICY "Users can delete own profile" 
ON profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create a simple function to ensure profile exists for user
CREATE OR REPLACE FUNCTION ensure_user_profile(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if profile exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = user_id_param) THEN
        -- Create basic profile if it doesn't exist
        INSERT INTO profiles (
            user_id,
            role,
            level,
            streak_days,
            experience_points,
            total_posts,
            total_likes,
            total_comments,
            completed_challenges,
            created_at,
            updated_at
        )
        VALUES (
            user_id_param,
            'student',
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created basic profile for user %', user_id_param;
    END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION ensure_user_profile(UUID) TO authenticated;

-- Migration completed
DO $$
BEGIN
    RAISE NOTICE 'Profile policies have been simplified and fixed';
END $$;
