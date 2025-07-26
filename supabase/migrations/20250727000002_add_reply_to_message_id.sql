-- Add reply_to_message_id column to natural_conversation_messages table
ALTER TABLE natural_conversation_messages 
ADD COLUMN reply_to_message_id UUID REFERENCES natural_conversation_messages(id) ON DELETE SET NULL;

-- Add index for better query performance on replies
CREATE INDEX idx_natural_conversation_messages_reply_to_message_id 
ON natural_conversation_messages(reply_to_message_id);

-- Add comment to document the column
COMMENT ON COLUMN natural_conversation_messages.reply_to_message_id 
IS 'References the original message ID when this message is a reply';

-- Update RLS policies if needed (assuming existing policies will cover this)
-- The reply_to_message_id should follow the same access patterns as the main message
