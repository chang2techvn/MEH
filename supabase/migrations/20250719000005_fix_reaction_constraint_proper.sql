-- Create proper unique constraint for reactions upsert
-- Drop the partial index and create proper constraint

-- Drop the partial index
DROP INDEX IF EXISTS story_views_unique_reaction;

-- Add constraint columns if not exist
ALTER TABLE public.story_views 
ADD COLUMN IF NOT EXISTS interaction_type TEXT DEFAULT 'view' CHECK (interaction_type IN ('view', 'reply', 'reaction'));

-- Create unique constraint for reactions
-- For reactions: story_id + viewer_id + reaction_type must be unique
-- This allows user to have multiple different reactions but only one of each type
ALTER TABLE public.story_views 
ADD CONSTRAINT story_views_reaction_unique 
UNIQUE (story_id, viewer_id, reaction_type, interaction_type);

-- Note: This constraint allows:
-- - User can react with ❤️ once, 😂 once, etc.
-- - If user reacts with ❤️ again, it will update the existing record
-- - User can have different types of reactions simultaneously
