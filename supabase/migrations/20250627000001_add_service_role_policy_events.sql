-- Add policy for service role to manage events data for admin/setup operations
-- This allows service role key to insert/update/delete events for data seeding and admin operations

-- Disable RLS temporarily for service role operations
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS 
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all events (bypass RLS for service role)
CREATE POLICY "Service role can manage all events" ON public.events
    FOR ALL TO service_role;
