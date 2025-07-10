-- Fix permissions for weekly_points table (v2)
-- This migration fixes the permission denied error for weekly_points table

-- Grant necessary permissions to the functions
GRANT SELECT, INSERT, UPDATE ON TABLE public.weekly_points TO postgres;
GRANT SELECT, INSERT, UPDATE ON TABLE public.weekly_points TO service_role;

-- Update the function to run with security definer privileges
CREATE OR REPLACE FUNCTION update_weekly_points_on_post()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_weekly_points_on_post ON public.posts;
CREATE TRIGGER trigger_update_weekly_points_on_post
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_points_on_post();

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION update_weekly_points_on_post() TO postgres;
GRANT EXECUTE ON FUNCTION update_weekly_points_on_post() TO service_role;
GRANT EXECUTE ON FUNCTION get_week_start(DATE) TO postgres;
GRANT EXECUTE ON FUNCTION get_week_start(DATE) TO service_role;
GRANT EXECUTE ON FUNCTION get_week_end(DATE) TO postgres;
GRANT EXECUTE ON FUNCTION get_week_end(DATE) TO service_role;

-- Also ensure the functions are security definer
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Get Monday of the week for the input date
    RETURN input_date - (EXTRACT(DOW FROM input_date) - 1)::INTEGER;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_week_end(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Get Sunday of the week for the input date
    RETURN input_date + (7 - EXTRACT(DOW FROM input_date))::INTEGER;
END;
$$ LANGUAGE plpgsql;
