-- COMPREHENSIVE FIX FOR POST_ID TRIGGER ERRORS
-- Run this script directly in Supabase SQL Editor
-- This fixes all triggers that incorrectly reference post_id in posts table

-- ==========================================
-- STEP 1: Fix trigger_check_achievements function
-- ==========================================
-- The main culprit: this function tries to use NEW.post_id on posts table
-- but posts table uses 'id' field, not 'post_id'

CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Check achievements for the user
  PERFORM check_and_award_achievements(
    CASE 
      WHEN TG_TABLE_NAME = 'posts' THEN NEW.user_id        -- ✅ FIXED: Use NEW.user_id for posts table
      WHEN TG_TABLE_NAME = 'likes' THEN (SELECT user_id FROM posts WHERE id = NEW.post_id)      -- ✅ OK: likes table has post_id
      WHEN TG_TABLE_NAME = 'comments' THEN (SELECT user_id FROM posts WHERE id = NEW.post_id)   -- ✅ OK: comments table has post_id
      WHEN TG_TABLE_NAME = 'profiles' THEN NEW.user_id     -- ✅ OK: profiles table has user_id
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STEP 2: Fix update_achievements_on_posts function
-- ==========================================
-- This function was already fixed in previous migrations but let's ensure it's correct

CREATE OR REPLACE FUNCTION update_achievements_on_posts()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;  -- ✅ FIXED: Use NEW.id not NEW.post_id
            post_owner_id := NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.id;  -- ✅ FIXED: Use OLD.id not OLD.post_id
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STEP 3: Fix update_user_stats_on_posts function
-- ==========================================

CREATE OR REPLACE FUNCTION update_user_stats_on_posts()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;  -- ✅ FIXED: Use NEW.id not NEW.post_id
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.id;  -- ✅ FIXED: Use OLD.id not OLD.post_id
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STEP 4: Verify other trigger functions are correct
-- ==========================================
-- These should already be correct but let's double-check

-- trigger_update_stats_on_post: Uses NEW.user_id, OLD.user_id ✅ CORRECT
-- safe_update_stats_on_post: Uses NEW.user_id, OLD.user_id ✅ CORRECT
-- update_user_experience: Uses NEW.user_id, NEW.score ✅ CORRECT
-- trigger_update_weekly_points: Uses NEW.user_id, OLD.user_id ✅ CORRECT

-- ==========================================
-- STEP 5: Verify all triggers are properly recreated
-- ==========================================

-- Drop and recreate triggers to ensure they use the fixed functions
DROP TRIGGER IF EXISTS trigger_achievements_on_post ON public.posts;
CREATE TRIGGER trigger_achievements_on_post
    AFTER INSERT OR UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_check_achievements();

DROP TRIGGER IF EXISTS update_achievements_on_posts ON public.posts;
CREATE TRIGGER update_achievements_on_posts
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_achievements_on_posts();

DROP TRIGGER IF EXISTS update_user_stats_on_posts ON public.posts;
CREATE TRIGGER update_user_stats_on_posts
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_posts();

-- ==========================================
-- STEP 6: Test the fix
-- ==========================================
-- You can test by running a simple insert to see if triggers work:
-- INSERT INTO posts (user_id, content, post_type, is_public) 
-- VALUES ('your-user-id', 'Test post', 'text', true);

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================
-- Run these to verify the triggers are working correctly:

-- 1. Check all triggers on posts table:
-- SELECT trigger_name, event_manipulation, action_statement 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'posts' 
-- ORDER BY trigger_name;

-- 2. Check if functions reference the correct fields:
-- SELECT routine_name, routine_definition 
-- FROM information_schema.routines 
-- WHERE routine_name LIKE '%post%' 
-- AND routine_definition LIKE '%post_id%';

COMMENT ON FUNCTION trigger_check_achievements() IS 'Fixed to use NEW.user_id for posts table instead of NEW.post_id';
COMMENT ON FUNCTION update_achievements_on_posts() IS 'Fixed to use NEW.id/OLD.id instead of NEW.post_id/OLD.post_id';
COMMENT ON FUNCTION update_user_stats_on_posts() IS 'Fixed to use NEW.id/OLD.id instead of NEW.post_id/OLD.post_id';

-- Done! The post_id errors should now be resolved.

