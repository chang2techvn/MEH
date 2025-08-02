-- Function to update user experience points and level automatically
CREATE OR REPLACE FUNCTION update_user_experience() 
RETURNS TRIGGER AS $$
DECLARE
  post_score INTEGER;
  experience_gained INTEGER;
  current_experience INTEGER;
  current_level INTEGER;
  new_level INTEGER;
BEGIN
  -- Only process if this is a new post or score was updated
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.score IS DISTINCT FROM NEW.score) THEN
    
    -- Get the score, default to 0 if null
    post_score := COALESCE(NEW.score, 0);
    
    -- Calculate experience gained based on score
    -- Score 70-79: 10 points, 80-89: 20 points, 90-100: 30 points
    IF post_score >= 90 THEN
      experience_gained := 30;
    ELSIF post_score >= 80 THEN
      experience_gained := 20;
    ELSIF post_score >= 70 THEN
      experience_gained := 10;
    ELSE
      experience_gained := 5; -- Participation points
    END IF;
    
    -- Update user profile with new experience points
    UPDATE profiles 
    SET 
      experience_points = COALESCE(experience_points, 0) + experience_gained,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Get updated experience and calculate new level
    SELECT experience_points, level INTO current_experience, current_level
    FROM profiles 
    WHERE user_id = NEW.user_id;
    
    -- Calculate new level (every 100 experience points = 1 level)
    new_level := GREATEST(1, (current_experience / 100) + 1);
    
    -- Update level if it changed
    IF new_level != current_level THEN
      UPDATE profiles 
      SET 
        level = new_level,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for posts table
DROP TRIGGER IF EXISTS trigger_update_user_experience ON posts;
CREATE TRIGGER trigger_update_user_experience
  AFTER INSERT OR UPDATE OF score ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_experience();
