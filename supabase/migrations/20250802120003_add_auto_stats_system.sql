-- Create function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    posts_count INTEGER := 0;
    likes_count INTEGER := 0;
    comments_count INTEGER := 0;
    challenges_count INTEGER := 0;
    current_level INTEGER := 1;
    current_xp INTEGER := 0;
BEGIN
    -- Count total posts by user
    SELECT COUNT(*) INTO posts_count
    FROM posts 
    WHERE user_id = user_id_param;

    -- Count total likes on user's posts
    SELECT COUNT(l.*) INTO likes_count
    FROM likes l
    INNER JOIN posts p ON l.post_id = p.id
    WHERE p.user_id = user_id_param;

    -- Count total comments on user's posts
    SELECT COUNT(c.*) INTO comments_count
    FROM comments c
    INNER JOIN posts p ON c.post_id = p.id
    WHERE p.user_id = user_id_param;

    -- Count completed challenges (try multiple table names)
    BEGIN
        SELECT COUNT(*) INTO challenges_count
        FROM user_challenges 
        WHERE user_id = user_id_param AND status = 'completed';
    EXCEPTION 
        WHEN undefined_table THEN
            -- If user_challenges doesn't exist, try challenges table
            BEGIN
                SELECT COUNT(*) INTO challenges_count
                FROM challenges 
                WHERE user_id = user_id_param;
            EXCEPTION 
                WHEN undefined_table THEN
                    challenges_count := 0;
            END;
    END;

    -- Calculate experience points
    current_xp := (posts_count * 10) + (likes_count * 2) + (comments_count * 1) + (challenges_count * 50);
    
    -- Calculate level based on XP (every 100 XP = 1 level)
    current_level := GREATEST(1, (current_xp / 100) + 1);

    -- Update or insert profile stats
    INSERT INTO profiles (
        user_id, 
        total_posts, 
        total_likes, 
        total_comments, 
        completed_challenges,
        level,
        experience_points,
        updated_at
    )
    VALUES (
        user_id_param,
        posts_count,
        likes_count,
        comments_count,
        challenges_count,
        current_level,
        current_xp,
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_posts = posts_count,
        total_likes = likes_count,
        total_comments = comments_count,
        completed_challenges = challenges_count,
        level = current_level,
        experience_points = current_xp,
        updated_at = NOW();

    -- Log the update
    RAISE NOTICE 'Updated stats for user %: Posts=%, Likes=%, Comments=%, Challenges=%, Level=%, XP=%', 
        user_id_param, posts_count, likes_count, comments_count, challenges_count, current_level, current_xp;
END;
$$;

-- Create trigger function for posts
CREATE OR REPLACE FUNCTION trigger_update_stats_on_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update stats for the post owner
    IF TG_OP = 'INSERT' THEN
        PERFORM update_user_stats(NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_user_stats(OLD.user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Create trigger function for likes
CREATE OR REPLACE FUNCTION trigger_update_stats_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    -- Get the post owner
    SELECT user_id INTO post_owner_id 
    FROM posts 
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    
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

-- Create trigger function for comments
CREATE OR REPLACE FUNCTION trigger_update_stats_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    -- Get the post owner
    SELECT user_id INTO post_owner_id 
    FROM posts 
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    
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

-- Create trigger function for challenges
CREATE OR REPLACE FUNCTION trigger_update_stats_on_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update stats for the user
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_user_stats(NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_user_stats(OLD.user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Add columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_posts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_challenges INTEGER DEFAULT 0;

-- Create triggers
DROP TRIGGER IF EXISTS update_stats_on_post_insert ON posts;
DROP TRIGGER IF EXISTS update_stats_on_post_delete ON posts;
DROP TRIGGER IF EXISTS update_stats_on_like_insert ON likes;
DROP TRIGGER IF EXISTS update_stats_on_like_delete ON likes;
DROP TRIGGER IF EXISTS update_stats_on_comment_insert ON comments;
DROP TRIGGER IF EXISTS update_stats_on_comment_delete ON comments;

-- Posts triggers
CREATE TRIGGER update_stats_on_post_insert
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_post();

CREATE TRIGGER update_stats_on_post_delete
    AFTER DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_post();

-- Likes triggers
CREATE TRIGGER update_stats_on_like_insert
    AFTER INSERT ON likes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_like();

CREATE TRIGGER update_stats_on_like_delete
    AFTER DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_like();

-- Comments triggers
CREATE TRIGGER update_stats_on_comment_insert
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_comment();

CREATE TRIGGER update_stats_on_comment_delete
    AFTER DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stats_on_comment();

-- Challenge triggers (try both table names)
DO $$
BEGIN
    -- Try user_challenges table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_challenges') THEN
        DROP TRIGGER IF EXISTS update_stats_on_user_challenge_insert ON user_challenges;
        DROP TRIGGER IF EXISTS update_stats_on_user_challenge_update ON user_challenges;
        DROP TRIGGER IF EXISTS update_stats_on_user_challenge_delete ON user_challenges;
        
        CREATE TRIGGER update_stats_on_user_challenge_insert
            AFTER INSERT ON user_challenges
            FOR EACH ROW
            EXECUTE FUNCTION trigger_update_stats_on_challenge();
            
        CREATE TRIGGER update_stats_on_user_challenge_update
            AFTER UPDATE ON user_challenges
            FOR EACH ROW
            EXECUTE FUNCTION trigger_update_stats_on_challenge();
            
        CREATE TRIGGER update_stats_on_user_challenge_delete
            AFTER DELETE ON user_challenges
            FOR EACH ROW
            EXECUTE FUNCTION trigger_update_stats_on_challenge();
    END IF;
    
    -- Try challenges table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenges') THEN
        DROP TRIGGER IF EXISTS update_stats_on_challenge_insert ON challenges;
        DROP TRIGGER IF EXISTS update_stats_on_challenge_delete ON challenges;
        
        CREATE TRIGGER update_stats_on_challenge_insert
            AFTER INSERT ON challenges
            FOR EACH ROW
            EXECUTE FUNCTION trigger_update_stats_on_challenge();
            
        CREATE TRIGGER update_stats_on_challenge_delete
            AFTER DELETE ON challenges
            FOR EACH ROW
            EXECUTE FUNCTION trigger_update_stats_on_challenge();
    END IF;
END $$;

-- Initialize stats for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM posts 
        WHERE user_id IS NOT NULL
    LOOP
        PERFORM update_user_stats(user_record.user_id);
    END LOOP;
    
    RAISE NOTICE 'Initialized stats for existing users';
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_stats ON profiles (user_id, total_posts, total_likes, level);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes (post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_user ON comments (post_id, user_id);
