-- Fix achievements system function types to match actual database schema
-- This migration fixes type mismatches in the get_user_achievements function

-- Drop and recreate the function with correct types matching the actual database schema
DROP FUNCTION IF EXISTS get_user_achievements(UUID);

CREATE OR REPLACE FUNCTION get_user_achievements(user_id_param UUID)
RETURNS TABLE(
  achievement_key VARCHAR,
  title TEXT,
  description TEXT,
  icon TEXT,
  category VARCHAR,
  difficulty VARCHAR,
  points INTEGER,
  badge_color VARCHAR,
  is_completed BOOLEAN,
  progress INTEGER,
  requirement_value INTEGER,
  earned_at TIMESTAMP WITH TIME ZONE,
  category_display_name VARCHAR,
  category_color VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.key,
    a.title,
    a.description,
    COALESCE(a.icon_url, '📝') as icon, -- Use icon_url from actual schema, fallback to emoji
    COALESCE(a.category, 'general') as category,
    COALESCE(a.difficulty, 'easy') as difficulty,
    COALESCE(a.points, 0) as points,
    COALESCE(a.badge_color, a.badge_type, 'bronze') as badge_color, -- Use badge_color or badge_type
    COALESCE(ua.is_completed, false) as is_completed,
    COALESCE(ua.progress, 0) as progress,
    COALESCE(a.requirement_value, 1) as requirement_value,
    ua.earned_at,
    COALESCE(ac.display_name, 'General') as category_display_name,
    COALESCE(ac.color, 'blue') as category_color
  FROM achievements a
  LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = user_id_param
  LEFT JOIN achievement_categories ac ON ac.name = a.category
  WHERE a.is_active = true AND a.key IS NOT NULL
  ORDER BY COALESCE(ac.sort_order, 999), a.points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix the check_and_award_achievements function to handle the actual schema
DROP FUNCTION IF EXISTS check_and_award_achievements(UUID);

CREATE OR REPLACE FUNCTION check_and_award_achievements(user_id_param UUID)
RETURNS TABLE(newly_earned achievements) AS $$
DECLARE
  user_stats RECORD;
  achievement RECORD;
  user_achievement RECORD;
  current_progress INTEGER;
  should_award BOOLEAN;
BEGIN
  -- Get user statistics from profiles table
  SELECT 
    COALESCE(p.total_posts, 0) as total_posts,
    COALESCE(p.total_likes, 0) as total_likes,
    COALESCE(p.total_comments, 0) as total_comments,
    COALESCE(p.streak_days, 0) as streak_days,
    COALESCE(p.level, 1) as level,
    COALESCE(p.experience_points, 0) as experience_points,
    p.created_at as joined_at
  INTO user_stats
  FROM profiles p
  WHERE p.user_id = user_id_param;

  -- If no profile found, create basic stats from posts
  IF user_stats IS NULL THEN
    -- Calculate basic stats from posts table
    SELECT 
      COUNT(*) as total_posts,
      0 as total_likes,
      0 as total_comments,
      0 as streak_days,
      1 as level,
      COUNT(*) * 10 as experience_points,
      NOW() as joined_at
    INTO user_stats
    FROM posts 
    WHERE user_id = user_id_param;
  END IF;

  -- Check each achievement
  FOR achievement IN SELECT * FROM achievements WHERE is_active = true AND key IS NOT NULL
  LOOP
    -- Get current user achievement record
    SELECT * INTO user_achievement 
    FROM user_achievements ua 
    WHERE ua.user_id = user_id_param AND ua.achievement_id = achievement.id;

    -- Skip if already completed
    IF user_achievement IS NOT NULL AND user_achievement.is_completed THEN
      CONTINUE;
    END IF;

    should_award := false;
    current_progress := 0;

    -- Check different requirement types
    CASE COALESCE(achievement.requirement_type, 'count')
      WHEN 'count' THEN
        CASE achievement.key
          WHEN 'first_post', 'posts_10', 'posts_50', 'posts_100', 'posts_500' THEN
            current_progress := user_stats.total_posts;
          WHEN 'first_like', 'likes_10', 'likes_100', 'likes_500', 'likes_1000' THEN
            current_progress := user_stats.total_likes;
          WHEN 'first_comment', 'comments_50', 'comments_200' THEN
            current_progress := user_stats.total_comments;
          WHEN 'with_ai_1', 'with_ai_10', 'with_ai_50' THEN
            SELECT COUNT(*) INTO current_progress
            FROM posts 
            WHERE user_id = user_id_param 
            AND ai_evaluation IS NOT NULL 
            AND ai_evaluation != '';
          WHEN 'video_posts_5', 'video_posts_25' THEN
            SELECT COUNT(*) INTO current_progress
            FROM posts 
            WHERE user_id = user_id_param 
            AND post_type = 'video';
          WHEN 'image_posts_10' THEN
            SELECT COUNT(*) INTO current_progress
            FROM posts 
            WHERE user_id = user_id_param 
            AND post_type = 'image';
          ELSE
            current_progress := 0;
        END CASE;
        should_award := current_progress >= COALESCE(achievement.requirement_value, 1);

      WHEN 'streak' THEN
        current_progress := user_stats.streak_days;
        should_award := current_progress >= COALESCE(achievement.requirement_value, 1);

      WHEN 'threshold' THEN
        CASE achievement.key
          WHEN 'level_5', 'level_10', 'level_25' THEN
            current_progress := user_stats.level;
          WHEN 'xp_1000', 'xp_5000', 'xp_10000' THEN
            current_progress := user_stats.experience_points;
          ELSE
            current_progress := 0;
        END CASE;
        should_award := current_progress >= COALESCE(achievement.requirement_value, 1);

      WHEN 'special' THEN
        -- Special achievements need custom logic
        CASE achievement.key
          WHEN 'early_adopter' THEN
            should_award := user_stats.joined_at < '2025-08-15'::timestamp;
          WHEN 'multimedia_master' THEN
            SELECT 
              COUNT(DISTINCT post_type) >= 3
            INTO should_award
            FROM posts 
            WHERE user_id = user_id_param 
            AND post_type IN ('text', 'image', 'video');
          ELSE
            should_award := false;
        END CASE;
        current_progress := CASE WHEN should_award THEN 1 ELSE 0 END;
      ELSE
        -- Default case
        current_progress := 0;
        should_award := false;
    END CASE;

    -- Insert or update user achievement
    IF user_achievement IS NULL THEN
      INSERT INTO user_achievements (user_id, achievement_id, progress, is_completed, earned_at)
      VALUES (user_id_param, achievement.id, current_progress, should_award, 
              CASE WHEN should_award THEN NOW() ELSE NULL END);
    ELSE
      UPDATE user_achievements 
      SET progress = current_progress,
          is_completed = should_award,
          earned_at = CASE WHEN should_award AND NOT user_achievement.is_completed THEN NOW() ELSE user_achievement.earned_at END
      WHERE id = user_achievement.id;
    END IF;

    -- Return newly earned achievements
    IF should_award AND (user_achievement IS NULL OR NOT user_achievement.is_completed) THEN
      RETURN QUERY SELECT achievement.*;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_and_award_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_achievements(UUID) TO authenticated;
