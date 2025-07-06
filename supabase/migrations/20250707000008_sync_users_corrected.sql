-- Final user sync migration with corrected profile handling
-- This migration syncs all user IDs between auth.users and public.users

-- Step 1: Create mapping table for ID conversion
CREATE TEMP TABLE user_sync_mapping AS
SELECT 
    au.id as new_id,
    pu.id as old_id,
    au.email,
    pu.role,
    pu.points,
    pu.level,
    pu.streak_days,
    pu.is_active,
    pu.last_login,
    pu.created_at,
    pu.updated_at
FROM auth.users au
JOIN public.users pu ON LOWER(TRIM(au.email)) = LOWER(TRIM(pu.email))
WHERE au.id != pu.id;

DO $$
BEGIN
    RAISE NOTICE 'Created mapping for % mismatched users', (SELECT COUNT(*) FROM user_sync_mapping);
END $$;

-- Step 2: Temporarily disable ALL foreign key constraints that reference users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_created_by_fkey;
ALTER TABLE conversation_participants DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;
ALTER TABLE conversation_messages DROP CONSTRAINT IF EXISTS conversation_messages_sender_id_fkey;
ALTER TABLE learning_paths DROP CONSTRAINT IF EXISTS learning_paths_created_by_fkey;
ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_created_by_fkey;
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE challenge_submissions DROP CONSTRAINT IF EXISTS challenge_submissions_user_id_fkey;
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_author_id_fkey;
ALTER TABLE story_views DROP CONSTRAINT IF EXISTS story_views_viewer_id_fkey;
ALTER TABLE notification_deliveries DROP CONSTRAINT IF EXISTS notification_deliveries_user_id_fkey;
ALTER TABLE scoring_templates DROP CONSTRAINT IF EXISTS scoring_templates_created_by_fkey;
ALTER TABLE ai_assistants DROP CONSTRAINT IF EXISTS ai_assistants_created_by_fkey;

-- Step 3: Update all foreign key references to use auth user IDs
-- Update profiles
UPDATE profiles 
SET user_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = profiles.user_id)
WHERE user_id IN (SELECT old_id FROM user_sync_mapping);

-- Update posts (if exists)
UPDATE posts 
SET user_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = posts.user_id)
WHERE user_id IN (SELECT old_id FROM user_sync_mapping);

-- Update conversation_participants
UPDATE conversation_participants 
SET user_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = conversation_participants.user_id)
WHERE user_id IN (SELECT old_id FROM user_sync_mapping);

-- Update conversation_messages
UPDATE conversation_messages 
SET sender_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = conversation_messages.sender_id)
WHERE sender_id IN (SELECT old_id FROM user_sync_mapping);

-- Update conversations created_by
UPDATE conversations 
SET created_by = (SELECT new_id FROM user_sync_mapping WHERE old_id = conversations.created_by)
WHERE created_by IN (SELECT old_id FROM user_sync_mapping);

-- Update learning_paths created_by
UPDATE learning_paths 
SET created_by = (SELECT new_id FROM user_sync_mapping WHERE old_id = learning_paths.created_by)
WHERE created_by IN (SELECT old_id FROM user_sync_mapping);

-- Update challenges created_by
UPDATE challenges 
SET created_by = (SELECT new_id FROM user_sync_mapping WHERE old_id = challenges.created_by)
WHERE created_by IN (SELECT old_id FROM user_sync_mapping);

-- Update user_progress (if exists)
UPDATE user_progress 
SET user_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = user_progress.user_id)
WHERE user_id IN (SELECT old_id FROM user_sync_mapping);

-- Update challenge_submissions (if exists)
UPDATE challenge_submissions 
SET user_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = challenge_submissions.user_id)
WHERE user_id IN (SELECT old_id FROM user_sync_mapping);

-- Update events created_by
UPDATE events 
SET created_by = (SELECT new_id FROM user_sync_mapping WHERE old_id = events.created_by)
WHERE created_by IN (SELECT old_id FROM user_sync_mapping);

-- Update stories author_id
UPDATE stories 
SET author_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = stories.author_id)
WHERE author_id IN (SELECT old_id FROM user_sync_mapping);

-- Update story_views viewer_id
UPDATE story_views 
SET viewer_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = story_views.viewer_id)
WHERE viewer_id IN (SELECT old_id FROM user_sync_mapping);

-- Update notification_deliveries user_id
UPDATE notification_deliveries 
SET user_id = (SELECT new_id FROM user_sync_mapping WHERE old_id = notification_deliveries.user_id)
WHERE user_id IN (SELECT old_id FROM user_sync_mapping);

-- Update scoring_templates created_by
UPDATE scoring_templates 
SET created_by = (SELECT new_id FROM user_sync_mapping WHERE old_id = scoring_templates.created_by)
WHERE created_by IN (SELECT old_id FROM user_sync_mapping);

-- Update ai_assistants created_by
UPDATE ai_assistants 
SET created_by = (SELECT new_id FROM user_sync_mapping WHERE old_id = ai_assistants.created_by)
WHERE created_by IN (SELECT old_id FROM user_sync_mapping);

-- Step 4: Delete old users and insert new ones with correct IDs
DELETE FROM public.users WHERE id IN (SELECT old_id FROM user_sync_mapping);

-- Insert users with auth IDs
INSERT INTO public.users (id, email, role, points, level, streak_days, is_active, last_login, created_at, updated_at)
SELECT 
    new_id,
    email,
    role,
    points,
    level,
    streak_days,
    is_active,
    last_login,
    created_at,
    NOW()
FROM user_sync_mapping;

-- Also ensure all auth users have public user records
INSERT INTO public.users (id, email, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    'student',
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 5: Re-enable foreign key constraints
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD CONSTRAINT conversations_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE conversation_participants 
ADD CONSTRAINT conversation_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE conversation_messages 
ADD CONSTRAINT conversation_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE learning_paths 
ADD CONSTRAINT learning_paths_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE challenges 
ADD CONSTRAINT challenges_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE events 
ADD CONSTRAINT events_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stories 
ADD CONSTRAINT stories_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE story_views 
ADD CONSTRAINT story_views_viewer_id_fkey 
FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notification_deliveries 
ADD CONSTRAINT notification_deliveries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE scoring_templates 
ADD CONSTRAINT scoring_templates_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE ai_assistants 
ADD CONSTRAINT ai_assistants_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- Step 6: Ensure all users have profiles
INSERT INTO profiles (
    user_id,
    username,
    full_name,
    avatar_url,
    bio,
    native_language,
    target_language,
    proficiency_level,
    timezone,
    created_at,
    updated_at
)
SELECT 
    u.id,
    LOWER(SPLIT_PART(u.email, '@', 1)) as username,
    INITCAP(REPLACE(SPLIT_PART(u.email, '@', 1), '.', ' ')) as full_name,
    '/placeholder-user.jpg' as avatar_url,
    'Learning English together!' as bio,
    'English' as native_language,
    'English' as target_language,
    'beginner' as proficiency_level,
    'UTC' as timezone,
    COALESCE(u.created_at, NOW()) as created_at,
    NOW() as updated_at
FROM public.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Step 7: Create functions and triggers for future sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    RAISE NOTICE 'Creating public records for new user: %', NEW.email;
    
    -- Insert into public.users
    INSERT INTO public.users (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'student',
        NEW.created_at,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    -- Insert into profiles
    INSERT INTO profiles (
        user_id,
        username,
        full_name,
        avatar_url,
        bio,
        native_language,
        target_language,
        proficiency_level,
        timezone,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        LOWER(SPLIT_PART(NEW.email, '@', 1)),
        INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' ')),
        '/placeholder-user.jpg',
        'Learning English together!',
        'English',
        'English',
        'beginner',
        'UTC',
        NEW.created_at,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
    -- Update public.users
    UPDATE public.users 
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Step 8: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_messages TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Step 9: Final verification
DO $$
DECLARE
    auth_count INTEGER;
    users_count INTEGER;
    profiles_count INTEGER;
    mismatch_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO users_count FROM public.users;
    SELECT COUNT(*) INTO profiles_count FROM profiles;
    
    -- Check for remaining ID mismatches
    SELECT COUNT(*) INTO mismatch_count
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id AND au.email = pu.email
    WHERE pu.id IS NULL;
    
    RAISE NOTICE '=== FINAL SYNC VERIFICATION ===';
    RAISE NOTICE 'auth.users count: %', auth_count;
    RAISE NOTICE 'public.users count: %', users_count;
    RAISE NOTICE 'profiles count: %', profiles_count;
    RAISE NOTICE 'ID mismatches remaining: %', mismatch_count;
    
    IF mismatch_count = 0 AND auth_count = users_count AND auth_count = profiles_count THEN
        RAISE NOTICE '✅ SUCCESS: All users are now perfectly synchronized!';
        RAISE NOTICE '✅ All auth user IDs now match public user IDs and profile IDs!';
    ELSE
        RAISE WARNING '❌ SYNC INCOMPLETE: Still have issues!';
    END IF;
END $$;
