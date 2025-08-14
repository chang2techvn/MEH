-- Add challenges table to realtime publication for live updates
-- This allows clients to receive real-time notifications when challenges are inserted, updated, or deleted

-- Add challenges table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Challenges table successfully added to realtime publication!';
    RAISE NOTICE 'Clients will now receive real-time updates for challenge changes.';
END $$;
