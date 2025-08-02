-- Create a function to manually refresh user stats (for testing/admin use)
CREATE OR REPLACE FUNCTION refresh_all_user_stats()
RETURNS TABLE(user_id UUID, posts INTEGER, likes INTEGER, comments INTEGER, challenges INTEGER, level INTEGER, xp INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    result_record RECORD;
BEGIN
    -- Loop through all users who have posts
    FOR user_record IN 
        SELECT DISTINCT p.user_id 
        FROM posts p
        WHERE p.user_id IS NOT NULL
    LOOP
        -- Update stats for each user
        PERFORM update_user_stats(user_record.user_id);
        
        -- Get updated stats to return
        SELECT 
            pr.user_id,
            pr.total_posts,
            pr.total_likes, 
            pr.total_comments,
            pr.completed_challenges,
            pr.level,
            pr.experience_points
        INTO result_record
        FROM profiles pr 
        WHERE pr.user_id = user_record.user_id;
        
        -- Return the row
        user_id := result_record.user_id;
        posts := result_record.total_posts;
        likes := result_record.total_likes;
        comments := result_record.total_comments;
        challenges := result_record.completed_challenges;
        level := result_record.level;
        xp := result_record.experience_points;
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;

-- Create a function to get current stats for a specific user
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE(
    total_posts INTEGER,
    total_likes INTEGER, 
    total_comments INTEGER,
    completed_challenges INTEGER,
    level INTEGER,
    experience_points INTEGER,
    streak_days INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(p.total_posts, 0)::INTEGER,
        COALESCE(p.total_likes, 0)::INTEGER,
        COALESCE(p.total_comments, 0)::INTEGER,
        COALESCE(p.completed_challenges, 0)::INTEGER,
        COALESCE(p.level, 1)::INTEGER,
        COALESCE(p.experience_points, 0)::INTEGER,
        COALESCE(p.streak_days, 0)::INTEGER,
        p.updated_at
    FROM profiles p
    WHERE p.user_id = user_id_param;
END;
$$;
