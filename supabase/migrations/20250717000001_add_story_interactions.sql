-- Add story interactions columns to existing story_views table

-- Add columns for story interactions
ALTER TABLE public.story_views 
ADD COLUMN IF NOT EXISTS reply_content TEXT,
ADD COLUMN IF NOT EXISTS reaction_type TEXT CHECK (reaction_type IN ('❤️', '😍', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '💯')),
ADD COLUMN IF NOT EXISTS interaction_type TEXT DEFAULT 'view' CHECK (interaction_type IN ('view', 'reply', 'reaction')),
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reacted_at TIMESTAMP WITH TIME ZONE;

-- Update indexes for better performance with new columns
CREATE INDEX IF NOT EXISTS idx_story_views_interaction_type ON public.story_views(interaction_type);
CREATE INDEX IF NOT EXISTS idx_story_views_reaction_type ON public.story_views(reaction_type) WHERE reaction_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_story_views_replied_at ON public.story_views(replied_at DESC) WHERE replied_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_story_views_reacted_at ON public.story_views(reacted_at DESC) WHERE reacted_at IS NOT NULL;

-- Note: RLS is already enabled for story_views table, no need to modify existing policies
-- The existing policies will handle the new interaction columns automatically
