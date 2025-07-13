-- Add reaction types to likes table to support emoji reactions
-- Update likes table to support different reaction types instead of just like/unlike

-- Add reaction_type column
ALTER TABLE public.likes ADD COLUMN reaction_type VARCHAR(20) DEFAULT 'like';

-- Add comment to explain the column
COMMENT ON COLUMN public.likes.reaction_type IS 'Type of reaction: like, love, laugh, wow, sad, angry, etc.';

-- Create index for better performance when querying reaction types
CREATE INDEX IF NOT EXISTS idx_likes_reaction_type ON public.likes(reaction_type);

-- Create index for better performance when querying user reactions on posts
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON public.likes(user_id, post_id) WHERE post_id IS NOT NULL;

-- Update the unique constraint to allow multiple reactions per user per post
-- First drop the existing unique constraint
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_post_id_key;

-- Add new unique constraint that includes reaction_type
-- This ensures one user can only have one reaction of each type per post
ALTER TABLE public.likes ADD CONSTRAINT likes_user_post_reaction_unique 
    UNIQUE(user_id, post_id, reaction_type) DEFERRABLE INITIALLY DEFERRED;

-- However, we want users to only have ONE reaction per post, so let's use a different approach
-- Drop the constraint we just added
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_post_reaction_unique;

-- Add back the original constraint but modify the check
-- One user can only have one reaction per post (they can change the type)
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_post_id_key 
    UNIQUE(user_id, post_id) DEFERRABLE INITIALLY DEFERRED;

-- Create a function to handle reaction changes (upsert)
CREATE OR REPLACE FUNCTION public.handle_reaction(
    p_user_id UUID,
    p_post_id UUID,
    p_reaction_type VARCHAR(20)
) RETURNS void AS $$
BEGIN
    -- Insert or update the reaction
    INSERT INTO public.likes (user_id, post_id, reaction_type, created_at)
    VALUES (p_user_id, p_post_id, p_reaction_type, NOW())
    ON CONFLICT (user_id, post_id)
    DO UPDATE SET 
        reaction_type = p_reaction_type,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_reaction(UUID, UUID, VARCHAR) TO authenticated;
