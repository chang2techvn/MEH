-- Add indexes to improve query performance and avoid timeouts
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id_simple ON posts (user_id) WHERE user_id IS NOT NULL;

-- Add basic indexes for other tables if they don't exist
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON profiles (user_id) WHERE user_id IS NOT NULL;

-- Analyze tables to update query planner statistics
ANALYZE posts;
ANALYZE likes;
ANALYZE comments;
ANALYZE profiles;
