-- Fix profiles constraint and recreate profiles with correct user_id
-- This migration fixes the proficiency_level constraint issue

-- First, check what proficiency levels are allowed
DO $$
DECLARE
    constraint_def text;
BEGIN
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint 
    WHERE conname = 'profiles_proficiency_level_check';
    
    RAISE NOTICE 'Current proficiency level constraint: %', constraint_def;
END $$;

-- Drop the existing constraint and create a new one that includes 'advanced'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_proficiency_level_check;

-- Add new constraint that allows all needed levels
ALTER TABLE profiles ADD CONSTRAINT profiles_proficiency_level_check 
CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- Now delete all existing profiles (they have wrong structure anyway)
DELETE FROM profiles;

-- Create new profiles with correct user_id and valid proficiency levels
INSERT INTO profiles (
    user_id,
    username,
    full_name,
    avatar_url,
    bio,
    native_language,
    target_language,
    proficiency_level,
    timezone,
    created_at,
    updated_at
)
SELECT 
    u.id as user_id,
    LOWER(SPLIT_PART(u.email, '@', 1)) as username,
    CASE 
        WHEN u.email = 'john.smith@university.edu' THEN 'John Smith'
        WHEN u.email = 'maria.garcia@university.edu' THEN 'Maria Garcia'
        WHEN u.email = 'david.johnson@university.edu' THEN 'David Johnson'
        WHEN u.email = 'yuki.tanaka@university.edu' THEN 'Yuki Tanaka'
        WHEN u.email = 'ahmed.hassan@university.edu' THEN 'Ahmed Hassan'
        WHEN u.email = 'teacher1@university.edu' THEN 'Prof. Sarah Wilson'
        WHEN u.email = 'teacher2@university.edu' THEN 'Prof. Michael Brown'
        WHEN u.email = 'admin@university.edu' THEN 'Admin User'
        ELSE INITCAP(REPLACE(SPLIT_PART(u.email, '@', 1), '.', ' '))
    END as full_name,
    '/placeholder-user.jpg' as avatar_url,
    'Learning English together!' as bio,
    'English' as native_language,
    'English' as target_language,
    CASE 
        WHEN u.role = 'teacher' THEN 'advanced'
        WHEN u.role = 'admin' THEN 'expert'  -- Changed from 'native' to 'expert'
        ELSE 'intermediate'
    END as proficiency_level,
    'UTC' as timezone,
    COALESCE(u.created_at, NOW()) as created_at,
    NOW() as updated_at
FROM public.users u
ORDER BY u.email;

-- Verify the new profiles
DO $$
DECLARE
    profile_count INTEGER;
    user_count INTEGER;
    profile_record RECORD;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    RAISE NOTICE 'Created % profiles for % users', profile_count, user_count;
    
    FOR profile_record IN 
        SELECT p.user_id, p.username, p.full_name, u.email, u.role
        FROM profiles p
        JOIN users u ON p.user_id = u.id
        ORDER BY u.email
    LOOP
        RAISE NOTICE 'Email: %, Role: %, Username: %, Name: %', 
                    profile_record.email,
                    profile_record.role,
                    profile_record.username, 
                    profile_record.full_name;
    END LOOP;
    
    IF user_count = profile_count THEN
        RAISE NOTICE '✅ SUCCESS: All users now have matching profiles with correct user_id!';
    ELSE
        RAISE WARNING '❌ MISMATCH: User count (%) != Profile count (%)', user_count, profile_count;
    END IF;
END $$;
