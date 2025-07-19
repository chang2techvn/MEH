-- Migration: Fix user_generated challenges duplicate constraint
-- This allows users to create challenges from the same YouTube videos
-- while still preventing duplicate practice challenges

-- Drop the existing restrictive constraint
DROP INDEX IF EXISTS challenges_practice_video_unique_idx;

-- Create new constraints that are more appropriate:

-- 1. For practice challenges: still prevent same video on same date (curriculum integrity)
CREATE UNIQUE INDEX challenges_practice_video_unique_idx ON public.challenges 
USING btree (date, challenge_type, video_url) 
WHERE (challenge_type = 'practice'::text);

-- 2. For user_generated challenges: allow multiple users to use same video, 
--    but prevent same user from creating duplicate challenges with same video on same date
CREATE UNIQUE INDEX challenges_user_generated_unique_idx ON public.challenges 
USING btree (date, challenge_type, video_url, user_id) 
WHERE (challenge_type = 'user_generated'::text);

-- This allows:
-- ✅ Multiple users to create challenges from the same YouTube video
-- ✅ Same user to create challenges from same video on different dates  
-- ❌ Same user creating duplicate challenges from same video on same date (prevents spam)
-- ❌ Practice challenges using same video on same date (maintains curriculum)
