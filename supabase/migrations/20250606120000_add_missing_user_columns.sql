-- Add missing columns to users table to match TypeScript interfaces

-- Add the missing columns that the application expects
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS academic_year TEXT,
ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS major TEXT,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS preferences JSONB,
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Migrate data from profiles table to users table where possible
UPDATE public.users 
SET 
  name = profiles.full_name,
  avatar = profiles.avatar_url,
  bio = profiles.bio
FROM public.profiles 
WHERE users.id = profiles.user_id 
AND users.name IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users USING btree (name);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON public.users USING btree (last_active);
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users USING btree (points DESC);
