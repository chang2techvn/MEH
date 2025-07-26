-- Fix natural conversation permissions for anonymous key
-- This allows the API to insert messages using the anon key

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Users can manage their own messages" ON public.natural_conversation_messages;
DROP POLICY IF EXISTS "Service role can manage all sessions" ON public.natural_conversation_sessions;
DROP POLICY IF EXISTS "Service role can manage all messages" ON public.natural_conversation_messages;

-- Create new policies that allow anon key to insert with proper user context
CREATE POLICY "Allow anon key to manage sessions with user_id" ON public.natural_conversation_sessions
    FOR ALL 
    USING (
        -- Allow if user is authenticated and owns the session
        (auth.role() = 'authenticated' AND auth.uid() = user_id) 
        OR 
        -- Allow anon key for API operations (will validate user_id in application)
        (auth.role() = 'anon')
    )
    WITH CHECK (
        -- Same conditions for inserts/updates
        (auth.role() = 'authenticated' AND auth.uid() = user_id) 
        OR 
        (auth.role() = 'anon')
    );

CREATE POLICY "Allow anon key to manage messages" ON public.natural_conversation_messages
    FOR ALL 
    USING (
        -- Allow if user is authenticated and owns the message (via session)
        (auth.role() = 'authenticated' AND 
         EXISTS (
             SELECT 1 FROM public.natural_conversation_sessions 
             WHERE id = session_id AND user_id = auth.uid()
         ))
        OR 
        -- Allow anon key for API operations
        (auth.role() = 'anon')
    )
    WITH CHECK (
        -- Same conditions for inserts/updates
        (auth.role() = 'authenticated' AND 
         EXISTS (
             SELECT 1 FROM public.natural_conversation_sessions 
             WHERE id = session_id AND user_id = auth.uid()
         ))
        OR 
        (auth.role() = 'anon')
    );

-- Ensure anon key has necessary permissions
GRANT ALL ON public.natural_conversation_sessions TO anon;
GRANT ALL ON public.natural_conversation_messages TO anon;

-- Also grant to authenticated users
GRANT ALL ON public.natural_conversation_sessions TO authenticated;
GRANT ALL ON public.natural_conversation_messages TO authenticated;

-- Grant sequence permissions (if sequences exist)
DO $$
BEGIN
    -- Check if sequences exist and grant permissions
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'natural_conversation_sessions_id_seq') THEN
        GRANT ALL ON SEQUENCE public.natural_conversation_sessions_id_seq TO anon;
        GRANT ALL ON SEQUENCE public.natural_conversation_sessions_id_seq TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'natural_conversation_messages_id_seq') THEN
        GRANT ALL ON SEQUENCE public.natural_conversation_messages_id_seq TO anon;
        GRANT ALL ON SEQUENCE public.natural_conversation_messages_id_seq TO authenticated;
    END IF;
END $$;

-- Also ensure ai_assistants can be read by anon (needed for API)
GRANT SELECT ON public.ai_assistants TO anon;

-- Create index for better performance on session lookups
CREATE INDEX IF NOT EXISTS idx_natural_conversation_messages_session_id 
ON public.natural_conversation_messages(session_id);

CREATE INDEX IF NOT EXISTS idx_natural_conversation_sessions_user_id 
ON public.natural_conversation_sessions(user_id);
