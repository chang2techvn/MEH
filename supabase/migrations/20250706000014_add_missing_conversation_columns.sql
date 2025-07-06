-- Add missing columns to existing conversations tables
-- The tables exist but are missing some required columns

-- Add missing columns to conversations table
DO $$ 
BEGIN
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE conversations ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Add participants_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'participants_count'
    ) THEN
        ALTER TABLE conversations ADD COLUMN participants_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add last_message_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'last_message_at'
    ) THEN
        ALTER TABLE conversations ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add is_archived column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'is_archived'
    ) THEN
        ALTER TABLE conversations ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'type'
    ) THEN
        ALTER TABLE conversations ADD COLUMN type TEXT NOT NULL DEFAULT 'direct';
    END IF;
END $$;

-- Add missing columns to conversation_participants table
DO $$ 
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' AND column_name = 'role'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
    END IF;
    
    -- Add joined_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' AND column_name = 'joined_at'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add left_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' AND column_name = 'left_at'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN left_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add last_read_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' AND column_name = 'last_read_at'
    ) THEN
        ALTER TABLE conversation_participants ADD COLUMN last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance (only if columns exist now)
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_active ON conversation_participants(is_active);

-- Grant permissions to roles
GRANT ALL ON TABLE conversations TO service_role;
GRANT ALL ON TABLE conversation_participants TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE conversation_participants TO authenticated;

-- Grant select to anon for reading (if needed for public features)
GRANT SELECT ON TABLE conversations TO anon;
GRANT SELECT ON TABLE conversation_participants TO anon;

-- Enable RLS if not already enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Add unique constraint to conversation_participants if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversation_participants_conversation_id_user_id_key'
        AND table_name = 'conversation_participants'
    ) THEN
        ALTER TABLE conversation_participants ADD CONSTRAINT conversation_participants_conversation_id_user_id_key UNIQUE(conversation_id, user_id);
    END IF;
END $$;

-- Add comment
COMMENT ON TABLE conversations IS 'Conversations table with all required columns added';
COMMENT ON TABLE conversation_participants IS 'Conversation participants with all required columns added';
