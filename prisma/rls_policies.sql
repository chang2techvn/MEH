-- Row Level Security Policies for English Learning Platform
-- Run these SQL commands in Supabase SQL Editor

-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_safety_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Public profiles are viewable by authenticated users"
ON users FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow user creation during signup"
ON users FOR INSERT
WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Only admins can delete users"
ON users FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
ON user_achievements FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view others' achievements"
ON user_achievements FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only system can create achievements"
ON user_achievements FOR INSERT
WITH CHECK (false); -- Only through backend

-- Conversations policies
CREATE POLICY "Users can view conversations they participate in"
ON conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE "conversationId" = conversations.id 
    AND "userId" = auth.uid()::text
    AND "isActive" = true
  )
);

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Participants can update their conversations"
ON conversations FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE "conversationId" = conversations.id 
    AND "userId" = auth.uid()::text
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations"
ON conversation_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2."conversationId" = conversation_participants."conversationId"
    AND cp2."userId" = auth.uid()::text
    AND cp2."isActive" = true
  )
);

CREATE POLICY "Users can join conversations"
ON conversation_participants FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can leave conversations"
ON conversation_participants FOR UPDATE
WITH CHECK (auth.uid()::text = "userId");

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE "conversationId" = messages."conversationId" 
    AND "userId" = auth.uid()::text
    AND "isActive" = true
  )
);

CREATE POLICY "Users can send messages to their conversations"
ON messages FOR INSERT
WITH CHECK (
  auth.uid()::text = "senderId" AND
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE "conversationId" = messages."conversationId" 
    AND "userId" = auth.uid()::text
    AND "isActive" = true
  )
);

CREATE POLICY "Users can edit their own messages"
ON messages FOR UPDATE
WITH CHECK (auth.uid()::text = "senderId");

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
USING (auth.uid()::text = "senderId");

-- Challenges policies
CREATE POLICY "Anyone can view active public challenges"
ON challenges FOR SELECT
USING ("isActive" = true AND "isPublic" = true);

CREATE POLICY "Only admins and moderators can create challenges"
ON challenges FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

CREATE POLICY "Only admins and moderators can update challenges"
ON challenges FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

CREATE POLICY "Only admins can delete challenges"
ON challenges FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- Challenge submissions policies
CREATE POLICY "Users can view their own submissions"
ON challenge_submissions FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Admins can view all submissions"
ON challenge_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

CREATE POLICY "Users can create their own submissions"
ON challenge_submissions FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own submissions"
ON challenge_submissions FOR UPDATE
WITH CHECK (auth.uid()::text = "userId");

-- Resources policies
CREATE POLICY "Anyone can view public active resources"
ON resources FOR SELECT
USING ("isPublic" = true AND "isActive" = true);

CREATE POLICY "Users can view their own resources"
ON resources FOR SELECT
USING (auth.uid()::text = "uploadedBy");

CREATE POLICY "Authenticated users can create resources"
ON resources FOR INSERT
WITH CHECK (auth.uid()::text = "uploadedBy");

CREATE POLICY "Users can update their own resources"
ON resources FOR UPDATE
WITH CHECK (auth.uid()::text = "uploadedBy");

CREATE POLICY "Users can delete their own resources"
ON resources FOR DELETE
USING (auth.uid()::text = "uploadedBy");

CREATE POLICY "Admins can manage all resources"
ON resources FOR ALL
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true); -- Allows backend to create notifications

-- AI Models policies (Admin only)
CREATE POLICY "Only admins can manage AI models"
ON ai_models FOR ALL
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- API Keys policies (Admin only)
CREATE POLICY "Only admins can manage API keys"
ON api_keys FOR ALL
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- Evaluation logs policies
CREATE POLICY "Users can view their own evaluation logs"
ON evaluation_logs FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Admins can view all evaluation logs"
ON evaluation_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

CREATE POLICY "System can create evaluation logs"
ON evaluation_logs FOR INSERT
WITH CHECK (true);

-- Banned terms policies (Admin only)
CREATE POLICY "Only admins can manage banned terms"
ON banned_terms FOR ALL
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- AI safety rules policies (Admin only)
CREATE POLICY "Only admins can manage AI safety rules"
ON ai_safety_rules FOR ALL
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- Flagged content policies
CREATE POLICY "Moderators can view flagged content"
ON flagged_content FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

CREATE POLICY "Moderators can update flagged content"
ON flagged_content FOR UPDATE
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role IN ('ADMIN', 'MODERATOR')
  )
);

CREATE POLICY "System can create flagged content"
ON flagged_content FOR INSERT
WITH CHECK (true);

-- Scoring templates policies (Admin only)
CREATE POLICY "Only admins can manage scoring templates"
ON scoring_templates FOR ALL
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

-- Admin logs policies (Admin only)
CREATE POLICY "Only admins can view admin logs"
ON admin_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);

CREATE POLICY "System can create admin logs"
ON admin_logs FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_messages_conversation_created ON messages("conversationId", "createdAt");
CREATE INDEX idx_notifications_user_read ON notifications("userId", "isRead");
CREATE INDEX idx_challenge_submissions_user ON challenge_submissions("userId");
CREATE INDEX idx_challenge_submissions_challenge ON challenge_submissions("challengeId");
CREATE INDEX idx_evaluation_logs_user_created ON evaluation_logs("userId", "createdAt");
CREATE INDEX idx_flagged_content_status_flagged ON flagged_content(status, "flaggedAt");
CREATE INDEX idx_admin_logs_admin_created ON admin_logs("adminId", "createdAt");
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants("conversationId");
CREATE INDEX idx_conversation_participants_user ON conversation_participants("userId");

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_role(user_id text)
RETURNS text AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role = 'ADMIN' FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION is_moderator_or_admin(user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT role IN ('ADMIN', 'MODERATOR') FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
