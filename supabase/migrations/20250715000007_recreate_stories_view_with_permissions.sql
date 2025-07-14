-- Recreate stories_with_users view with proper permissions
-- Drop and recreate to ensure permissions are applied correctly

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
GRANT SELECT ON public.stories_with_users TO anon;
