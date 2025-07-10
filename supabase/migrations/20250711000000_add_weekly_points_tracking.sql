-- Add weekly points tracking table
-- This migration adds a table to track user points earned per week

-- Create weekly_points table
CREATE TABLE IF NOT EXISTS public.weekly_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL, -- Monday of the week
    week_end_date DATE NOT NULL,   -- Sunday of the week
    total_points INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    latest_post_points INTEGER DEFAULT 0, -- Points from most recent post
    latest_post_date TIMESTAMP WITH TIME ZONE, -- Date of most recent post
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per week
    UNIQUE(user_id, week_start_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_points_user_id ON public.weekly_points(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_points_week_start ON public.weekly_points(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_points_user_week ON public.weekly_points(user_id, week_start_date DESC);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_weekly_points_updated_at ON public.weekly_points;
CREATE TRIGGER update_weekly_points_updated_at
    BEFORE UPDATE ON public.weekly_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to get current week start (Monday)
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
    -- Get Monday of the week for the input date
    RETURN input_date - (EXTRACT(DOW FROM input_date) - 1)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Create function to get current week end (Sunday)
CREATE OR REPLACE FUNCTION get_week_end(input_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
    -- Get Sunday of the week for the input date
    RETURN input_date + (7 - EXTRACT(DOW FROM input_date))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Create function to update weekly points when a post is created
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

-- Create trigger to automatically update weekly points when post is created
DROP TRIGGER IF EXISTS trigger_update_weekly_points_on_post ON public.posts;
CREATE TRIGGER trigger_update_weekly_points_on_post
    AFTER INSERT ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_points_on_post();

-- Grant permissions
GRANT SELECT ON TABLE public.weekly_points TO anon;
GRANT SELECT ON TABLE public.weekly_points TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.weekly_points TO authenticated;

-- Add RLS policies
ALTER TABLE public.weekly_points ENABLE ROW LEVEL SECURITY;

-- Users can read their own weekly points
CREATE POLICY "Users can read own weekly points" ON public.weekly_points
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own weekly points (via trigger)
CREATE POLICY "Users can insert own weekly points" ON public.weekly_points
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own weekly points (via trigger)
CREATE POLICY "Users can update own weekly points" ON public.weekly_points
    FOR UPDATE USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.weekly_points IS 'Tracks user points earned per week (Monday to Sunday)';
