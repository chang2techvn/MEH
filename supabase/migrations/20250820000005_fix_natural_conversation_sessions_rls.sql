-- Fix RLS policies for natural_conversation_sessions table
-- Drop existing policies if any
DROP POLICY IF EXISTS "natural_conversation_sessions_select_policy" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "natural_conversation_sessions_insert_policy" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "natural_conversation_sessions_update_policy" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "natural_conversation_sessions_delete_policy" ON public.natural_conversation_sessions;

-- Enable RLS
ALTER TABLE public.natural_conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for natural_conversation_sessions
CREATE POLICY "natural_conversation_sessions_select_policy" ON public.natural_conversation_sessions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "natural_conversation_sessions_insert_policy" ON public.natural_conversation_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "natural_conversation_sessions_update_policy" ON public.natural_conversation_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "natural_conversation_sessions_delete_policy" ON public.natural_conversation_sessions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Also ensure profiles table has proper policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies for profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Success notice
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Natural conversation sessions and profiles RLS policies fixed';
END $$;
