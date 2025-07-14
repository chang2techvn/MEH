-- Fix Stories and Profiles Relationship
-- This migration creates proper foreign key relationship between stories and profiles

-- First, ensure all existing stories have valid author_id that exists in profiles
-- Remove any orphaned stories (if any)
DELETE FROM public.stories 
WHERE author_id NOT IN (SELECT user_id FROM public.profiles);

-- Ensure profiles.user_id is unique (it should be since it references auth.users.id)
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_unique;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Add foreign key constraint from stories.author_id to profiles.user_id
ALTER TABLE public.stories 
DROP CONSTRAINT IF EXISTS fk_stories_author_profiles;

ALTER TABLE public.stories 
ADD CONSTRAINT fk_stories_author_profiles 
FOREIGN KEY (author_id) REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

-- Update the stories view to use proper join
DROP VIEW IF EXISTS public.stories_with_users;

CREATE VIEW public.stories_with_users AS
SELECT 
    s.*,
    p.user_id,
    p.username,
    p.full_name,
    p.avatar_url
FROM public.stories s
INNER JOIN public.profiles p ON s.author_id = p.user_id
WHERE s.is_active = true
  AND s.expires_at > NOW();

-- Grant permissions on the view
GRANT SELECT ON public.stories_with_users TO authenticated;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_active_expires ON public.stories(is_active, expires_at);
