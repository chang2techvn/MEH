-- Create admin delete user function
-- This function allows admins to delete users safely

CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role TEXT;
    result JSON;
BEGIN
    -- Check if current user is admin
    SELECT p.role INTO current_user_role
    FROM profiles p
    WHERE p.user_id = auth.uid();
    
    -- Only allow if user is admin
    IF current_user_role != 'admin' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unauthorized: Only admins can delete users'
        );
    END IF;
    
    -- Delete from profiles first (cascade should handle this, but being explicit)
    DELETE FROM profiles WHERE user_id = target_user_id;
    
    -- Delete from public users table
    DELETE FROM users WHERE id = target_user_id;
    
    -- Note: We cannot delete from auth.users from SQL functions
    -- That requires service role access through the API
    
    RETURN json_build_object(
        'success', true,
        'message', 'User deleted successfully from public tables',
        'note', 'Auth user still exists and should be cleaned up via admin panel'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID) TO authenticated;
