-- Replace view with function to bypass RLS issues
-- Create function that returns stories with user data

-- Drop the problematic view
DROP VIEW IF EXISTS public.stories_with_users;

-- Create function instead of view
CREATE OR REPLACE FUNCTION public.get_stories_with_user_data()
RETURNS TABLE (
    id UUID,
    author_id UUID,
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(10),
    background_color VARCHAR(7),
    text_color VARCHAR(7),
    duration INTEGER,
    is_active BOOLEAN,
    views_count INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    user_id UUID,
    username VARCHAR(50),
    full_name TEXT,
    avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        p.user_id,
        p.username,
        p.full_name,
        p.avatar_url
    FROM public.stories s
    INNER JOIN public.profiles p ON s.author_id = p.user_id
    WHERE s.is_active = true
      AND s.expires_at > NOW()
    ORDER BY s.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_stories_with_user_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stories_with_user_data() TO anon;
