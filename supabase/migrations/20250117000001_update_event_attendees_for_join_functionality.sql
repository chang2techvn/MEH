-- Update event_attendees table to support Join Event functionality
-- Add missing columns and update status values

-- Add attended column if it doesn't exist
ALTER TABLE public.event_attendees 
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT false;

-- Update status enum to include 'attending', 'interested', 'not_attending'
-- First drop the existing constraint
ALTER TABLE public.event_attendees 
DROP CONSTRAINT IF EXISTS event_attendees_status_check;

-- Add new constraint with updated status values
ALTER TABLE public.event_attendees 
ADD CONSTRAINT event_attendees_status_check 
CHECK (status IN ('attending', 'interested', 'not_attending', 'registered', 'attended', 'cancelled'));

-- Update default status to 'attending'
ALTER TABLE public.event_attendees 
ALTER COLUMN status SET DEFAULT 'attending';

-- Create or replace function to update event attendance count with new status
CREATE OR REPLACE FUNCTION update_event_attendance_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_attendees count in events table
    -- Count both 'attending' and 'registered' as attendees
    UPDATE public.events 
    SET current_attendees = (
        SELECT COUNT(*) 
        FROM public.event_attendees 
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id) 
        AND status IN ('attending', 'registered')
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to be more flexible
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view event attendance" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can join events" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can update their own attendance" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can cancel their attendance" ON public.event_attendees;

-- Create updated policies
-- Users can view all attendance records for public events
CREATE POLICY "Users can view event attendance" ON public.event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_attendees.event_id 
            AND events.is_public = true
        )
        OR auth.uid() = user_id
    );

-- Users can join events (insert their own attendance record)
CREATE POLICY "Users can join events" ON public.event_attendees
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_attendees.event_id 
            AND events.is_public = true
        )
    );

-- Users can update their own attendance record
CREATE POLICY "Users can update their own attendance" ON public.event_attendees
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can cancel their attendance (delete their record)
CREATE POLICY "Users can cancel their attendance" ON public.event_attendees
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_attendees TO authenticated;
GRANT SELECT ON public.event_attendees TO anon;

-- Add comment for documentation
COMMENT ON TABLE public.event_attendees IS 'Tracks user attendance and interest in events';
COMMENT ON COLUMN public.event_attendees.status IS 'attending: user will attend, interested: user is interested, not_attending: user will not attend, registered: legacy status, attended: user attended, cancelled: user cancelled';
COMMENT ON COLUMN public.event_attendees.attended IS 'Whether the user actually attended the event (set after event completion)';
