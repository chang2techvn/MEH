-- Learning Goals System for Vietnamese English Learning Platform
-- This migration creates tables for managing user learning goals and vocabulary tracking

-- Create learning_goals table
CREATE TABLE IF NOT EXISTS public.learning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('vocabulary', 'grammar', 'speaking', 'listening', 'reading', 'writing')),
    target INTEGER NOT NULL DEFAULT 1,
    current INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'items',
    deadline DATE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create vocabulary_entries table for tracking learned words
CREATE TABLE IF NOT EXISTS public.vocabulary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    meaning TEXT NOT NULL,
    pronunciation TEXT,
    definition TEXT,
    example_sentence TEXT,
    example_translation TEXT,
    difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    category TEXT DEFAULT 'general',
    usage_count INTEGER NOT NULL DEFAULT 1,
    last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mastery_level INTEGER DEFAULT 1 CHECK (mastery_level >= 1 AND mastery_level <= 5),
    source TEXT, -- Where the word was learned (conversation, video, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique vocabulary per user
    UNIQUE(user_id, term)
);

-- Create learning_progress table for detailed tracking
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.learning_goals(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('vocabulary_learned', 'grammar_practice', 'speaking_session', 'listening_exercise', 'reading_comprehension', 'writing_practice')),
    activity_data JSONB DEFAULT '{}'::jsonb,
    progress_value INTEGER NOT NULL DEFAULT 1,
    session_duration INTEGER, -- in minutes
    accuracy_score DECIMAL(5,2), -- percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Create study_streaks table for motivation
CREATE TABLE IF NOT EXISTS public.study_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('vocabulary', 'grammar', 'speaking', 'listening', 'reading', 'writing', 'overall')),
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique streak per user per category
    UNIQUE(user_id, category)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id ON public.learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_category ON public.learning_goals(category);
CREATE INDEX IF NOT EXISTS idx_learning_goals_deadline ON public.learning_goals(deadline);
CREATE INDEX IF NOT EXISTS idx_vocabulary_entries_user_id ON public.vocabulary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_entries_category ON public.vocabulary_entries(category);
CREATE INDEX IF NOT EXISTS idx_vocabulary_entries_mastery ON public.vocabulary_entries(mastery_level);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_date ON public.learning_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_learning_progress_goal ON public.learning_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_id ON public.study_streaks(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

-- Learning Goals policies
CREATE POLICY "Users can view their own learning goals" ON public.learning_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning goals" ON public.learning_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning goals" ON public.learning_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning goals" ON public.learning_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Vocabulary Entries policies
CREATE POLICY "Users can view their own vocabulary" ON public.vocabulary_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary" ON public.vocabulary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary" ON public.vocabulary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary" ON public.vocabulary_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Learning Progress policies
CREATE POLICY "Users can view their own progress" ON public.learning_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Study Streaks policies
CREATE POLICY "Users can view their own streaks" ON public.study_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.study_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.study_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_learning_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the goal's current progress when learning_progress is added
    IF NEW.goal_id IS NOT NULL THEN
        UPDATE public.learning_goals 
        SET current = current + NEW.progress_value,
            updated_at = NOW()
        WHERE id = NEW.goal_id;
        
        -- Check if goal is completed
        UPDATE public.learning_goals 
        SET completed = true,
            completed_at = NOW()
        WHERE id = NEW.goal_id 
        AND current >= target 
        AND completed = false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic goal progress updates
CREATE TRIGGER trigger_update_goal_progress
    AFTER INSERT ON public.learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_goal_progress();

-- Create function to update study streaks
CREATE OR REPLACE FUNCTION update_study_streak(
    p_user_id UUID,
    p_category TEXT
)
RETURNS VOID AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    last_date DATE;
    streak_record RECORD;
BEGIN
    -- Get or create streak record
    SELECT * INTO streak_record 
    FROM public.study_streaks 
    WHERE user_id = p_user_id AND category = p_category;
    
    IF NOT FOUND THEN
        -- Create new streak record
        INSERT INTO public.study_streaks (user_id, category, current_streak, longest_streak, last_activity_date)
        VALUES (p_user_id, p_category, 1, 1, current_date);
    ELSE
        last_date := streak_record.last_activity_date;
        
        IF last_date = current_date THEN
            -- Already studied today, no change needed
            RETURN;
        ELSIF last_date = current_date - INTERVAL '1 day' THEN
            -- Consecutive day, increment streak
            UPDATE public.study_streaks 
            SET current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                last_activity_date = current_date,
                updated_at = NOW()
            WHERE user_id = p_user_id AND category = p_category;
        ELSE
            -- Streak broken, reset to 1
            UPDATE public.study_streaks 
            SET current_streak = 1,
                last_activity_date = current_date,
                updated_at = NOW()
            WHERE user_id = p_user_id AND category = p_category;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically update vocabulary usage count
CREATE OR REPLACE FUNCTION increment_vocabulary_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count and last reviewed timestamp
    NEW.usage_count := OLD.usage_count + 1;
    NEW.last_reviewed := NOW();
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON public.learning_goals TO authenticated;
GRANT ALL ON public.vocabulary_entries TO authenticated;
GRANT ALL ON public.learning_progress TO authenticated;
GRANT ALL ON public.study_streaks TO authenticated;

GRANT SELECT ON public.learning_goals TO anon;
GRANT SELECT ON public.vocabulary_entries TO anon;
GRANT SELECT ON public.learning_progress TO anon;
GRANT SELECT ON public.study_streaks TO anon;

-- Add updated_at trigger for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_goals_updated_at
    BEFORE UPDATE ON public.learning_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_entries_updated_at
    BEFORE UPDATE ON public.vocabulary_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_streaks_updated_at
    BEFORE UPDATE ON public.study_streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.learning_goals IS 'User learning goals for English learning platform';
COMMENT ON TABLE public.vocabulary_entries IS 'User vocabulary database with tracking and mastery levels';
COMMENT ON TABLE public.learning_progress IS 'Detailed tracking of learning activities and progress';
COMMENT ON TABLE public.study_streaks IS 'User study streaks for motivation and gamification';

COMMENT ON COLUMN public.learning_goals.category IS 'Type of learning goal: vocabulary, grammar, speaking, listening, reading, writing';
COMMENT ON COLUMN public.vocabulary_entries.mastery_level IS 'User mastery level from 1 (beginner) to 5 (master)';
COMMENT ON COLUMN public.learning_progress.activity_data IS 'JSON data containing specific activity details';
COMMENT ON COLUMN public.study_streaks.current_streak IS 'Current consecutive days of study';
