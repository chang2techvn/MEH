-- Fix permissions for Learning Goals tables
-- Grant service role access to all Learning Goals tables

-- Grant full access to service role for all Learning Goals tables
GRANT ALL PRIVILEGES ON public.learning_goals TO service_role;
GRANT ALL PRIVILEGES ON public.vocabulary_entries TO service_role;
GRANT ALL PRIVILEGES ON public.learning_progress TO service_role;
GRANT ALL PRIVILEGES ON public.study_streaks TO service_role;

-- Also ensure authenticated users have proper access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vocabulary_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_streaks TO authenticated;

-- Grant usage on sequences if they exist (PostgreSQL auto-creates them for some data types)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
