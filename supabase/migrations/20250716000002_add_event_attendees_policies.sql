-- Enable RLS for event_attendees table
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view event attendance (for counting attendees)
CREATE POLICY "Anyone can view event attendance" ON public.event_attendees
    FOR SELECT USING (true);

-- Policy: Authenticated users can join events (insert their own attendance)
CREATE POLICY "Authenticated users can join events" ON public.event_attendees
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own attendance (leave events)
CREATE POLICY "Users can manage their own attendance" ON public.event_attendees
    FOR DELETE TO authenticated 
    USING (auth.uid() = user_id);

-- Grant service role permissions for admin operations
GRANT ALL ON public.event_attendees TO service_role;
