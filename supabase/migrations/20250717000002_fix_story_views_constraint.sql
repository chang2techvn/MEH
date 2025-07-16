-- Fix unique constraint on story_views to allow multiple interactions per user per story

-- Drop the existing unique constraint
ALTER TABLE public.story_views DROP CONSTRAINT IF EXISTS story_views_story_id_viewer_id_key;

-- Create a new unique constraint that includes interaction_type
-- This allows same user to have view, reply, and reaction for same story
ALTER TABLE public.story_views 
ADD CONSTRAINT story_views_story_viewer_interaction_unique 
UNIQUE (story_id, viewer_id, interaction_type, reaction_type);

-- Note: This constraint allows:
-- - One view per user per story
-- - One reply per user per story  
-- - Multiple reactions per user per story (different reaction types)
-- - But prevents duplicate reactions of same type
