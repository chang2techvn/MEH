-- Fix RLS and user data issues
-- Run this in Supabase SQL Editor

-- 1. Update user role from 'staff' to 'admin' 
UPDATE public.users 
SET role = 'admin', account_status = 'approved', is_active = true
WHERE email = 'teacher1@university.edu';

-- 2. Also update profile role to match
UPDATE public.profiles 
SET role = 'admin'
WHERE user_id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';

-- 3. Check current data
SELECT 
  u.id, u.email, u.role as user_role, u.account_status, u.is_active,
  p.role as profile_role, p.full_name
FROM public.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'teacher1@university.edu';

-- 4. Verify RLS policies are working
-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'users';

-- 5. If needed, temporarily disable RLS for testing
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
