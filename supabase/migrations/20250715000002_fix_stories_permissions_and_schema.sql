-- Fix Stories Permissions and Schema Issues
-- This migration addresses:
-- 1. Permission denied for stories tables
-- 2. Missing username column in users table for joins
-- 3. RLS policies that are too restrictive

-- Grant basic SELECT permissions to authenticated users for stories
GRANT SELECT ON public.stories TO authenticated;
GRANT SELECT ON public.story_views TO authenticated;
GRANT INSERT ON public.stories TO authenticated;
GRANT INSERT ON public.story_views TO authenticated;
GRANT UPDATE ON public.stories TO authenticated;

-- Grant USAGE on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Update RLS policies for stories to be more permissive for testing
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;
CREATE POLICY "Stories are viewable by authenticated users" 
    ON public.stories FOR SELECT 
    TO authenticated
    USING (true); -- Allow all authenticated users to view stories

DROP POLICY IF EXISTS "Users can insert their own stories" ON public.stories;
CREATE POLICY "Authenticated users can insert stories" 
    ON public.stories FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own stories" ON public.stories;
CREATE POLICY "Users can update their own stories" 
    ON public.stories FOR UPDATE 
    TO authenticated
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;
CREATE POLICY "Users can delete their own stories" 
    ON public.stories FOR DELETE 
    TO authenticated
    USING (auth.uid() = author_id);

-- Update RLS policies for story_views to be more permissive
DROP POLICY IF EXISTS "Story views are viewable by story author and viewer" ON public.story_views;
CREATE POLICY "Story views are viewable by authenticated users" 
    ON public.story_views FOR SELECT 
    TO authenticated
    USING (true); -- Allow all authenticated users to view story views

DROP POLICY IF EXISTS "Users can insert their own story views" ON public.story_views;
CREATE POLICY "Authenticated users can insert story views" 
    ON public.story_views FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = viewer_id);

-- Ensure users table has username column (check profiles table structure instead)
-- The username should come from profiles table, not users table directly

-- Create a view for easier story queries with user information
CREATE OR REPLACE VIEW stories_with_users AS
SELECT 
    s.*,
    p.username,
    p.full_name,
    p.avatar_url
FROM public.stories s
LEFT JOIN public.profiles p ON s.author_id = p.user_id
WHERE s.is_active = true AND s.expires_at > NOW();

-- Grant access to the view
GRANT SELECT ON stories_with_users TO authenticated;

-- Create a function to get stories with user data (for the API)
CREATE OR REPLACE FUNCTION get_stories_with_users()
RETURNS TABLE (
    id UUID,
    author_id UUID,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    background_color TEXT,
    text_color TEXT,
    duration INTEGER,
    is_active BOOLEAN,
    views_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        s.id,
        s.author_id,
        s.content,
        s.media_url,
        s.media_type,
        s.background_color,
        s.text_color,
        s.duration,
        s.is_active,
        s.views_count,
        s.created_at,
        s.updated_at,
        s.expires_at,
        p.username,
        p.full_name,
        p.avatar_url
    FROM public.stories s
    LEFT JOIN public.profiles p ON s.author_id = p.user_id
    WHERE s.is_active = true AND s.expires_at > NOW()
    ORDER BY s.created_at DESC;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_stories_with_users() TO authenticated;

-- Create function to get active stories (not expired)
CREATE OR REPLACE FUNCTION get_active_stories()
RETURNS TABLE (
    id UUID,
    author_id UUID,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    views_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        s.id,
        s.author_id,
        s.content,
        s.media_url,
        s.media_type,
        s.views_count,
        s.created_at,
        p.username,
        p.full_name,
        p.avatar_url
    FROM public.stories s
    LEFT JOIN public.profiles p ON s.author_id = p.user_id
    WHERE s.is_active = true 
    AND s.expires_at > NOW()
    ORDER BY s.created_at DESC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_active_stories() TO authenticated;

-- Create function to get expired stories
CREATE OR REPLACE FUNCTION get_expired_stories()
RETURNS TABLE (
    id UUID,
    author_id UUID,
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    username TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        s.id,
        s.author_id,
        s.content,
        s.media_url,
        s.created_at,
        s.expires_at,
        p.username
    FROM public.stories s
    LEFT JOIN public.profiles p ON s.author_id = p.user_id
    WHERE s.expires_at <= NOW()
    ORDER BY s.expires_at DESC
    LIMIT 50;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_expired_stories() TO authenticated;

-- Create indexes for better performance with the joins
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_author_active ON public.stories(author_id, is_active, expires_at);

-- Update function to mark story as viewed
CREATE OR REPLACE FUNCTION mark_story_viewed(story_id UUID, viewer_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert view record (ignore if already exists)
    INSERT INTO public.story_views (story_id, viewer_id)
    VALUES (story_id, viewer_id)
    ON CONFLICT (story_id, viewer_id) DO NOTHING;
    
    -- Update views count
    UPDATE public.stories 
    SET views_count = views_count + 1
    WHERE id = story_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_story_viewed(UUID, UUID) TO authenticated;

-- Comment to document this migration
COMMENT ON FUNCTION get_stories_with_users() IS 'Returns active stories with user profile information';
COMMENT ON FUNCTION get_active_stories() IS 'Returns only active (non-expired) stories with user info';
COMMENT ON FUNCTION get_expired_stories() IS 'Returns expired stories for cleanup or analytics';
COMMENT ON FUNCTION mark_story_viewed(UUID, UUID) IS 'Marks a story as viewed by a user and increments view count';
