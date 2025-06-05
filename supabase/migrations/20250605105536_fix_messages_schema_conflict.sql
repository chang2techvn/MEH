-- Fix messages table schema conflict
-- Rename recipient_id to receiver_id and add proper indexes/constraints

-- First, rename the column if it exists as recipient_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'messages' 
               AND column_name = 'recipient_id') THEN
        -- Rename recipient_id to receiver_id
        ALTER TABLE public.messages RENAME COLUMN recipient_id TO receiver_id;
    END IF;
END $$;

-- Ensure the foreign key constraint exists
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Create the required indexes
CREATE INDEX IF NOT EXISTS idx_messages_participants ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver_time ON public.messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON public.messages(receiver_id, is_read);

-- Ensure the check constraint exists
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_check;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_check 
CHECK (sender_id <> receiver_id);