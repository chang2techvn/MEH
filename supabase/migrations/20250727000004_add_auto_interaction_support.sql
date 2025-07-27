-- Auto-interaction system support for existing natural conversation tables
-- Migration: Add auto-interaction enum values and settings table

-- Add auto-interaction values to existing interaction_type constraint
-- Note: Using ALTER TABLE ... DROP CONSTRAINT and ADD CONSTRAINT to update enum-like constraints

-- First, drop the existing constraint
ALTER TABLE natural_conversation_messages DROP CONSTRAINT IF EXISTS natural_conversation_messages_interaction_type_check;

-- Add the updated constraint with auto-interaction types
ALTER TABLE natural_conversation_messages ADD CONSTRAINT natural_conversation_messages_interaction_type_check 
CHECK (interaction_type = ANY(ARRAY[
  'user_to_ai'::text,
  'ai_to_user'::text, 
  'ai_to_ai'::text,
  'system'::text,
  'reply'::text,
  'ai_reply'::text,
  'auto_ai_to_ai'::text,
  'auto_ai_to_user'::text
]));

-- Add auto-interaction values to existing message_type constraint
ALTER TABLE natural_conversation_messages DROP CONSTRAINT IF EXISTS natural_conversation_messages_message_type_check;

ALTER TABLE natural_conversation_messages ADD CONSTRAINT natural_conversation_messages_message_type_check 
CHECK (message_type = ANY(ARRAY[
  'text'::text,
  'ai_response'::text,
  'ai_question'::text, 
  'ai_interaction'::text,
  'auto_ai_question'::text,
  'auto_ai_response'::text
]));

-- Add auto_interaction_metadata column to natural_conversation_messages if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'natural_conversation_messages' 
        AND column_name = 'auto_interaction_metadata'
    ) THEN
        ALTER TABLE natural_conversation_messages 
        ADD COLUMN auto_interaction_metadata JSONB DEFAULT NULL;
        
        COMMENT ON COLUMN natural_conversation_messages.auto_interaction_metadata IS 'Metadata for auto-generated interactions: trigger reason, timeout level, etc.';
    END IF;
END $$;

-- Create auto_interaction_settings table for session-specific settings
CREATE TABLE IF NOT EXISTS auto_interaction_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES natural_conversation_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    current_timeout_minutes INTEGER DEFAULT 2,
    last_user_activity TIMESTAMPTZ DEFAULT NOW(),
    last_auto_interaction TIMESTAMPTZ DEFAULT NULL,
    user_has_started_chat BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one settings record per session
    UNIQUE(session_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_auto_interaction_settings_session_id 
ON auto_interaction_settings(session_id);

CREATE INDEX IF NOT EXISTS idx_auto_interaction_settings_user_id 
ON auto_interaction_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_auto_interaction_settings_active_sessions
ON auto_interaction_settings(user_id, is_enabled) WHERE is_enabled = true;

-- RLS policies for auto_interaction_settings
ALTER TABLE auto_interaction_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own auto-interaction settings
CREATE POLICY "Users can manage their own auto-interaction settings" 
ON auto_interaction_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Policy: Service role can manage all auto-interaction settings
CREATE POLICY "Service role can manage auto-interaction settings" 
ON auto_interaction_settings
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_auto_interaction_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auto_interaction_settings_updated_at
    BEFORE UPDATE ON auto_interaction_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_auto_interaction_settings_updated_at();

-- Grant necessary permissions
GRANT ALL ON auto_interaction_settings TO service_role;
GRANT ALL ON auto_interaction_settings TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE auto_interaction_settings IS 'Stores auto-interaction settings and state for each natural conversation session to enable dynamic AI-to-AI and AI-to-User interactions';
COMMENT ON COLUMN auto_interaction_settings.current_timeout_minutes IS 'Current timeout in minutes before triggering auto-interaction (increases when user does not respond)';
COMMENT ON COLUMN auto_interaction_settings.last_user_activity IS 'Timestamp of last user message or interaction in the session';
COMMENT ON COLUMN auto_interaction_settings.last_auto_interaction IS 'Timestamp of last auto-generated interaction';
COMMENT ON COLUMN auto_interaction_settings.user_has_started_chat IS 'Whether user has sent at least one message in this session (required to enable auto-interactions)';
