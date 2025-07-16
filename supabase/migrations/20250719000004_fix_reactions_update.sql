-- Fix story reactions to update instead of creating new records
-- Add unique constraint for reactions to enable upsert behavior

-- Create unique constraint for reactions (one reaction type per user per story)
CREATE UNIQUE INDEX IF NOT EXISTS story_views_unique_reaction 
ON public.story_views (story_id, viewer_id, reaction_type) 
WHERE interaction_type = 'reaction' AND reaction_type IS NOT NULL;

-- Note: This allows:
-- - One view per user per story
-- - One reply per user per story  
-- - One reaction of each type per user per story (user can have ❤️, 😂, etc but only one of each)
-- - User can change their reaction by "reacting" with different emoji
