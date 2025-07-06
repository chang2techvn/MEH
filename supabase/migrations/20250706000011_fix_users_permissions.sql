-- Grant permissions for users table to fix Start New Chat functionality
-- Allow public access to read users for chat features

-- Grant basic permissions on users table
GRANT SELECT ON TABLE users TO anon;
GRANT SELECT ON TABLE users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE users TO authenticated;

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Allow anyone to read users (for chat functionality)
-- This is needed for "Start New Chat" to show available users
CREATE POLICY "Public can read users" ON users
  FOR SELECT USING (true);

-- Allow users to view/update their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id::text = auth.uid()::text);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id::text = auth.uid()::text);

-- Add foreign key relationship between profiles and users if not exists
-- This ensures proper join queries work
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        -- Note: This might fail if user_ids don't match, so we'll make it optional
        BEGIN
            ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        EXCEPTION
            WHEN foreign_key_violation THEN
                RAISE NOTICE 'Foreign key constraint not added due to data mismatch - this is expected';
        END;
    END IF;
END $$;

-- Add comment
COMMENT ON TABLE users IS 'RLS enabled with public read access for chat functionality';
