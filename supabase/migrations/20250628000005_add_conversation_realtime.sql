-- Add conversation_messages table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;

-- Also ensure conversations and conversation_participants are in publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
