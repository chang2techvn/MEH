supabase\migrations-- Fix user role mismatch and RLS issues
-- User teacher1@university.edu has admin role in users table but staff role in profiles table

-- 1. Update profile role to match users table
UPDATE public.profiles 
SET role = 'admin'
WHERE user_id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';

-- 2. Check and fix any other role mismatches
UPDATE public.profiles 
SET role = users.role
FROM public.users 
WHERE profiles.user_id = users.id 
AND profiles.role != users.role;

-- 3. Ensure RLS allows authenticated users to read their own data from users table
-- Check current policies
\d+ public.users

-- 4. Test if the specific user can read from users table
SELECT role, account_status, is_active 
FROM public.users 
WHERE id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';

-- 5. Verify profile data
SELECT role, full_name 
FROM public.profiles 
WHERE user_id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';
