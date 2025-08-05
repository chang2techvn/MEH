-- Add account approval system to existing users table
-- This migration adds proper account status management based on current schema

-- Add account_status column to users table for approval system
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "account_status" TEXT DEFAULT 'pending' 
CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Add approval related columns
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "approved_by" UUID,
ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_users_account_status" ON "public"."users" ("account_status");
CREATE INDEX IF NOT EXISTS "idx_users_pending_approval" ON "public"."users" ("account_status", "created_at") 
WHERE "account_status" = 'pending';

-- Update existing users to approved status (for existing data)
UPDATE "public"."users" 
SET "account_status" = 'approved', "approved_at" = NOW()
WHERE "account_status" IS NULL AND "is_active" = true;

-- Create function to approve user account
CREATE OR REPLACE FUNCTION approve_user_account(
    user_id_param UUID,
    admin_id_param UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if admin has permission
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = admin_id_param AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can approve accounts';
    END IF;

    -- Update user account status
    UPDATE users 
    SET 
        account_status = 'approved',
        approved_by = admin_id_param,
        approved_at = NOW(),
        is_active = true
    WHERE id = user_id_param;

    RETURN FOUND;
END;
$$;

-- Create function to reject user account
CREATE OR REPLACE FUNCTION reject_user_account(
    user_id_param UUID,
    admin_id_param UUID,
    reason_param TEXT DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if admin has permission
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = admin_id_param AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can reject accounts';
    END IF;

    -- Update user account status
    UPDATE users 
    SET 
        account_status = 'rejected',
        approved_by = admin_id_param,
        approved_at = NOW(),
        rejection_reason = reason_param,
        is_active = false
    WHERE id = user_id_param;

    RETURN FOUND;
END;
$$;

-- Create function to get pending approvals count
CREATE OR REPLACE FUNCTION get_pending_approvals_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COUNT(*)::integer 
    FROM users 
    WHERE account_status = 'pending';
$$;

-- Create function to get user approval status
CREATE OR REPLACE FUNCTION get_user_approval_info(user_id_param UUID)
RETURNS TABLE (
    account_status TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        u.account_status,
        u.approved_by,
        u.approved_at,
        u.rejection_reason
    FROM users u
    WHERE u.id = user_id_param;
$$;

-- Add RLS policy for account approval
CREATE POLICY "Users can see their own approval status"
ON users
FOR SELECT
TO authenticated
USING (
    auth.uid() = id 
    OR EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role IN ('admin', 'teacher')
    )
);

-- Add RLS policy for admin approval actions
CREATE POLICY "Admins can update account status"
ON users
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION approve_user_account(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user_account(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_approvals_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_approval_info(UUID) TO authenticated;

-- Comments for documentation
COMMENT ON COLUMN "public"."users"."account_status" IS 'Account approval status: pending, approved, rejected, suspended';
COMMENT ON COLUMN "public"."users"."approved_by" IS 'Admin who approved/rejected the account';
COMMENT ON COLUMN "public"."users"."approved_at" IS 'When the account was approved/rejected';
COMMENT ON COLUMN "public"."users"."rejection_reason" IS 'Reason for account rejection';
