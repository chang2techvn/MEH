-- Backfill weekly points from existing posts
-- This migration creates a function to populate weekly_points from existing posts

-- Create function to backfill weekly points
CREATE OR REPLACE FUNCTION backfill_weekly_points()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    post_record RECORD;
    week_start DATE;
    week_end DATE;
    post_points INTEGER;
    processed_count INTEGER := 0;
BEGIN
    -- Loop through all posts with scores
    FOR post_record IN 
        SELECT id, user_id, score, created_at 
        FROM posts 
        WHERE score IS NOT NULL AND score > 0
        ORDER BY created_at DESC
    LOOP
        -- Calculate week boundaries for this post
        week_start := get_week_start(post_record.created_at::DATE);
        week_end := get_week_end(post_record.created_at::DATE);
        post_points := post_record.score;
        
        -- Insert or update weekly points record
        INSERT INTO public.weekly_points (
            user_id, 
            week_start_date, 
            week_end_date, 
            total_points, 
            posts_count,
            latest_post_points,
            latest_post_date
        )
        VALUES (
            post_record.user_id, 
            week_start, 
            week_end, 
            post_points, 
            1,
            post_points,
            post_record.created_at
        )
        ON CONFLICT (user_id, week_start_date)
        DO UPDATE SET
            total_points = weekly_points.total_points + EXCLUDED.total_points,
            posts_count = weekly_points.posts_count + EXCLUDED.posts_count,
            latest_post_points = CASE 
                WHEN EXCLUDED.latest_post_date > weekly_points.latest_post_date 
                THEN EXCLUDED.latest_post_points 
                ELSE weekly_points.latest_post_points 
            END,
            latest_post_date = CASE 
                WHEN EXCLUDED.latest_post_date > weekly_points.latest_post_date 
                THEN EXCLUDED.latest_post_date 
                ELSE weekly_points.latest_post_date 
            END,
            updated_at = NOW();
            
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION backfill_weekly_points() TO authenticated;
GRANT EXECUTE ON FUNCTION backfill_weekly_points() TO anon;

-- Run the backfill function
SELECT backfill_weekly_points() as processed_posts;

-- Add comment
COMMENT ON FUNCTION backfill_weekly_points() IS 'Backfills weekly_points table from existing posts with scores';
