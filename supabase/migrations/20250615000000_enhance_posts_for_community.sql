-- Add fields to posts table to support community posts with AI evaluation
-- This migration adds the columns needed for the English learning platform's community features

-- Add new columns to the posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS user_image TEXT,
ADD COLUMN IF NOT EXISTS original_video_id TEXT,
ADD COLUMN IF NOT EXISTS ai_evaluation JSONB,
ADD COLUMN IF NOT EXISTS score INTEGER;

-- Update post_type constraint to include new types
DO $$ 
BEGIN 
    -- Drop the existing constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_post_type_check') THEN
        ALTER TABLE public.posts DROP CONSTRAINT posts_post_type_check;
    END IF;
    
    -- Add the new constraint with all post types
    ALTER TABLE public.posts 
    ADD CONSTRAINT posts_post_type_check 
    CHECK (post_type IN ('text', 'image', 'video', 'audio', 'youtube'));
END $$;

-- Create index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_public_created_at ON public.posts(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_original_video_id ON public.posts(original_video_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
