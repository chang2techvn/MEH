-- Fix profile update triggers to handle background updates
-- The issue is that triggers are expecting post_id field on profile updates

-- Drop existing problematic triggers on profiles table if they exist
DROP TRIGGER IF EXISTS update_stats_on_profile_update ON profiles;
DROP TRIGGER IF EXISTS update_stats_on_profile_insert ON profiles;

-- Create a safer trigger function for profile updates that doesn't assume post_id exists
CREATE OR REPLACE FUNCTION trigger_safe_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only update stats if this is a meaningful change (not just background/avatar updates)
    -- We'll only trigger stats update if posts-related fields change
    IF TG_OP = 'UPDATE' THEN
        -- Check if any stats-related fields changed
        IF (OLD.total_posts IS DISTINCT FROM NEW.total_posts OR
            OLD.total_likes IS DISTINCT FROM NEW.total_likes OR
            OLD.total_comments IS DISTINCT FROM NEW.total_comments OR
            OLD.completed_challenges IS DISTINCT FROM NEW.completed_challenges) THEN
            -- Only then do we need to do something, but for now just log
            RAISE NOTICE 'Profile stats updated for user %', NEW.user_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Recreate trigger functions to be more defensive about field access
CREATE OR REPLACE FUNCTION trigger_update_stats_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Safely get the post_id
    IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
        target_post_id := NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
        target_post_id := OLD.post_id;
    ELSE
        -- No valid post_id, skip
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END IF;
    
    -- Get the post owner
    SELECT user_id INTO post_owner_id 
    FROM posts 
    WHERE id = target_post_id;
    
    -- Update stats for the post owner
    IF post_owner_id IS NOT NULL THEN
        PERFORM update_user_stats(post_owner_id);
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- Recreate trigger functions to be more defensive about field access
CREATE OR REPLACE FUNCTION trigger_update_stats_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Safely get the post_id
    IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
        target_post_id := NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
        target_post_id := OLD.post_id;
    ELSE
        -- No valid post_id, skip
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END IF;
    
    -- Get the post owner
    SELECT user_id INTO post_owner_id 
    FROM posts 
    WHERE id = target_post_id;
    
    -- Update stats for the post owner
    IF post_owner_id IS NOT NULL THEN
        PERFORM update_user_stats(post_owner_id);
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- Make sure we don't have any unwanted triggers on profiles table
-- Only create triggers on tables that actually need them

-- Recreate like triggers with the fixed function
DROP TRIGGER IF EXISTS update_stats_on_like_insert ON likes;
DROP TRIGGER IF EXISTS update_stats_on_like_delete ON likes;

CREATE TRIGGER update_stats_on_like_insert
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_like();

CREATE TRIGGER update_stats_on_like_delete
    AFTER DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_like();

-- Recreate comment triggers with the fixed function
DROP TRIGGER IF EXISTS update_stats_on_comment_insert ON comments;
DROP TRIGGER IF EXISTS update_stats_on_comment_delete ON comments;

CREATE TRIGGER update_stats_on_comment_insert
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_comment();

CREATE TRIGGER update_stats_on_comment_delete
    AFTER DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_comment();

-- Ensure background_url and avatar_url columns exist in profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS background_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add indexes for better performance on profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_background_url ON profiles (background_url) WHERE background_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles (avatar_url) WHERE avatar_url IS NOT NULL;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Fixed profile update triggers - background uploads should now work correctly';
END $$;
