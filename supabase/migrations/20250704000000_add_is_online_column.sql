-- Add is_online column to users table
-- This migration adds the missing is_online column that exists in local but not in cloud

-- Add the is_online column to users table
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "is_online" BOOLEAN DEFAULT false;

-- Add status column if it doesn't exist (commonly used with is_online)
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'offline';

-- Add other commonly missing columns that might be in local schema
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMPTZ;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'user';

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "bio" TEXT;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "academic_year" TEXT;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "experience_points" INTEGER DEFAULT 0;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "joined_at" TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "last_active" TIMESTAMPTZ;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "level" INTEGER DEFAULT 1;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "major" TEXT;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "points" INTEGER DEFAULT 0;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "preferences" JSONB DEFAULT '{}';

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "streak_days" INTEGER DEFAULT 0;

ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "student_id" TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_users_is_online" ON "public"."users" ("is_online");
CREATE INDEX IF NOT EXISTS "idx_users_status" ON "public"."users" ("status");
CREATE INDEX IF NOT EXISTS "idx_users_last_active" ON "public"."users" ("last_active");

-- Update existing users to set default values
UPDATE "public"."users" 
SET 
  "is_online" = false,
  "status" = 'offline',
  "updated_at" = NOW(),
  "is_active" = true,
  "role" = COALESCE("role", 'user'),
  "experience_points" = COALESCE("experience_points", 0),
  "joined_at" = COALESCE("joined_at", "created_at"),
  "level" = COALESCE("level", 1),
  "points" = COALESCE("points", 0),
  "preferences" = COALESCE("preferences", '{}'),
  "streak_days" = COALESCE("streak_days", 0)
WHERE "is_online" IS NULL OR "updated_at" IS NULL;

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON "public"."users";
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "public"."users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON COLUMN "public"."users"."is_online" IS 'Whether the user is currently online';
COMMENT ON COLUMN "public"."users"."status" IS 'User status: online, offline, away, busy';
COMMENT ON COLUMN "public"."users"."experience_points" IS 'Total experience points earned';
COMMENT ON COLUMN "public"."users"."streak_days" IS 'Current consecutive days streak';
