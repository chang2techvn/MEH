
-- Fix admin users and ensure they can access the system
-- Run this in Supabase SQL Editor

-- 1. Ensure all admin users are active and approved
UPDATE public.users 
SET 
  is_active = true,
  account_status = 'approved',
  updated_at = now()
WHERE role = 'admin';

-- 2. Check current admin users
SELECT 
  id, email, name, role, is_active, account_status, created_at
FROM public.users 
WHERE role = 'admin';

-- 3. If you need to promote a user to admin:
-- UPDATE public.users 
-- SET role = 'admin', account_status = 'approved', is_active = true
-- WHERE email = 'your-email@example.com';

-- 4. Verify RLS policies are working
-- This should return data when run as authenticated user:
-- SELECT id, email, role FROM public.users LIMIT 5;
