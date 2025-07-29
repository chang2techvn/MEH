-- Migration: Drop unused study_streaks table
-- Created: 2025-07-30
-- Description: Remove study_streaks table and related objects as they are not used in the application

-- Drop trigger first
DROP TRIGGER IF EXISTS update_study_streaks_updated_at ON public.study_streaks;

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.study_streaks;
DROP POLICY IF EXISTS "Users can insert their own streaks" ON public.study_streaks;
DROP POLICY IF EXISTS "Users can update their own streaks" ON public.study_streaks;

-- Drop function that updates study streaks (if not used elsewhere)
DROP FUNCTION IF EXISTS public.update_study_streak(uuid, text);

-- Drop indexes
DROP INDEX IF EXISTS public.idx_study_streaks_user_id;

-- Drop table
DROP TABLE IF EXISTS public.study_streaks;

-- Remove comments (they will be dropped with the table, but for completeness)
-- No need to explicitly drop comments as they're tied to the table

COMMENT ON SCHEMA public IS 'Cleaned up unused study_streaks table and related objects';
