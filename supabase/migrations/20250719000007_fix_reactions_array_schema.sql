-- Change story_views to support multiple reactions in single record
-- Add reactions array column and update constraints

-- Drop the current reaction constraint
ALTER TABLE public.story_views DROP CONSTRAINT IF EXISTS story_views_reaction_unique;

-- Add reactions array column to store multiple reactions
ALTER TABLE public.story_views 
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::jsonb;

-- Create index for reactions array
CREATE INDEX IF NOT EXISTS idx_story_views_reactions_gin ON public.story_views USING GIN (reactions);

-- Clean up duplicate reaction records - merge them into reactions array
-- First, collect all reactions for each user per story
UPDATE public.story_views 
SET reactions = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'emoji', reaction_type,
      'timestamp', COALESCE(reacted_at, viewed_at)
    )
  )
  FROM public.story_views sv2 
  WHERE sv2.story_id = story_views.story_id 
    AND sv2.viewer_id = story_views.viewer_id
    AND sv2.interaction_type = 'reaction'
    AND sv2.reaction_type IS NOT NULL
)
WHERE interaction_type = 'reaction';

-- Delete duplicate reaction records, keep only one per user per story
DELETE FROM public.story_views 
WHERE id NOT IN (
  SELECT DISTINCT ON (story_id, viewer_id, interaction_type) id
  FROM public.story_views 
  ORDER BY story_id, viewer_id, interaction_type, reacted_at DESC NULLS LAST, viewed_at DESC
);

-- Create unique constraint for user interactions (one record per user per story)
-- This allows: one view record, one reply record, one reaction record per user per story
CREATE UNIQUE INDEX IF NOT EXISTS story_views_user_story_unique 
ON public.story_views (story_id, viewer_id, interaction_type);

-- Note: Now each user will have max 3 records per story:
-- 1 view record, 1 reply record, 1 reaction record
-- The reaction record contains array of all reactions
