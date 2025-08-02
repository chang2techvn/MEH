-- Fix weekly points function to not add default points for posts without scores
-- This ensures consistent point calculation across frontend and backend

-- Update the function to use 0 instead of 10 for posts without scores
CREATE OR REPLACE FUNCTION update_weekly_points(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_week_start DATE;
    latest_post_points_var INTEGER := 0;
    total_week_points_var INTEGER := 0;
    latest_post_date_var TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current week start (Monday)
    current_week_start := date_trunc('week', CURRENT_DATE) + INTERVAL '1 day';
    
    -- Get latest post this week with points (use actual points only, no defaults)
    SELECT p.created_at, COALESCE(p.score, 0) -- Use 0 for posts without score
    INTO latest_post_date_var, latest_post_points_var
    FROM posts p
    WHERE p.user_id = user_id_param 
      AND p.created_at >= current_week_start 
      AND p.created_at < current_week_start + INTERVAL '7 days'
    ORDER BY p.created_at DESC 
    LIMIT 1;
    
    -- Calculate total points this week (sum actual scores only, no defaults)
    SELECT COALESCE(SUM(COALESCE(p.score, 0)), 0) 
    INTO total_week_points_var
    FROM posts p
    WHERE p.user_id = user_id_param 
      AND p.created_at >= current_week_start 
      AND p.created_at < current_week_start + INTERVAL '7 days';
    
    -- Insert or update weekly points
    INSERT INTO weekly_points (
        user_id, 
        week_start_date,
        week_end_date, 
        total_points, 
        latest_post_points, 
        latest_post_date,
        updated_at
    )
    VALUES (
        user_id_param,
        current_week_start,
        current_week_start + INTERVAL '6 days',
        total_week_points_var,
        COALESCE(latest_post_points_var, 0),
        latest_post_date_var,
        NOW()
    )
    ON CONFLICT (user_id, week_start_date)
    DO UPDATE SET
        total_points = EXCLUDED.total_points,
        latest_post_points = EXCLUDED.latest_post_points,
        latest_post_date = EXCLUDED.latest_post_date,
        updated_at = NOW();
END;
$$;

-- Refresh all weekly points data with the corrected calculation
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Update weekly points for all users
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM posts 
        WHERE created_at >= date_trunc('week', CURRENT_DATE) + INTERVAL '1 day'
    LOOP
        PERFORM update_weekly_points(user_record.user_id);
    END LOOP;
END;
$$;

-- Comment: This migration fixes the inconsistency where weekly_points function
-- was adding 10 points for posts without scores, while the frontend was showing 0.
-- Now both backend and frontend will consistently show 0 for posts without scores.
