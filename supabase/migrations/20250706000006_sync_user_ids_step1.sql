-- Temporarily disable foreign key constraints for user ID sync
-- This allows us to safely update user IDs

-- Step 1: Drop all foreign key constraints that reference users.id
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE challenge_submissions DROP CONSTRAINT IF EXISTS challenge_submissions_user_id_fkey;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE evaluation_logs DROP CONSTRAINT IF EXISTS evaluation_logs_user_id_fkey;
ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey;

-- Step 2: Update user IDs to match auth.users
-- We'll do this manually for each user

-- john.smith@university.edu
UPDATE users SET id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE email = 'john.smith@university.edu';
UPDATE profiles SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE posts SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE user_progress SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE challenge_submissions SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE user_achievements SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE notifications SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE messages SET sender_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE sender_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE messages SET receiver_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE receiver_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE follows SET follower_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE follower_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE follows SET following_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE following_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE likes SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE comments SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE evaluation_logs SET user_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE user_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';
UPDATE admin_logs SET admin_id = '63b605f9-bb19-4c10-97b1-6b1188c1d5e3' WHERE admin_id = '10d0e389-266a-45d2-9d98-bac9aee7649a';

-- maria.garcia@university.edu
UPDATE users SET id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE email = 'maria.garcia@university.edu';
UPDATE profiles SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE posts SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE user_progress SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE challenge_submissions SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE user_achievements SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE notifications SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE messages SET sender_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE sender_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE messages SET receiver_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE receiver_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE follows SET follower_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE follower_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE follows SET following_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE following_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE likes SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE comments SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE evaluation_logs SET user_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE user_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';
UPDATE admin_logs SET admin_id = 'd5d6b178-b267-450c-882d-29b86f52c53a' WHERE admin_id = '2a1a69e6-8c02-4202-840d-fd0bd5284f05';

-- Add comment
COMMENT ON TABLE users IS 'Step 1: Foreign key constraints dropped, user IDs partially synced with auth.users';
