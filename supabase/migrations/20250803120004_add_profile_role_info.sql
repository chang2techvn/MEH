-- Add user role, major, and class information to profiles table
-- This migration adds columns for storing additional user information

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student', 'staff')),
ADD COLUMN IF NOT EXISTS major TEXT,
ADD COLUMN IF NOT EXISTS class_name TEXT,
ADD COLUMN IF NOT EXISTS academic_year TEXT,
ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Add indexes for better performance on role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_major ON profiles (major) WHERE major IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_class ON profiles (class_name) WHERE class_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_academic_year ON profiles (academic_year) WHERE academic_year IS NOT NULL;

-- Create a function to update profile information
CREATE OR REPLACE FUNCTION update_profile_info(
    user_id_param UUID,
    role_param TEXT DEFAULT NULL,
    major_param TEXT DEFAULT NULL,
    class_name_param TEXT DEFAULT NULL,
    academic_year_param TEXT DEFAULT NULL,
    student_id_param TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles 
    SET 
        role = COALESCE(role_param, role),
        major = COALESCE(major_param, major),
        class_name = COALESCE(class_name_param, class_name),
        academic_year = COALESCE(academic_year_param, academic_year),
        student_id = COALESCE(student_id_param, student_id),
        updated_at = NOW()
    WHERE user_id = user_id_param;
    
    -- If no profile exists, create one
    IF NOT FOUND THEN
        INSERT INTO profiles (
            user_id, 
            role, 
            major, 
            class_name, 
            academic_year, 
            student_id,
            created_at,
            updated_at
        )
        VALUES (
            user_id_param,
            COALESCE(role_param, 'student'),
            major_param,
            class_name_param,
            academic_year_param,
            student_id_param,
            NOW(),
            NOW()
        );
    END IF;
    
    RAISE NOTICE 'Profile information updated for user %', user_id_param;
END;
$$;

-- Create RLS policies for role-based access
-- Drop existing policies first
DROP POLICY IF EXISTS "Students can view classmates profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile info" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Students can only see other students in their class
CREATE POLICY "Students can view classmates profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
    -- Allow users to see their own profile
    auth.uid() = user_id
    OR
    -- Allow users to see profiles based on their role
    CASE 
        -- Admins can see all profiles
        WHEN (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin' THEN true
        -- Teachers can see all student profiles and other teachers
        WHEN (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'teacher' THEN 
            role IN ('student', 'teacher')
        -- Staff can see student and teacher profiles
        WHEN (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'staff' THEN 
            role IN ('student', 'teacher')
        -- Students can see profiles in their class or other students
        WHEN (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'student' THEN 
            (role = 'student' AND class_name = (SELECT class_name FROM profiles WHERE user_id = auth.uid()))
            OR role IN ('teacher', 'admin')
        ELSE false
    END
);

-- Create policy for updating profiles
CREATE POLICY "Users can update their own profile info"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
TO authenticated
USING ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin');

-- Add some sample data for testing (optional - can be removed in production)
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- This is just for testing - in production, users will update their own profiles
    -- Get a sample user ID if exists
    SELECT user_id INTO sample_user_id FROM profiles LIMIT 1;
    
    IF sample_user_id IS NOT NULL THEN
        -- Update sample profile with role information
        PERFORM update_profile_info(
            sample_user_id,
            'student',
            'Computer Science',
            'CS-2024-A',
            '2024-2025',
            'CS2024001'
        );
        
        RAISE NOTICE 'Sample profile updated with role information';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not update sample profile: %', SQLERRM;
END $$;

-- Create a view for easy profile information retrieval
CREATE OR REPLACE VIEW profile_info AS
SELECT 
    p.user_id,
    p.full_name,
    p.bio,
    p.avatar_url,
    p.background_url,
    p.role,
    p.major,
    p.class_name,
    p.academic_year,
    p.student_id,
    p.level,
    p.experience_points,
    p.total_posts,
    p.total_likes,
    p.total_comments,
    p.streak_days,
    p.completed_challenges,
    p.created_at as joined_at,
    p.updated_at,
    CASE 
        WHEN p.role = 'admin' THEN 'Administrator'
        WHEN p.role = 'teacher' THEN 'Teacher'
        WHEN p.role = 'student' THEN 'Student'
        WHEN p.role = 'staff' THEN 'Staff'
        ELSE 'Student'
    END as role_display_name
FROM profiles p;

-- Grant necessary permissions
GRANT SELECT ON profile_info TO authenticated;
GRANT EXECUTE ON FUNCTION update_profile_info TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN profiles.role IS 'User role: admin, teacher, student, or staff';
COMMENT ON COLUMN profiles.major IS 'Academic major/specialization';
COMMENT ON COLUMN profiles.class_name IS 'Class name for students (e.g., CS-2024-A)';
COMMENT ON COLUMN profiles.academic_year IS 'Academic year (e.g., 2024-2025)';
COMMENT ON COLUMN profiles.student_id IS 'Student ID number';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Profile information migration completed successfully';
    RAISE NOTICE 'Added columns: role, major, class_name, academic_year, student_id';
    RAISE NOTICE 'Created function: update_profile_info';
    RAISE NOTICE 'Created view: profile_info';
    RAISE NOTICE 'Added RLS policies for role-based access';
END $$;
