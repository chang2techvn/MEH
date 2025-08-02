-- Update get_user_posts function to include media_urls field for better filter support
DROP FUNCTION IF EXISTS get_user_posts(UUID, INTEGER);

CREATE FUNCTION get_user_posts(user_id_param UUID, posts_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    content TEXT,
    title TEXT,
    media_url TEXT,
    media_urls JSONB,
    post_type TEXT,
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    likes_count INTEGER,
    comments_count INTEGER,
    ai_evaluation JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.content,
        p.title,
        p.media_url,
        p.media_urls,
        p.post_type,
        p.score,
        p.created_at,
        COALESCE(p.likes_count, 0)::INTEGER,
        COALESCE(p.comments_count, 0)::INTEGER,
        p.ai_evaluation
    FROM posts p
    WHERE p.user_id = user_id_param
    ORDER BY p.created_at DESC
    LIMIT posts_limit;
END;
$$;
