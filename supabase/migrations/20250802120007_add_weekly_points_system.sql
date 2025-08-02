-- Create function to calculate and update weekly points
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
        week_end_date = current_week_start + INTERVAL '6 days',
        total_points = total_week_points_var,
        latest_post_points = COALESCE(latest_post_points_var, 0),
        latest_post_date = latest_post_date_var,
        updated_at = NOW();
        
    RAISE NOTICE 'Updated weekly points for user %: total=%, latest=%, date=%', 
        user_id_param, total_week_points_var, COALESCE(latest_post_points_var, 0), latest_post_date_var;
END;
$$;

-- Create weekly_points table if it doesn't exist, or alter existing one
DO $$
BEGIN
    -- Check if table exists and alter it
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_points') THEN
        -- Make week_end_date nullable or add default value
        ALTER TABLE weekly_points ALTER COLUMN week_end_date DROP NOT NULL;
        -- Or set a default value
        UPDATE weekly_points SET week_end_date = week_start_date + INTERVAL '6 days' WHERE week_end_date IS NULL;
    ELSE
        -- Create new table
        CREATE TABLE weekly_points (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            week_start_date DATE NOT NULL,
            week_end_date DATE,
            total_points INTEGER DEFAULT 0,
            latest_post_points INTEGER DEFAULT 0,
            latest_post_date TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, week_start_date)
        );
    END IF;
END $$;

-- Create trigger to update weekly points when posts change
CREATE OR REPLACE FUNCTION trigger_update_weekly_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update weekly points for the post owner
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_weekly_points(NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_weekly_points(OLD.user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_weekly_points_on_post_change ON posts;

-- Create trigger for posts table
CREATE TRIGGER update_weekly_points_on_post_change
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_weekly_points();

-- Initialize weekly points for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM posts 
        WHERE user_id IS NOT NULL
        AND created_at >= date_trunc('week', CURRENT_DATE) + INTERVAL '1 day'
    LOOP
        PERFORM update_weekly_points(user_record.user_id);
    END LOOP;
    
    RAISE NOTICE 'Initialized weekly points for existing users';
END $$;
