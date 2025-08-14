-- FINAL FIX FOR POST_ID FIELD ERRORS
-- This migration fixes all remaining functions that incorrectly reference NEW.post_id on posts table

-- ==========================================
-- STEP 1: Fix safe_update_stats_on_comment function
-- ==========================================
CREATE OR REPLACE FUNCTION safe_update_stats_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        -- For comments table, use post_id field
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.post_id;
        END IF;
        
        -- Only proceed if we have a valid post_id
        IF target_post_id IS NOT NULL THEN
            -- Get post owner
            SELECT user_id INTO post_owner_id 
            FROM posts 
            WHERE id = target_post_id;
            
            -- Update stats if we found the post owner
            IF post_owner_id IS NOT NULL THEN
                -- Update user stats safely
                UPDATE users 
                SET updated_at = NOW()
                WHERE id = post_owner_id;
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the operation
        RAISE WARNING 'Error updating stats on comment: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- STEP 2: Fix safe_update_stats_on_like function
-- ==========================================
CREATE OR REPLACE FUNCTION safe_update_stats_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        -- For likes table, use post_id field
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.post_id;
        END IF;
        
        -- Only proceed if we have a valid post_id
        IF target_post_id IS NOT NULL THEN
            -- Get post owner
            SELECT user_id INTO post_owner_id 
            FROM posts 
            WHERE id = target_post_id;
            
            -- Update stats if we found the post owner
            IF post_owner_id IS NOT NULL THEN
                -- Update user stats safely
                UPDATE users 
                SET updated_at = NOW()
                WHERE id = post_owner_id;
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the operation
        RAISE WARNING 'Error updating stats on like: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- STEP 3: Fix trigger_update_stats_on_comment function
-- ==========================================
CREATE OR REPLACE FUNCTION trigger_update_stats_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- For comments table only
    BEGIN
        IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
            target_post_id := NEW.post_id;
        ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
            target_post_id := OLD.post_id;
        END IF;
        
        -- Get post owner if we have a target_post_id
        IF target_post_id IS NOT NULL THEN
            SELECT user_id INTO post_owner_id 
            FROM posts 
            WHERE id = target_post_id;
            
            -- Update stats if we have a valid user
            IF post_owner_id IS NOT NULL THEN
                UPDATE users 
                SET updated_at = NOW()
                WHERE id = post_owner_id;
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_update_stats_on_comment: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- STEP 4: Fix trigger_update_stats_on_like function
-- ==========================================
CREATE OR REPLACE FUNCTION trigger_update_stats_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- For likes table only
    BEGIN
        IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
            target_post_id := NEW.post_id;
        ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
            target_post_id := OLD.post_id;
        END IF;
        
        -- Get post owner if we have a target_post_id
        IF target_post_id IS NOT NULL THEN
            SELECT user_id INTO post_owner_id 
            FROM posts 
            WHERE id = target_post_id;
            
            -- Update stats if we have a valid user
            IF post_owner_id IS NOT NULL THEN
                UPDATE users 
                SET updated_at = NOW()
                WHERE id = post_owner_id;
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_update_stats_on_like: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- STEP 5: Ensure update_achievements_on_posts is correct for posts table
-- ==========================================
CREATE OR REPLACE FUNCTION update_achievements_on_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        -- For posts table, use id field (NOT post_id)
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.id;
            post_owner_id := OLD.user_id;
        END IF;
        
        -- Only proceed if we have valid data
        IF target_post_id IS NOT NULL AND post_owner_id IS NOT NULL THEN
            -- Update user experience points or stats
            UPDATE users 
            SET experience_points = COALESCE(experience_points, 0) + 10,
                updated_at = NOW()
            WHERE id = post_owner_id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error updating achievements on posts: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- STEP 6: Ensure update_user_stats_on_posts is correct for posts table
-- ==========================================
CREATE OR REPLACE FUNCTION update_user_stats_on_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    -- Skip if we don't have the necessary data
    BEGIN
        -- For posts table, use id field (NOT post_id)
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.id;
            post_owner_id := OLD.user_id;
        END IF;
        
        -- Only proceed if we have valid data
        IF target_post_id IS NOT NULL AND post_owner_id IS NOT NULL THEN
            -- Update user stats
            UPDATE users 
            SET points = COALESCE(points, 0) + 5,
                updated_at = NOW()
            WHERE id = post_owner_id;
            
            -- Update profile stats if profiles table exists
            UPDATE profiles 
            SET total_posts = COALESCE(total_posts, 0) + 1,
                updated_at = NOW()
            WHERE user_id = post_owner_id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error updating user stats on posts: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- VERIFICATION: Test if the fix works
-- ==========================================
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_post_id UUID;
    error_msg TEXT;
BEGIN
    -- First create a test user
    INSERT INTO users (id, email, name) 
    VALUES (test_user_id, 'test@example.com', 'Test User');
    
    BEGIN
        -- Try to insert a test post
        INSERT INTO posts (
            user_id, 
            content, 
            post_type, 
            is_public,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            'FINAL TEST POST - DELETE ME',
            'text',
            false,
            NOW(),
            NOW()
        ) RETURNING id INTO test_post_id;
        
        RAISE NOTICE 'SUCCESS: Final test insert worked! Post ID: %', test_post_id;
        
        -- Clean up the test data
        DELETE FROM posts WHERE id = test_post_id;
        DELETE FROM users WHERE id = test_user_id;
        
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        RAISE NOTICE 'STILL ERROR: %', error_msg;
        
        -- Clean up in case of error
        DELETE FROM posts WHERE content = 'FINAL TEST POST - DELETE ME';
        DELETE FROM users WHERE id = test_user_id;
    END;
END $$;
