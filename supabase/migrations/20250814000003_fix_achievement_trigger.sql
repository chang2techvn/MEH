-- Fix achievement trigger functions that incorrectly reference post_id in posts table
-- The posts table uses 'id' field, not 'post_id'

-- Drop existing problematic triggers and functions
DROP TRIGGER IF EXISTS update_achievements_on_posts ON public.posts;
DROP TRIGGER IF EXISTS update_user_stats_on_posts ON public.posts;
DROP FUNCTION IF EXISTS update_achievements_on_posts();
DROP FUNCTION IF EXISTS update_user_stats_on_posts();

-- Recreate the correct trigger function for posts table (uses 'id' not 'post_id')
CREATE OR REPLACE FUNCTION update_achievements_on_posts()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;  -- Changed from NEW.post_id to NEW.id
            post_owner_id := NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.id;  -- Changed from OLD.post_id to OLD.id
            post_owner_id := OLD.user_id;
        END IF;
        
        -- Only proceed if we have a valid post_id and user_id
        IF target_post_id IS NOT NULL AND post_owner_id IS NOT NULL THEN
            PERFORM update_user_stats(post_owner_id);
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the main operation
        RAISE WARNING 'Achievement trigger failed: %', SQLERRM;
    END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the correct trigger function for user stats on posts
CREATE OR REPLACE FUNCTION update_user_stats_on_posts()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;  -- Changed from NEW.post_id to NEW.id
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.id;  -- Changed from OLD.post_id to OLD.id
        END IF;
        
        -- Only proceed if we have a valid post_id
        IF target_post_id IS NOT NULL THEN
            SELECT user_id INTO post_owner_id 
            FROM posts 
            WHERE id = target_post_id;
            
            -- Only update stats if we found the post owner
            IF post_owner_id IS NOT NULL THEN
                PERFORM update_user_stats(post_owner_id);
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the main operation
        RAISE WARNING 'User stats trigger failed: %', SQLERRM;
    END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers on posts table
CREATE TRIGGER update_achievements_on_posts
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_achievements_on_posts();

CREATE TRIGGER update_user_stats_on_posts
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_posts();

-- Note: The triggers for comments and likes tables should remain unchanged
-- as they correctly use 'post_id' field which exists in those tables
