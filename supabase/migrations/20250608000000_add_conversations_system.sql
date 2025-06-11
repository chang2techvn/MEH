-- Create conversations system tables
-- This migration adds support for conversations, conversation participants, and conversation messages

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'moderator', 'admin', 'student', 'teacher')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Create conversation_messages table (separate from regular messages for conversations)
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video')),
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender_id ON conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at DESC);

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_messages_updated_at 
    BEFORE UPDATE ON conversation_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversation's last_message_at when a message is added
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at, updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON conversation_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Insert some sample conversations for testing
INSERT INTO conversations (id, title, status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'English Grammar Discussion', 'active', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440002', 'Pronunciation Help Session', 'active', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440003', 'Writing Workshop', 'archived', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440004', 'Vocabulary Building', 'active', NOW() - INTERVAL '3 hours'),
('550e8400-e29b-41d4-a716-446655440005', 'Reported Content Review', 'flagged', NOW() - INTERVAL '1 hour');

-- Insert sample conversation participants (linking to existing users)
-- Note: These will only work if the referenced user IDs exist
INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    id,
    CASE 
        WHEN email LIKE '%admin%' THEN 'moderator'
        WHEN email LIKE '%teacher%' THEN 'teacher'
        ELSE 'student'
    END,
    NOW() - INTERVAL '1 day'
FROM users 
LIMIT 3;

-- Insert more participants for other conversations
INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440002',
    id,
    'participant',
    NOW() - INTERVAL '12 hours'
FROM users 
WHERE id NOT IN (
    SELECT user_id FROM conversation_participants 
    WHERE conversation_id = '550e8400-e29b-41d4-a716-446655440001'
)
LIMIT 2;

-- Insert sample conversation messages
INSERT INTO conversation_messages (conversation_id, sender_id, content, created_at) 
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    cp.user_id,
    CASE 
        WHEN cp.role = 'teacher' THEN 'Welcome everyone! Today we''ll be discussing English grammar fundamentals.'
        WHEN cp.role = 'moderator' THEN 'Please remember to keep the discussion respectful and on-topic.'
        ELSE 'Thank you for organizing this session!'
    END,
    NOW() - INTERVAL '1 day' + (ROW_NUMBER() OVER () * INTERVAL '5 minutes')
FROM conversation_participants cp
WHERE cp.conversation_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY cp.joined_at;

-- Add more sample messages for active conversation
INSERT INTO conversation_messages (conversation_id, sender_id, content, created_at)
SELECT 
    '550e8400-e29b-41d4-a716-446655440004',
    cp.user_id,
    'I''ve been working on expanding my vocabulary. Any recommendations for effective learning techniques?',
    NOW() - INTERVAL '2 hours'
FROM conversation_participants cp
WHERE cp.conversation_id = '550e8400-e29b-41d4-a716-446655440002'
LIMIT 1;

-- Grant necessary permissions (adjust as needed for your RLS policies)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may want to customize these)
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own participation records" ON conversation_participants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view messages in conversations they participate in" ON conversation_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to conversations they participate in" ON conversation_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid()
        )
    );
