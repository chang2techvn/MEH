-- Update approval functions to work with service role properly

-- Drop and recreate approval functions with proper service role handling
DROP FUNCTION IF EXISTS approve_user_account(UUID, UUID);
DROP FUNCTION IF EXISTS reject_user_account(UUID, UUID, TEXT);

-- Create approval function that works with service role
CREATE OR REPLACE FUNCTION approve_user_account(
    user_id_param UUID,
    admin_id_param UUID DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data jsonb;
    updated_count integer;
BEGIN
    -- If admin_id is provided, check admin permission
    IF admin_id_param IS NOT NULL THEN
        IF NOT is_admin_user(admin_id_param) THEN
            RAISE EXCEPTION 'Only admins can approve accounts';
        END IF;
    END IF;

    -- Update user account status with explicit privileges
    UPDATE users 
    SET 
        account_status = 'approved',
        approved_by = admin_id_param,  -- Can be NULL for system approvals
        approved_at = NOW(),
        is_active = true,
        updated_at = NOW()
    WHERE id = user_id_param;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    -- Return result as JSON
    result_data = jsonb_build_object(
        'success', updated_count > 0,
        'user_id', user_id_param,
        'approved_by', admin_id_param,  -- Can be NULL
        'approved_at', NOW()
    );

    RETURN result_data;
END;
$$;

-- Create rejection function that works with service role
CREATE OR REPLACE FUNCTION reject_user_account(
    user_id_param UUID,
    admin_id_param UUID DEFAULT NULL,
    reason_param TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data jsonb;
    updated_count integer;
BEGIN
    -- If admin_id is provided, check admin permission
    IF admin_id_param IS NOT NULL THEN
        IF NOT is_admin_user(admin_id_param) THEN
            RAISE EXCEPTION 'Only admins can reject accounts';
        END IF;
    END IF;

    -- Update user account status with explicit privileges
    UPDATE users 
    SET 
        account_status = 'rejected',
        approved_by = admin_id_param,  -- Can be NULL for system rejections
        approved_at = NOW(),
        rejection_reason = reason_param,
        is_active = false,
        updated_at = NOW()
    WHERE id = user_id_param;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    -- Return result as JSON
    result_data = jsonb_build_object(
        'success', updated_count > 0,
        'user_id', user_id_param,
        'approved_by', admin_id_param,  -- Can be NULL
        'approved_at', NOW(),
        'rejection_reason', reason_param
    );

    RETURN result_data;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION approve_user_account(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user_account(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION approve_user_account(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION reject_user_account(UUID, UUID, TEXT) TO anon;

-- Grant service role explicit permissions
GRANT EXECUTE ON FUNCTION approve_user_account(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION reject_user_account(UUID, UUID, TEXT) TO service_role;
