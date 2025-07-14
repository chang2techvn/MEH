-- Fix permission for stories_with_users view
-- Grant permission to authenticated users

GRANT SELECT ON public.stories_with_users TO authenticated;
