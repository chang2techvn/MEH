-- Fix role constraint in conversation_participants table
-- The current constraint is rejecting 'member' role

-- Drop existing check constraint for role column
DO $$
BEGIN
    -- First, check what constraints exist
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'conversation_participants_role_check'
    ) THEN
        ALTER TABLE conversation_participants DROP CONSTRAINT conversation_participants_role_check;
    END IF;
END $$;

-- Add new check constraint with proper role values
ALTER TABLE conversation_participants 
ADD CONSTRAINT conversation_participants_role_check 
CHECK (role IN ('admin', 'moderator', 'member', 'guest'));

-- Also ensure the default value is valid
ALTER TABLE conversation_participants 
ALTER COLUMN role SET DEFAULT 'member';

-- Grant permissions again to make sure they're set
GRANT ALL ON TABLE conversation_participants TO service_role;
GRANT ALL ON TABLE conversation_participants TO authenticated;

-- Add comment
COMMENT ON COLUMN conversation_participants.role IS 'Participant role: admin, moderator, member, or guest';
