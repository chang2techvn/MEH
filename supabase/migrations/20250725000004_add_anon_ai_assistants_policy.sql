-- Add policy for anonymous users to read ai_assistants
-- This allows the frontend to load AI personalities without authentication

-- Allow anonymous users to read active AI assistants
CREATE POLICY "Anonymous users can read active ai_assistants" ON public.ai_assistants
  FOR SELECT 
  TO anon
  USING (is_active = true);

-- Grant SELECT permission to anon role
GRANT SELECT ON public.ai_assistants TO anon;
