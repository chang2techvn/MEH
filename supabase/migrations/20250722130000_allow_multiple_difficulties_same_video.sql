-- Migration: Allow users to create challenges with different difficulties from same video
-- This allows the same user to create multiple challenges from the same video
-- with different difficulty levels on the same day

-- Drop the existing constraint that prevents different difficulty levels
DROP INDEX IF EXISTS challenges_user_generated_unique_idx;

-- Create new constraint that includes difficulty level
-- This allows:
-- ✅ Same user to create challenges from same video with different difficulties on same day
-- ✅ Multiple users to create challenges from the same YouTube video
-- ✅ Same user to create challenges from same video on different dates  
-- ❌ Same user creating exact duplicate challenges (same video + same difficulty) on same date (prevents spam)

CREATE UNIQUE INDEX challenges_user_generated_unique_idx ON public.challenges 
USING btree (date, challenge_type, video_url, user_id, difficulty) 
WHERE (challenge_type = 'user_generated'::text);

-- Now the uniqueness check includes:
-- - date: same day
-- - challenge_type: user_generated
-- - video_url: same video
-- - user_id: same user
-- - difficulty: same difficulty level
-- 
-- So a user can create:
-- ✅ Video A - Beginner
-- ✅ Video A - Intermediate  
-- ✅ Video A - Advanced
-- ❌ Video A - Beginner (duplicate)
