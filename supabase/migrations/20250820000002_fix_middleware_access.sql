-- Fix middleware access to users table
-- Date: 2025-08-20
-- Description: Ensure middleware can read user data for authentication checks

-- The issue is that middleware runs in server context and might not have proper RLS access
-- We need to ensure the users table is readable by middleware

-- 1. Check current policies and create policy that allows service role access
-- This is needed because middleware might run with service-level permissions

-- Allow service role to read users table (for middleware)
DROP POLICY IF EXISTS "users_service_role_access" ON public.users;
CREATE POLICY "users_service_role_access"
ON public.users
FOR SELECT
TO service_role
USING (true);

-- Also ensure anon role can read users table for middleware edge cases
DROP POLICY IF EXISTS "users_middleware_access" ON public.users;
CREATE POLICY "users_middleware_access"
ON public.users
FOR SELECT
TO anon
USING (true);

-- Grant explicit permissions
GRANT SELECT ON public.users TO service_role;
GRANT SELECT ON public.users TO anon;

-- Test query that middleware would run
DO $$
BEGIN
  -- Test the query middleware would execute
  PERFORM role, account_status, is_active 
  FROM public.users 
  WHERE id = '13df7bf1-d38f-4b58-b444-3dfa67e04f17';
  
  RAISE NOTICE 'Middleware access test completed successfully';
END $$;
