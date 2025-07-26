-- Fix RLS policies for ai_assistants table
-- The issue is that authenticated users can't read ai_assistants

-- First, check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'ai_assistants';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'ai_assistants';

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Anonymous users can read active ai_assistants" ON public.ai_assistants;
DROP POLICY IF EXISTS "Authenticated users can read ai_assistants" ON public.ai_assistants;
DROP POLICY IF EXISTS "Service role can manage ai_assistants" ON public.ai_assistants;

-- Create comprehensive policies
-- 1. Allow everyone (anon and authenticated) to read active AI assistants
CREATE POLICY "Public can read active ai_assistants" ON public.ai_assistants
  FOR SELECT 
  TO public
  USING (is_active = true);

-- 2. Service role can do everything
CREATE POLICY "Service role full access" ON public.ai_assistants
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Authenticated users can also update stats
CREATE POLICY "Authenticated users can update stats" ON public.ai_assistants
  FOR UPDATE 
  TO authenticated
  USING (is_active = true)
  WITH CHECK (is_active = true);

-- Grant permissions explicitly
GRANT SELECT ON public.ai_assistants TO anon;
GRANT SELECT ON public.ai_assistants TO authenticated;
GRANT ALL ON public.ai_assistants TO service_role;
