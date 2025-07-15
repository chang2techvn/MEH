-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view event attendance" ON public.event_attendees;
DROP POLICY IF EXISTS "Authenticated users can join events" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can manage their own attendance" ON public.event_attendees;

-- Disable RLS temporarily to check basic access
ALTER TABLE public.event_attendees DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Simple policies for testing
CREATE POLICY "Public can read attendees" ON public.event_attendees
    FOR SELECT USING (true);

CREATE POLICY "Authenticated can join" ON public.event_attendees  
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events" ON public.event_attendees
    FOR DELETE TO authenticated 
    USING (auth.uid() = user_id);
