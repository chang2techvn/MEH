-- Alternative approach: Temporarily disable RLS on users table for conversations
-- This is a simpler fix while we debug the RLS policy issue

-- Option 1: Disable RLS entirely on users table (temporary fix)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a more permissive policy for authenticated users
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view participants in shared conversations" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;

-- Create a simple policy that allows authenticated users to view all users
-- This is more open but safer than disabling RLS entirely
CREATE POLICY "Authenticated users can view all users" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- Keep restrictive policies for modifications
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Enable insert for registration" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());

-- Alternative: If you want to disable RLS entirely, uncomment this line:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
