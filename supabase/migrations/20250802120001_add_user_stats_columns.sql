-- Add missing columns to profiles table for user stats
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0;

-- Add comments for the new columns
COMMENT ON COLUMN public.profiles.level IS 'User current level based on experience';
COMMENT ON COLUMN public.profiles.streak_days IS 'Current learning streak in days';
COMMENT ON COLUMN public.profiles.experience_points IS 'Total experience points earned';

-- Update existing users to have default values
UPDATE public.profiles 
SET 
  level = CASE 
    WHEN level IS NULL THEN 1 
    ELSE level 
  END,
  streak_days = CASE 
    WHEN streak_days IS NULL THEN 0 
    ELSE streak_days 
  END,
  experience_points = CASE 
    WHEN experience_points IS NULL THEN 0 
    ELSE experience_points 
  END
WHERE level IS NULL OR streak_days IS NULL OR experience_points IS NULL;
