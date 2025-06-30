-- Optimize user queries for chat functionality
-- Add indexes for better performance on user discovery

-- Index for user discovery queries (active users ordered by last_active)
CREATE INDEX IF NOT EXISTS idx_users_active_last_active 
ON users (is_active, last_active DESC) 
WHERE is_active = true;

-- Composite index for user lookup with exclusion
CREATE INDEX IF NOT EXISTS idx_users_id_active 
ON users (id, is_active) 
WHERE is_active = true;

-- Index for email-based searches (optional, for future username search)
CREATE INDEX IF NOT EXISTS idx_users_email_active 
ON users (email, is_active) 
WHERE is_active = true;

-- Index for name-based searches (optional, for future name search)
CREATE INDEX IF NOT EXISTS idx_users_name_active 
ON users (name, is_active) 
WHERE is_active = true AND name IS NOT NULL;

-- Add a partial index for conversation participants lookup
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id 
ON conversation_participants (user_id, conversation_id);

-- Add index for conversation lookup
CREATE INDEX IF NOT EXISTS idx_conversations_created_at 
ON conversations (created_at DESC);
