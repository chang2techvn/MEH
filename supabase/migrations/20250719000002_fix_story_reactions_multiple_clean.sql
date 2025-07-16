-- Allow users to react multiple times with same emoji to same story
-- Remove unique constraint to allow multiple reactions of same type

-- Drop the current unique constraint
ALTER TABLE public.story_views DROP CONSTRAINT IF EXISTS story_views_story_viewer_interaction_unique;

-- Add ID column as primary key if not exists
ALTER TABLE public.story_views ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;

-- Clean up duplicate replies - keep only the most recent one per user per story
DELETE FROM public.story_views 
WHERE id NOT IN (
  SELECT DISTINCT ON (story_id, viewer_id) id
  FROM public.story_views 
  WHERE interaction_type = 'reply'
  ORDER BY story_id, viewer_id, replied_at DESC NULLS LAST, viewed_at DESC
);

-- Clean up duplicate views - keep only the most recent one per user per story
DELETE FROM public.story_views 
WHERE id NOT IN (
  SELECT DISTINCT ON (story_id, viewer_id) id
  FROM public.story_views 
  WHERE interaction_type = 'view'
  ORDER BY story_id, viewer_id, viewed_at DESC
);

-- Create partial unique constraints for view and reply (only one per user per story)
CREATE UNIQUE INDEX IF NOT EXISTS story_views_unique_view 
ON public.story_views (story_id, viewer_id) 
WHERE interaction_type = 'view';

CREATE UNIQUE INDEX IF NOT EXISTS story_views_unique_reply 
ON public.story_views (story_id, viewer_id) 
WHERE interaction_type = 'reply';

-- No constraint for reactions - users can react multiple times with same or different emojis
-- This allows Facebook-style multiple reactions

-- Add index for better performance on reactions
CREATE INDEX IF NOT EXISTS idx_story_views_reactions 
ON public.story_views(story_id, interaction_type, reaction_type, reacted_at DESC) 
WHERE interaction_type = 'reaction';
