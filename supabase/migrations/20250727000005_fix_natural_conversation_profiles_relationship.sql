-- Fix the relationship between natural_conversation_sessions and profiles
-- The issue is that the foreign key relationship is not properly defined for PostgREST queries

-- First, let's make sure the profiles table has the correct foreign key
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Now let's add a proper view or ensure the relationship is queryable
-- The issue is that PostgREST needs to understand the relationship path
-- We need to create a proper foreign key name that PostgREST can understand

-- Alternative approach: Create a view that makes the relationship clear
CREATE OR REPLACE VIEW public.natural_conversation_sessions_with_profiles AS
SELECT 
    ncs.*,
    p.full_name,
    p.avatar_url,
    p.username
FROM public.natural_conversation_sessions ncs
LEFT JOIN public.profiles p ON ncs.user_id = p.user_id;

-- Grant permissions on the view
GRANT SELECT ON public.natural_conversation_sessions_with_profiles TO authenticated;
GRANT SELECT ON public.natural_conversation_sessions_with_profiles TO anon;

-- Enable RLS on the view (inherit from base table)
ALTER VIEW public.natural_conversation_sessions_with_profiles SET (security_invoker = true);

-- Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_lookup ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_natural_conversation_sessions_user_id ON public.natural_conversation_sessions(user_id);
