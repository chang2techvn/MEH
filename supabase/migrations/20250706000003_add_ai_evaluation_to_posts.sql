-- Add ai_evaluation column to posts table
-- This column stores AI evaluation results for video posts

-- Add the ai_evaluation column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'ai_evaluation'
    ) THEN
        ALTER TABLE posts ADD COLUMN ai_evaluation JSONB;
    END IF;
END $$;

-- Add score column if it doesn't exist (for storing numeric score)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'score'
    ) THEN
        ALTER TABLE posts ADD COLUMN score INTEGER;
    END IF;
END $$;

-- Add original_video_id column if it doesn't exist (for linking to daily challenge)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'original_video_id'
    ) THEN
        ALTER TABLE posts ADD COLUMN original_video_id TEXT;
    END IF;
END $$;

-- Grant permissions to service_role and anon
GRANT ALL ON TABLE posts TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE posts TO anon;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_score ON posts(score);
CREATE INDEX IF NOT EXISTS idx_posts_original_video_id ON posts(original_video_id);

-- Add comment
COMMENT ON COLUMN posts.ai_evaluation IS 'JSON containing AI evaluation results for video posts';
COMMENT ON COLUMN posts.score IS 'Numeric score from AI evaluation (0-100)';
COMMENT ON COLUMN posts.original_video_id IS 'Reference to the daily challenge video ID';
