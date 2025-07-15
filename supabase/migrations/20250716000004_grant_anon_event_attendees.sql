-- Grant permissions for anon role to access event_attendees for testing
GRANT SELECT ON public.event_attendees TO anon;
GRANT INSERT ON public.event_attendees TO anon;
GRANT DELETE ON public.event_attendees TO anon;
