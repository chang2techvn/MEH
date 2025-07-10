-- Fix weekly points function to properly track latest post points
-- This migration updates the function to save latest post points and date

-- Update function to save latest post points and date
CREATE OR REPLACE FUNCTION update_weekly_points_on_post()
RETURNS TRIGGER AS $$
DECLARE
    week_start DATE;
    week_end DATE;
    post_points INTEGER;
BEGIN
    -- Only process if post has a score
    IF NEW.score IS NOT NULL AND NEW.score > 0 THEN
        -- Get the week boundaries for the post date
        week_start := get_week_start(NEW.created_at::DATE);
        week_end := get_week_end(NEW.created_at::DATE);
        post_points := NEW.score;
        
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
            NEW.user_id, 
            week_start, 
            week_end, 
            post_points, 
            1,
            post_points,
            NEW.created_at
        )
        ON CONFLICT (user_id, week_start_date)
        DO UPDATE SET
            total_points = weekly_points.total_points + EXCLUDED.total_points,
            posts_count = weekly_points.posts_count + EXCLUDED.posts_count,
            latest_post_points = EXCLUDED.latest_post_points,
            latest_post_date = EXCLUDED.latest_post_date,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
