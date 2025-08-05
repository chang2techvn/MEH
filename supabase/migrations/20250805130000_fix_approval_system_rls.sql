-- Fix RLS policies for account approval system to prevent infinite recursion

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can see their own approval status" ON users;
DROP POLICY IF EXISTS "Admins can update account status" ON users;

-- Create external function to check admin status (prevents recursion)
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        JOIN users u ON u.id = au.id
        WHERE au.id = user_id AND u.role = 'admin'
    );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_user(UUID) TO authenticated;

-- Create simpler RLS policies that don't cause recursion
CREATE POLICY "users_select_own_or_admin" 
ON users 
FOR SELECT 
TO authenticated 
USING (
    auth.uid() = id 
    OR is_admin_user(auth.uid())
);

CREATE POLICY "users_update_admin_only" 
ON users 
FOR UPDATE 
TO authenticated 
USING (
    is_admin_user(auth.uid())
);

-- Create policy for approval-specific operations
CREATE POLICY "users_approval_operations" 
ON users 
FOR ALL 
TO authenticated 
USING (
    is_admin_user(auth.uid())
);

-- Update the approval functions to use the service role bypass
CREATE OR REPLACE FUNCTION approve_user_account(
    user_id_param UUID,
    admin_id_param UUID DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if admin has permission using direct auth check
    IF NOT is_admin_user(COALESCE(admin_id_param, auth.uid())) THEN
        RAISE EXCEPTION 'Only admins can approve accounts';
    END IF;

    -- Update user account status with service role privileges
    UPDATE users 
    SET 
        account_status = 'approved',
        approved_by = COALESCE(admin_id_param, auth.uid()),
        approved_at = NOW(),
        is_active = true
    WHERE id = user_id_param;

    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION reject_user_account(
    user_id_param UUID,
    admin_id_param UUID DEFAULT auth.uid(),
    reason_param TEXT DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if admin has permission using direct auth check
    IF NOT is_admin_user(COALESCE(admin_id_param, auth.uid())) THEN
        RAISE EXCEPTION 'Only admins can reject accounts';
    END IF;

    -- Update user account status with service role privileges
    UPDATE users 
    SET 
        account_status = 'rejected',
        approved_by = COALESCE(admin_id_param, auth.uid()),
        approved_at = NOW(),
        rejection_reason = reason_param,
        is_active = false
    WHERE id = user_id_param;

    RETURN FOUND;
END;
$$;

-- Comments
COMMENT ON FUNCTION is_admin_user(UUID) IS 'Check if user is admin without causing RLS recursion';
COMMENT ON FUNCTION approve_user_account(UUID, UUID) IS 'Approve user account with admin privileges';
COMMENT ON FUNCTION reject_user_account(UUID, UUID, TEXT) IS 'Reject user account with admin privileges';
