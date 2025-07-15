-- Create event_attendees table to track user attendance
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate registrations
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_attendees_unique ON public.event_attendees(event_id, user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON public.event_attendees(status);

-- Enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_attendees
-- Users can view all attendance records for public events
CREATE POLICY "Users can view event attendance" ON public.event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_attendees.event_id 
            AND events.is_public = true
        )
    );

-- Users can join events (insert their own attendance record)
CREATE POLICY "Users can join events" ON public.event_attendees
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own attendance record
CREATE POLICY "Users can update their own attendance" ON public.event_attendees
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can cancel their own attendance (delete their record)
CREATE POLICY "Users can cancel their attendance" ON public.event_attendees
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to service role for admin operations
GRANT ALL ON public.event_attendees TO service_role;

-- Create function to automatically update event attendance count
CREATE OR REPLACE FUNCTION update_event_attendance_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_attendees count in events table
    UPDATE public.events 
    SET current_attendees = (
        SELECT COUNT(*) 
        FROM public.event_attendees 
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id) 
        AND status = 'registered'
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically update attendance count
CREATE TRIGGER trigger_update_attendance_on_insert
    AFTER INSERT ON public.event_attendees
    FOR EACH ROW EXECUTE FUNCTION update_event_attendance_count();

CREATE TRIGGER trigger_update_attendance_on_update
    AFTER UPDATE ON public.event_attendees
    FOR EACH ROW EXECUTE FUNCTION update_event_attendance_count();

CREATE TRIGGER trigger_update_attendance_on_delete
    AFTER DELETE ON public.event_attendees
    FOR EACH ROW EXECUTE FUNCTION update_event_attendance_count();
