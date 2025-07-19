-- Remove unused points column from challenges table
-- Analysis shows this column is not used in any UI components or logic

-- Drop any views that depend on the points column
DROP VIEW IF EXISTS daily_challenges_view CASCADE;
DROP VIEW IF EXISTS practice_challenges_view CASCADE;
DROP VIEW IF EXISTS user_challenges_view CASCADE;

-- Drop the points column and its constraint
ALTER TABLE public.challenges 
DROP CONSTRAINT IF EXISTS challenges_points_check;

ALTER TABLE public.challenges 
DROP COLUMN IF EXISTS points;

-- Note: The points column was originally planned for a reward system
-- but is currently not implemented in the frontend or used in any scoring logic.
-- Challenge scoring is handled separately via challenge_submissions.points_earned
