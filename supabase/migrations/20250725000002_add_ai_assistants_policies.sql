-- Add RLS policies for ai_assistants table
-- This allows the service role to manage AI assistants and users to read them

-- Enable RLS on ai_assistants if not already enabled
ALTER TABLE public.ai_assistants ENABLE ROW LEVEL SECURITY;

-- Policy for service role to have full access (for scripts and admin operations)
CREATE POLICY "Service role can manage ai_assistants" ON public.ai_assistants
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users to read all ai_assistants
CREATE POLICY "Authenticated users can read ai_assistants" ON public.ai_assistants
  FOR SELECT 
  TO authenticated
  USING (is_active = true);

-- Policy for authenticated users to update conversation stats
CREATE POLICY "Authenticated users can update ai_assistants stats" ON public.ai_assistants
  FOR UPDATE 
  TO authenticated
  USING (is_active = true)
  WITH CHECK (is_active = true);

-- Grant necessary permissions to service_role
GRANT ALL ON public.ai_assistants TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
