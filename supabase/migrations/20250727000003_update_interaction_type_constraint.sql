-- Update interaction_type check constraint to include 'reply'
-- First, drop the existing constraint
ALTER TABLE natural_conversation_messages 
DROP CONSTRAINT IF EXISTS natural_conversation_messages_interaction_type_check;

-- Add the updated constraint with 'reply' included
ALTER TABLE natural_conversation_messages 
ADD CONSTRAINT natural_conversation_messages_interaction_type_check 
CHECK (interaction_type IN ('user_to_ai', 'ai_to_user', 'ai_to_ai', 'system', 'reply', 'ai_reply'));

-- Add comment to document the allowed values
COMMENT ON CONSTRAINT natural_conversation_messages_interaction_type_check 
ON natural_conversation_messages 
IS 'Allowed interaction types: user_to_ai, ai_to_user, ai_to_ai, system, reply, ai_reply';
