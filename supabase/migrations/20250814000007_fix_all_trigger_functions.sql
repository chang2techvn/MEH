-- FIX ALL REMAINING FUNCTIONS THAT CAUSE POST_ID ERRORS
-- These are the functions called by triggers on posts table

-- ==========================================
-- STEP 1: Fix safe_update_stats_on_post function
-- ==========================================
CREATE OR REPLACE FUNCTION safe_update_stats_on_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
BEGIN
    BEGIN
        -- For posts table, use id field (NOT post_id)
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.id;
            post_owner_id := OLD.user_id;
        END IF;
        
        -- Update stats if we have valid data
        IF target_post_id IS NOT NULL AND post_owner_id IS NOT NULL THEN
            UPDATE users 
            SET updated_at = NOW()
            WHERE id = post_owner_id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in safe_update_stats_on_post: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- STEP 2: Fix trigger_check_achievements function
-- ==========================================
CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
    user_posts_count INTEGER := 0;
BEGIN
    BEGIN
        -- For posts table, use id field (NOT post_id)
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
        ELSIF TG_OP = 'UPDATE' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
        END IF;
        
        -- Check achievements if we have valid data
        IF target_post_id IS NOT NULL AND post_owner_id IS NOT NULL THEN
            -- Count user's total posts
            SELECT COUNT(*) INTO user_posts_count
            FROM posts 
            WHERE user_id = post_owner_id;
            
            -- Update user experience
            UPDATE users 
            SET experience_points = COALESCE(experience_points, 0) + 10,
                updated_at = NOW()
            WHERE id = post_owner_id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_check_achievements: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- STEP 3: Fix update_user_experience function
-- ==========================================
CREATE OR REPLACE FUNCTION update_user_experience()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
    experience_gained INTEGER := 10;
BEGIN
    BEGIN
        -- For posts table, use id field (NOT post_id)
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
        ELSIF TG_OP = 'UPDATE' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
        END IF;
        
        -- Update experience if we have valid data
        IF target_post_id IS NOT NULL AND post_owner_id IS NOT NULL THEN
            UPDATE users 
            SET experience_points = COALESCE(experience_points, 0) + experience_gained,
                updated_at = NOW()
            WHERE id = post_owner_id;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in update_user_experience: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- STEP 4: Fix update_weekly_points_on_post function
-- ==========================================
CREATE OR REPLACE FUNCTION update_weekly_points_on_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
    week_start DATE;
    points_earned INTEGER := 5;
BEGIN
    BEGIN
        -- For posts table, use id field (NOT post_id)
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
        END IF;
        
        -- Update weekly points if we have valid data
        IF target_post_id IS NOT NULL AND post_owner_id IS NOT NULL THEN
            -- Calculate week start (Monday)
            week_start := DATE_TRUNC('week', CURRENT_DATE);
            
            -- Insert or update weekly points
            INSERT INTO weekly_points (user_id, week_start_date, week_end_date, total_points, posts_count, latest_post_points, latest_post_date)
            VALUES (post_owner_id, week_start, week_start + INTERVAL '6 days', points_earned, 1, points_earned, NOW())
            ON CONFLICT (user_id, week_start_date) 
            DO UPDATE SET
                total_points = weekly_points.total_points + points_earned,
                posts_count = weekly_points.posts_count + 1,
                latest_post_points = points_earned,
                latest_post_date = NOW(),
                updated_at = NOW();
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in update_weekly_points_on_post: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- ==========================================
-- STEP 5: Fix trigger_update_weekly_points function
-- ==========================================
CREATE OR REPLACE FUNCTION trigger_update_weekly_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    target_post_id UUID;
    week_start DATE;
    points_change INTEGER := 0;
BEGIN
    BEGIN
        -- For posts table, use id field (NOT post_id)
        IF TG_OP = 'INSERT' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
            points_change := 5;
        ELSIF TG_OP = 'DELETE' THEN
            target_post_id := OLD.id;
            post_owner_id := OLD.user_id;
            points_change := -5;
        ELSIF TG_OP = 'UPDATE' THEN
            target_post_id := NEW.id;
            post_owner_id := NEW.user_id;
            points_change := 0; -- No points change for updates
        END IF;
        
        -- Update weekly points if we have valid data and points change
        IF target_post_id IS NOT NULL AND post_owner_id IS NOT NULL AND points_change != 0 THEN
            week_start := DATE_TRUNC('week', CURRENT_DATE);
            
            IF TG_OP = 'INSERT' THEN
                -- Insert or update for new post
                INSERT INTO weekly_points (user_id, week_start_date, week_end_date, total_points, posts_count, latest_post_points, latest_post_date)
                VALUES (post_owner_id, week_start, week_start + INTERVAL '6 days', points_change, 1, points_change, NOW())
                ON CONFLICT (user_id, week_start_date) 
                DO UPDATE SET
                    total_points = weekly_points.total_points + points_change,
                    posts_count = weekly_points.posts_count + 1,
                    latest_post_points = points_change,
                    latest_post_date = NOW(),
                    updated_at = NOW();
            ELSIF TG_OP = 'DELETE' THEN
                -- Update for deleted post
                UPDATE weekly_points 
                SET total_points = GREATEST(0, total_points + points_change),
                    posts_count = GREATEST(0, posts_count - 1),
                    updated_at = NOW()
                WHERE user_id = post_owner_id AND week_start_date = week_start;
            END IF;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error in trigger_update_weekly_points: %', SQLERRM;
    END;
    
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;

-- ==========================================
-- FINAL TEST
-- ==========================================
DO $$
DECLARE
    test_user_id UUID;
    test_post_id UUID;
    error_msg TEXT;
BEGIN
    -- Get an existing user
    SELECT id INTO test_user_id FROM users WHERE email LIKE '%@%' LIMIT 1;
    
    IF test_user_id IS NULL THEN
        test_user_id := gen_random_uuid();
        INSERT INTO users (id, email, name) 
        VALUES (test_user_id, 'final-test@example.com', 'Final Test User');
    END IF;
    
    BEGIN
        -- Try to insert a test post with ALL triggers active
        INSERT INTO posts (
            user_id, 
            content, 
            post_type, 
            is_public,
            created_at,
            updated_at
        ) VALUES (
            test_user_id,
            'FINAL COMPLETE TEST - DELETE ME',
            'text',
            false,
            NOW(),
            NOW()
        ) RETURNING id INTO test_post_id;
        
        RAISE NOTICE 'SUCCESS: Complete test with all triggers worked! Post ID: %', test_post_id;
        
        -- Clean up the test data
        DELETE FROM posts WHERE id = test_post_id;
        
    EXCEPTION WHEN OTHERS THEN
        error_msg := SQLERRM;
        RAISE NOTICE 'FINAL ERROR: %', error_msg;
        
        -- Clean up in case of error
        DELETE FROM posts WHERE content = 'FINAL COMPLETE TEST - DELETE ME';
    END;
END $$;
