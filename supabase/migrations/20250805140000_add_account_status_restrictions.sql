-- Add RLS policies to restrict access for pending/rejected/suspended accounts

-- Function to check if user account is approved and active
CREATE OR REPLACE FUNCTION is_account_approved(user_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id 
        AND account_status = 'approved' 
        AND is_active = true
    );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_account_approved(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_account_approved(UUID) TO anon;

-- Update users table policies to check account status
DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin_only" ON users;
DROP POLICY IF EXISTS "users_approval_operations" ON users;

-- New policy: Users can only see their own data if approved, admins can see all
CREATE POLICY "users_select_approved_or_admin" 
ON users 
FOR SELECT 
TO authenticated 
USING (
    (auth.uid() = id AND is_account_approved(auth.uid())) 
    OR is_admin_user(auth.uid())
);

-- Users can only update their own data if approved, admins can update all
CREATE POLICY "users_update_approved_or_admin" 
ON users 
FOR UPDATE 
TO authenticated 
USING (
    (auth.uid() = id AND is_account_approved(auth.uid())) 
    OR is_admin_user(auth.uid())
);

-- Only admins can insert/delete users
CREATE POLICY "users_insert_admin_only" 
ON users 
FOR INSERT 
TO authenticated 
WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "users_delete_admin_only" 
ON users 
FOR DELETE 
TO authenticated 
USING (is_admin_user(auth.uid()));

-- Restrict access to other tables for non-approved users
-- Posts table - only approved users can access
DROP POLICY IF EXISTS "Users can manage their posts" ON posts;
CREATE POLICY "approved_users_manage_posts" 
ON posts 
FOR ALL 
TO authenticated 
USING (
    is_account_approved(auth.uid())
    OR is_admin_user(auth.uid())
);

-- Comments table - only approved users can access  
DROP POLICY IF EXISTS "Users can manage their comments" ON comments;
CREATE POLICY "approved_users_manage_comments" 
ON comments 
FOR ALL 
TO authenticated 
USING (
    is_account_approved(auth.uid())
    OR is_admin_user(auth.uid())
);

-- Challenges table - only approved users can access
DROP POLICY IF EXISTS "Users can view active challenges" ON challenges;
CREATE POLICY "approved_users_view_challenges" 
ON challenges 
FOR SELECT 
TO authenticated 
USING (
    is_active = true 
    AND (is_account_approved(auth.uid()) OR is_admin_user(auth.uid()))
);

-- User challenges table - only approved users can access (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_challenges') THEN
        DROP POLICY IF EXISTS "Users can manage their challenge submissions" ON user_challenges;
        CREATE POLICY "approved_users_manage_challenge_submissions" 
        ON user_challenges 
        FOR ALL 
        TO authenticated 
        USING (
            (user_id = auth.uid() AND is_account_approved(auth.uid()))
            OR is_admin_user(auth.uid())
        );
    END IF;
END $$;

-- Messages table - only approved users can access (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        DROP POLICY IF EXISTS "Users can read messages they're involved in" ON messages;
        DROP POLICY IF EXISTS "Users can send messages" ON messages;

        CREATE POLICY "approved_users_read_messages" 
        ON messages 
        FOR SELECT 
        TO authenticated 
        USING (
            (sender_id = auth.uid() OR receiver_id = auth.uid()) 
            AND is_account_approved(auth.uid())
            OR is_admin_user(auth.uid())
        );

        CREATE POLICY "approved_users_send_messages" 
        ON messages 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (
            sender_id = auth.uid() 
            AND is_account_approved(auth.uid())
        );
    END IF;
END $$;

-- Conversation messages table - only approved users can access (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversation_messages') THEN
        DROP POLICY IF EXISTS "Users can read conversation messages they're involved in" ON conversation_messages;
        DROP POLICY IF EXISTS "Users can send conversation messages" ON conversation_messages;

        CREATE POLICY "approved_users_read_conversation_messages" 
        ON conversation_messages 
        FOR SELECT 
        TO authenticated 
        USING (
            sender_id = auth.uid()
            AND is_account_approved(auth.uid())
            OR is_admin_user(auth.uid())
        );

        CREATE POLICY "approved_users_send_conversation_messages" 
        ON conversation_messages 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (
            sender_id = auth.uid() 
            AND is_account_approved(auth.uid())
        );
    END IF;
END $$;

-- Events table - only approved users can access (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        DROP POLICY IF EXISTS "Public events are viewable by all" ON events;
        CREATE POLICY "approved_users_view_events" 
        ON events 
        FOR SELECT 
        TO authenticated 
        USING (
            is_public = true 
            AND is_active = true 
            AND (is_account_approved(auth.uid()) OR is_admin_user(auth.uid()))
        );
    END IF;
END $$;

-- Stories table - only approved users can access (if table exists)  
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stories') THEN
        DROP POLICY IF EXISTS "Active stories are viewable by authenticated users" ON stories;
        CREATE POLICY "approved_users_view_stories" 
        ON stories 
        FOR SELECT 
        TO authenticated 
        USING (
            is_active = true 
            AND expires_at > NOW()
            AND (is_account_approved(auth.uid()) OR is_admin_user(auth.uid()))
        );
    END IF;
END $$;

-- Notification settings - only approved users can access (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notification_settings') THEN
        DROP POLICY IF EXISTS "Users can manage their notification settings" ON notification_settings;
        CREATE POLICY "approved_users_manage_notification_settings" 
        ON notification_settings 
        FOR ALL 
        TO authenticated 
        USING (
            (user_id = auth.uid() AND is_account_approved(auth.uid()))
            OR is_admin_user(auth.uid())
        );
    END IF;
END $$;

-- Comments on this migration
COMMENT ON FUNCTION is_account_approved(UUID) IS 'Check if user account is approved and active';
COMMENT ON POLICY "users_select_approved_or_admin" ON users IS 'Only approved users and admins can select from users table';
COMMENT ON POLICY "approved_users_manage_posts" ON posts IS 'Only approved users can manage posts';
COMMENT ON POLICY "approved_users_manage_comments" ON comments IS 'Only approved users can manage comments';
