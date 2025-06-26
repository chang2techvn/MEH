-- Create events table for community events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    is_online BOOLEAN DEFAULT false,
    online_link TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    event_type TEXT CHECK (event_type IN ('workshop', 'webinar', 'study_group', 'competition', 'social', 'other')) DEFAULT 'other',
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')) DEFAULT 'all',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON public.events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view public events
CREATE POLICY "Anyone can view public events" ON public.events
    FOR SELECT USING (is_public = true AND is_active = true);

-- Policy: Users can view all events if authenticated
CREATE POLICY "Authenticated users can view all events" ON public.events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Event creators can update their own events
CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Event creators can delete their own events
CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (auth.uid() = created_by);

-- Policy: Authenticated users can create events
CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add events table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- Grant permissions
GRANT ALL ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;

-- Add comments
COMMENT ON TABLE public.events IS 'Community events and activities';
COMMENT ON COLUMN public.events.title IS 'Event title';
COMMENT ON COLUMN public.events.description IS 'Event description';
COMMENT ON COLUMN public.events.start_date IS 'Event start date and time';
COMMENT ON COLUMN public.events.end_date IS 'Event end date and time';
COMMENT ON COLUMN public.events.location IS 'Physical location or address';
COMMENT ON COLUMN public.events.is_online IS 'Whether event is online';
COMMENT ON COLUMN public.events.online_link IS 'Link for online events';
COMMENT ON COLUMN public.events.max_attendees IS 'Maximum number of attendees';
COMMENT ON COLUMN public.events.current_attendees IS 'Current number of registered attendees';
COMMENT ON COLUMN public.events.event_type IS 'Type of event';
COMMENT ON COLUMN public.events.difficulty_level IS 'Difficulty level for participants';
COMMENT ON COLUMN public.events.tags IS 'Event tags for categorization';
COMMENT ON COLUMN public.events.is_public IS 'Whether event is publicly visible';
COMMENT ON COLUMN public.events.is_active IS 'Whether event is active';
COMMENT ON COLUMN public.events.created_by IS 'User who created the event';
