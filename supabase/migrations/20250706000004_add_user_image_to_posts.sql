-- Add user_image column to posts table
-- This column stores the user's avatar image URL for display in posts

-- Add the user_image column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'user_image'
    ) THEN
        ALTER TABLE posts ADD COLUMN user_image TEXT;
    END IF;
END $$;

-- Add username column if it doesn't exist (for display in posts)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'username'
    ) THEN
        ALTER TABLE posts ADD COLUMN username TEXT;
    END IF;
END $$;

-- Grant permissions to service_role and anon
GRANT ALL ON TABLE posts TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE posts TO anon;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_username ON posts(username);

-- Add comments
COMMENT ON COLUMN posts.user_image IS 'User avatar image URL for display in posts';
COMMENT ON COLUMN posts.username IS 'Username for display in posts';
