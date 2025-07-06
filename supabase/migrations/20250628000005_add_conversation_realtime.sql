-- Add conversation_messages table to realtime publication (with conflict handling)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Table already in publication
  END;
END $$;

-- Also ensure conversations and conversation_participants are in publication (with conflict handling)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Table already in publication
  END;
END $$;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Table already in publication
  END;
END $$;
