-- Migration: Fix user role mismatch and RLS access
-- Date: 2025-08-20
-- Description: Fix role inconsistency between users and profiles tables, and ensure auth context can read user data

-- 1. Fix role mismatch for teacher1@university.edu
-- Update profile role to match users table role
UPDATE public.profiles 
SET 
  role = 'admin',
  updated_at = now()
WHERE user_id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17'
AND role != 'admin';

-- 2. Fix any other role mismatches between users and profiles tables
-- Sync all profiles to match their corresponding users table role
UPDATE public.profiles 
SET 
  role = users.role,
  updated_at = now()
FROM public.users 
WHERE profiles.user_id = users.id 
AND profiles.role != users.role;

-- 3. Ensure all admin users in users table have proper status
UPDATE public.users 
SET 
  account_status = 'approved',
  is_active = true,
  updated_at = now()
WHERE role = 'admin' 
AND (account_status != 'approved' OR is_active != true);

-- 4. Fix specific RLS issue - ensure authenticated users can read from users table
-- The current policy might be too restrictive for auth context
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;

-- Create new policy that allows authenticated users to read user data
-- This is needed for auth context to work properly
CREATE POLICY "users_select_authenticated" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- 5. Also ensure users can read their own profile data
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

CREATE POLICY "profiles_select_own" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 6. Allow authenticated users to read all profiles (needed for admin functionality)
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;

CREATE POLICY "profiles_select_authenticated" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 7. Grant necessary permissions
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- 8. Create function to sync roles between tables (for future use)
CREATE OR REPLACE FUNCTION sync_user_profile_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profiles to match users table roles
  UPDATE public.profiles 
  SET 
    role = users.role,
    updated_at = now()
  FROM public.users 
  WHERE profiles.user_id = users.id 
  AND profiles.role != users.role;
  
  RAISE NOTICE 'User-Profile role sync completed';
END;
$$;

-- 9. Create trigger to automatically sync roles when users table role changes
CREATE OR REPLACE FUNCTION sync_role_on_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If role changed, update corresponding profile
  IF OLD.role != NEW.role THEN
    UPDATE public.profiles 
    SET 
      role = NEW.role,
      updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS sync_role_trigger ON public.users;
CREATE TRIGGER sync_role_trigger
  AFTER UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_on_user_update();

-- 10. Verify the fix
DO $$
DECLARE
  user_role text;
  profile_role text;
BEGIN
  -- Check if the specific user now has consistent roles
  SELECT u.role, p.role INTO user_role, profile_role
  FROM public.users u
  JOIN public.profiles p ON u.id = p.user_id
  WHERE u.id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';
  
  IF user_role = profile_role AND user_role = 'admin' THEN
    RAISE NOTICE 'SUCCESS: User teacher1@university.edu now has consistent admin role in both tables';
  ELSE
    RAISE NOTICE 'WARNING: Role mismatch still exists - users.role: %, profiles.role: %', user_role, profile_role;
  END IF;
END $$;

-- 11. Add helpful comments
COMMENT ON POLICY "users_select_authenticated" ON public.users IS 'Allow authenticated users to read user data - required for auth context';
COMMENT ON POLICY "profiles_select_authenticated" ON public.profiles IS 'Allow authenticated users to read profile data - required for admin functionality';
COMMENT ON FUNCTION sync_user_profile_roles() IS 'Manually sync roles between users and profiles tables';
COMMENT ON FUNCTION sync_role_on_user_update() IS 'Automatically sync profile role when user role changes';
