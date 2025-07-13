-- Add media_urls column to support multiple media files per post
ALTER TABLE posts ADD COLUMN media_urls JSONB;

-- Add comment to explain the new column
COMMENT ON COLUMN posts.media_urls IS 'JSON array containing multiple media URLs for posts with multiple images/videos';

-- Create index for better performance when querying media_urls
-- Note: Removed CONCURRENTLY to avoid pipeline execution error
CREATE INDEX IF NOT EXISTS idx_posts_media_urls ON posts USING GIN (media_urls);

-- Note: We keep the existing media_url column for backward compatibility
-- Logic: if media_urls exists and has content, use it; otherwise fall back to media_url
