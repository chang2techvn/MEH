-- Update existing achievements system to add comprehensive features
-- This migration adds missing columns and functions to the existing achievements tables

-- Add missing columns to achievements table
ALTER TABLE achievements 
ADD COLUMN IF NOT EXISTS key VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'easy',
ADD COLUMN IF NOT EXISTS requirement_type VARCHAR(50) DEFAULT 'count',
ADD COLUMN IF NOT EXISTS requirement_value INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS requirement_data JSONB,
ADD COLUMN IF NOT EXISTS badge_color VARCHAR(20) DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to user_achievements table
ALTER TABLE user_achievements 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create achievement_categories table
CREATE TABLE IF NOT EXISTS achievement_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20) DEFAULT 'blue',
  sort_order INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_key ON achievements(key);

-- Enable RLS on new table
ALTER TABLE achievement_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Achievement categories are viewable by everyone" ON achievement_categories;
CREATE POLICY "Achievement categories are viewable by everyone" ON achievement_categories FOR SELECT USING (true);

-- Update existing RLS policies
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON user_achievements;
CREATE POLICY "User achievements are viewable by everyone" ON user_achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own achievements" ON user_achievements;
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own achievements" ON user_achievements;
CREATE POLICY "Users can update their own achievements" ON user_achievements FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert achievement categories
INSERT INTO achievement_categories (name, display_name, description, icon, color, sort_order) VALUES
  ('engagement', 'Engagement', 'Active participation in the community', '💬', 'blue', 1),
  ('learning', 'Learning', 'Progress in English learning journey', '📚', 'green', 2),
  ('social', 'Social', 'Building connections and helping others', '👥', 'purple', 3),
  ('milestone', 'Milestones', 'Major accomplishments and milestones', '🏆', 'gold', 4),
  ('streak', 'Streaks', 'Consistency and daily habits', '🔥', 'red', 5),
  ('creative', 'Creative', 'Creative content and contributions', '🎨', 'pink', 6),
  ('helpful', 'Helpful', 'Helping others and contributing to community', '🤝', 'orange', 7),
  ('special', 'Special', 'Rare and special achievements', '✨', 'rainbow', 8)
ON CONFLICT (name) DO NOTHING;

-- Clear existing achievements and insert comprehensive ones
DELETE FROM achievements WHERE key IS NOT NULL;

-- Insert comprehensive achievements
INSERT INTO achievements (key, title, description, icon_url, category, difficulty, points, requirement_type, requirement_value, badge_color, badge_type, criteria) VALUES
  -- Engagement Achievements
  ('first_post', 'First Post', 'Created your first post', '📝', 'engagement', 'easy', 10, 'count', 1, 'bronze', 'bronze', '{"type": "post_count", "value": 1}'::jsonb),
  ('posts_10', 'Active Contributor', 'Created 10 posts', '📚', 'engagement', 'easy', 25, 'count', 10, 'bronze', 'bronze', '{"type": "post_count", "value": 10}'::jsonb),
  ('posts_50', 'Content Creator', 'Created 50 posts', '✍️', 'engagement', 'medium', 100, 'count', 50, 'silver', 'silver', '{"type": "post_count", "value": 50}'::jsonb),
  ('posts_100', 'Prolific Writer', 'Created 100 posts', '📖', 'engagement', 'hard', 250, 'count', 100, 'gold', 'gold', '{"type": "post_count", "value": 100}'::jsonb),
  ('posts_500', 'Master Blogger', 'Created 500 posts', '🏆', 'engagement', 'legendary', 1000, 'count', 500, 'platinum', 'platinum', '{"type": "post_count", "value": 500}'::jsonb),
  
  -- Social Achievements  
  ('first_like', 'First Appreciation', 'Received your first like', '❤️', 'social', 'easy', 5, 'count', 1, 'bronze', 'bronze', '{"type": "like_count", "value": 1}'::jsonb),
  ('likes_10', 'Well Liked', 'Received 10 likes', '💖', 'social', 'easy', 20, 'count', 10, 'bronze', 'bronze', '{"type": "like_count", "value": 10}'::jsonb),
  ('likes_100', 'Popular Creator', 'Received 100 likes', '🌟', 'social', 'medium', 100, 'count', 100, 'silver', 'silver', '{"type": "like_count", "value": 100}'::jsonb),
  ('likes_500', 'Community Favorite', 'Received 500 likes', '⭐', 'social', 'hard', 300, 'count', 500, 'gold', 'gold', '{"type": "like_count", "value": 500}'::jsonb),
  ('likes_1000', 'Social Star', 'Received 1000 likes', '🌟', 'social', 'legendary', 750, 'count', 1000, 'platinum', 'platinum', '{"type": "like_count", "value": 1000}'::jsonb),
  
  ('first_comment', 'Conversation Starter', 'Made your first comment', '💬', 'social', 'easy', 5, 'count', 1, 'bronze', 'bronze', '{"type": "comment_count", "value": 1}'::jsonb),
  ('comments_50', 'Active Commenter', 'Made 50 comments', '🗨️', 'social', 'medium', 75, 'count', 50, 'silver', 'silver', '{"type": "comment_count", "value": 50}'::jsonb),
  ('comments_200', 'Discussion Leader', 'Made 200 comments', '💭', 'social', 'hard', 200, 'count', 200, 'gold', 'gold', '{"type": "comment_count", "value": 200}'::jsonb),
  
  -- Learning Achievements
  ('with_ai_1', 'AI Assisted', 'First post with AI evaluation', '🤖', 'learning', 'easy', 15, 'count', 1, 'bronze', 'bronze', '{"type": "ai_post_count", "value": 1}'::jsonb),
  ('with_ai_10', 'AI Learner', '10 posts with AI evaluation', '🎓', 'learning', 'medium', 50, 'count', 10, 'silver', 'silver', '{"type": "ai_post_count", "value": 10}'::jsonb),
  ('with_ai_50', 'AI Expert', '50 posts with AI evaluation', '🧠', 'learning', 'hard', 200, 'count', 50, 'gold', 'gold', '{"type": "ai_post_count", "value": 50}'::jsonb),
  
  ('video_posts_5', 'Video Creator', 'Created 5 video posts', '🎥', 'creative', 'easy', 30, 'count', 5, 'bronze', 'bronze', '{"type": "video_post_count", "value": 5}'::jsonb),
  ('video_posts_25', 'Video Producer', 'Created 25 video posts', '🎬', 'creative', 'medium', 100, 'count', 25, 'silver', 'silver', '{"type": "video_post_count", "value": 25}'::jsonb),
  ('image_posts_10', 'Visual Storyteller', 'Created 10 image posts', '📸', 'creative', 'easy', 25, 'count', 10, 'bronze', 'bronze', '{"type": "image_post_count", "value": 10}'::jsonb),
  
  -- Streak Achievements
  ('streak_3', 'Getting Started', '3 day learning streak', '🔥', 'streak', 'easy', 15, 'streak', 3, 'bronze', 'bronze', '{"type": "streak_days", "value": 3}'::jsonb),
  ('streak_7', 'Week Warrior', '7 day learning streak', '🌟', 'streak', 'medium', 50, 'streak', 7, 'silver', 'silver', '{"type": "streak_days", "value": 7}'::jsonb),
  ('streak_30', 'Month Master', '30 day learning streak', '💪', 'streak', 'hard', 200, 'streak', 30, 'gold', 'gold', '{"type": "streak_days", "value": 30}'::jsonb),
  ('streak_100', 'Century Achiever', '100 day learning streak', '👑', 'streak', 'legendary', 500, 'streak', 100, 'platinum', 'platinum', '{"type": "streak_days", "value": 100}'::jsonb),
  ('streak_365', 'Year Champion', '365 day learning streak', '💎', 'streak', 'legendary', 2000, 'streak', 365, 'platinum', 'platinum', '{"type": "streak_days", "value": 365}'::jsonb),
  
  -- Milestone Achievements
  ('level_5', 'Level Up', 'Reached level 5', '⭐', 'milestone', 'medium', 50, 'threshold', 5, 'silver', 'silver', '{"type": "level", "value": 5}'::jsonb),
  ('level_10', 'Rising Star', 'Reached level 10', '🌟', 'milestone', 'hard', 150, 'threshold', 10, 'gold', 'gold', '{"type": "level", "value": 10}'::jsonb),
  ('level_25', 'Expert Learner', 'Reached level 25', '🏆', 'milestone', 'legendary', 500, 'threshold', 25, 'platinum', 'platinum', '{"type": "level", "value": 25}'::jsonb),
  
  ('xp_1000', 'Thousand Club', 'Earned 1000 XP', '🎯', 'milestone', 'medium', 100, 'threshold', 1000, 'silver', 'silver', '{"type": "experience_points", "value": 1000}'::jsonb),
  ('xp_5000', 'Five Thousand Hero', 'Earned 5000 XP', '🚀', 'milestone', 'hard', 300, 'threshold', 5000, 'gold', 'gold', '{"type": "experience_points", "value": 5000}'::jsonb),
  ('xp_10000', 'Ten Thousand Legend', 'Earned 10000 XP', '👑', 'milestone', 'legendary', 750, 'threshold', 10000, 'platinum', 'platinum', '{"type": "experience_points", "value": 10000}'::jsonb),
  
  -- Helpful Achievements
  ('helpful_comments_10', 'Helpful Helper', 'Made 10 helpful comments', '🤝', 'helpful', 'medium', 40, 'count', 10, 'silver', 'silver', '{"type": "helpful_comment_count", "value": 10}'::jsonb),
  ('community_support', 'Community Supporter', 'Actively supports other learners', '💛', 'helpful', 'hard', 150, 'special', 0, 'gold', 'gold', '{"type": "special", "condition": "community_support"}'::jsonb),
  
  -- Special Achievements
  ('early_adopter', 'Early Adopter', 'One of the first users', '🌱', 'special', 'legendary', 500, 'special', 0, 'platinum', 'platinum', '{"type": "special", "condition": "early_adopter"}'::jsonb),
  ('beta_tester', 'Beta Tester', 'Helped test new features', '🧪', 'special', 'hard', 200, 'special', 0, 'gold', 'gold', '{"type": "special", "condition": "beta_tester"}'::jsonb),
  ('bug_reporter', 'Bug Hunter', 'Reported helpful bugs', '🐛', 'special', 'medium', 75, 'special', 0, 'silver', 'silver', '{"type": "special", "condition": "bug_reporter"}'::jsonb),
  
  -- Creative Achievements
  ('multimedia_master', 'Multimedia Master', 'Posted text, image, and video content', '🎨', 'creative', 'hard', 150, 'special', 0, 'gold', 'gold', '{"type": "special", "condition": "multimedia_master"}'::jsonb),
  ('storyteller', 'Master Storyteller', 'Created engaging narrative content', '📚', 'creative', 'hard', 100, 'special', 0, 'gold', 'gold', '{"type": "special", "condition": "storyteller"}'::jsonb),
  
  -- Time-based Achievements
  ('night_owl', 'Night Owl', 'Posted during late night hours', '🦉', 'special', 'medium', 30, 'special', 0, 'silver', 'silver', '{"type": "special", "condition": "night_owl"}'::jsonb),
  ('early_bird', 'Early Bird', 'Posted during early morning hours', '🐦', 'special', 'medium', 30, 'special', 0, 'silver', 'silver', '{"type": "special", "condition": "early_bird"}'::jsonb),
  ('weekend_warrior', 'Weekend Warrior', 'Active during weekends', '🎮', 'special', 'medium', 40, 'special', 0, 'silver', 'silver', '{"type": "special", "condition": "weekend_warrior"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(user_id_param UUID)
RETURNS TABLE(newly_earned achievements) AS $$
DECLARE
  user_stats RECORD;
  achievement RECORD;
  user_achievement RECORD;
  current_progress INTEGER;
  should_award BOOLEAN;
BEGIN
  -- Get user statistics
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

  -- If no profile found, return empty
  IF user_stats IS NULL THEN
    RETURN;
  END IF;

  -- Check each achievement
  FOR achievement IN SELECT * FROM achievements WHERE is_active = true AND key IS NOT NULL
  LOOP
    -- Get current user achievement record
    SELECT * INTO user_achievement 
    FROM user_achievements ua 
    WHERE ua.user_id = user_id_param AND ua.achievement_id = achievement.id;

    -- Skip if already completed
    IF user_achievement.is_completed THEN
      CONTINUE;
    END IF;

    should_award := false;
    current_progress := 0;

    -- Check different requirement types
    CASE achievement.requirement_type
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
        END CASE;
        should_award := current_progress >= achievement.requirement_value;

      WHEN 'streak' THEN
        current_progress := user_stats.streak_days;
        should_award := current_progress >= achievement.requirement_value;

      WHEN 'threshold' THEN
        CASE achievement.key
          WHEN 'level_5', 'level_10', 'level_25' THEN
            current_progress := user_stats.level;
          WHEN 'xp_1000', 'xp_5000', 'xp_10000' THEN
            current_progress := user_stats.experience_points;
        END CASE;
        should_award := current_progress >= achievement.requirement_value;

      WHEN 'special' THEN
        -- Special achievements need custom logic
        CASE achievement.key
          WHEN 'early_adopter' THEN
            should_award := user_stats.joined_at < '2025-08-15'::timestamp; -- First 2 weeks
          WHEN 'multimedia_master' THEN
            SELECT 
              COUNT(DISTINCT post_type) >= 3
            INTO should_award
            FROM posts 
            WHERE user_id = user_id_param 
            AND post_type IN ('text', 'image', 'video');
          -- Add more special achievement logic as needed
        END CASE;
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

-- Create function to get user achievements with progress
CREATE OR REPLACE FUNCTION get_user_achievements(user_id_param UUID)
RETURNS TABLE(
  achievement_key VARCHAR,
  title TEXT,
  description TEXT,
  icon VARCHAR,
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
    a.icon_url,
    a.category,
    a.difficulty,
    a.points,
    a.badge_color,
    COALESCE(ua.is_completed, false) as is_completed,
    COALESCE(ua.progress, 0) as progress,
    a.requirement_value,
    ua.earned_at,
    ac.display_name as category_display_name,
    ac.color as category_color
  FROM achievements a
  LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = user_id_param
  LEFT JOIN achievement_categories ac ON ac.name = a.category
  WHERE a.is_active = true AND a.key IS NOT NULL
  ORDER BY ac.sort_order, a.difficulty, a.points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically check achievements
CREATE OR REPLACE FUNCTION trigger_check_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Check achievements for the user
  PERFORM check_and_award_achievements(
    CASE 
      WHEN TG_TABLE_NAME = 'posts' THEN NEW.user_id
      WHEN TG_TABLE_NAME = 'likes' THEN (SELECT user_id FROM posts WHERE id = NEW.post_id)
      WHEN TG_TABLE_NAME = 'comments' THEN (SELECT user_id FROM posts WHERE id = NEW.post_id)
      WHEN TG_TABLE_NAME = 'profiles' THEN NEW.user_id
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_achievements_on_post ON posts;
CREATE TRIGGER trigger_achievements_on_post
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION trigger_check_achievements();

DROP TRIGGER IF EXISTS trigger_achievements_on_like ON likes;
CREATE TRIGGER trigger_achievements_on_like
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION trigger_check_achievements();

DROP TRIGGER IF EXISTS trigger_achievements_on_comment ON comments;
CREATE TRIGGER trigger_achievements_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION trigger_check_achievements();

DROP TRIGGER IF EXISTS trigger_achievements_on_profile ON profiles;
CREATE TRIGGER trigger_achievements_on_profile
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_check_achievements();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_achievements TO authenticated;
GRANT SELECT ON achievement_categories TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_award_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_achievements(UUID) TO authenticated;
