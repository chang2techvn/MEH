import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';

export interface LearningGoal {
  id: string;
  title: string;
  description?: string;
  category: 'vocabulary';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface VocabularyEntry {
  id: string;
  term: string;
  meaning: string;
  pronunciation?: string;
  definition?: string;
  example_sentence?: string;
  example_translation?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  usage_count: number;
  mastery_level: number;
  source?: string;
  last_reviewed: string;
  created_at: string;
}

export interface StudyStreak {
  id: string;
  category: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export const useLearningGoals = () => {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching learning goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<LearningGoal, 'id' | 'current' | 'completed' | 'created_at' | 'updated_at' | 'completed_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('learning_goals')
        .insert([
          {
            ...goalData,
            user_id: user.id,
            current: 0,
            completed: false
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      return null;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<LearningGoal>) => {
    try {
      const { data, error } = await supabase
        .from('learning_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => prev.map(goal => goal.id === goalId ? data : goal));
      return data;
    } catch (err) {
      console.error('Error updating goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      return null;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('learning_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      return true;
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
      return false;
    }
  };

  const updateGoalProgress = async (goalId: string, progressData: {
    activity_type: string;
    progress_value: number;
    activity_data: any;
    session_duration?: number;
    accuracy_score?: number;
  }) => {
    if (!user?.id) return null;

    try {
      // Insert progress record
      const { data: progressRecord, error: progressError } = await supabase
        .from('learning_progress')
        .insert([
          {
            user_id: user.id,
            goal_id: goalId,
            ...progressData
          }
        ])
        .select()
        .single();

      if (progressError) throw progressError;

      // The database trigger will automatically update the goal's current progress
      await fetchGoals(); // Refresh goals to get updated progress

      // Check if any goal is now completed and update status
      const updatedGoals = await checkAndUpdateGoalCompletion();

      return progressRecord;
    } catch (err) {
      console.error('Error updating goal progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      return null;
    }
  };

  const checkAndUpdateGoalCompletion = async () => {
    if (!user?.id) return;

    try {
      // Get goals that should be marked as completed but aren't
      const goalsToUpdate = goals.filter(goal => 
        goal.current >= goal.target && !goal.completed
      );

      for (const goal of goalsToUpdate) {
        await updateGoal(goal.id, {
          completed: true,
          completed_at: new Date().toISOString()
        });
      }

      return true;
    } catch (err) {
      console.error('Error checking goal completion:', err);
      return false;
    }
  };

  const toggleGoalCompletion = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updates: Partial<LearningGoal> = {
      completed: !goal.completed,
      current: goal.completed ? 0 : goal.target,
      completed_at: goal.completed ? undefined : new Date().toISOString()
    };

    return await updateGoal(goalId, updates);
  };

  useEffect(() => {
    fetchGoals();
  }, [user?.id]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalCompletion,
    updateGoalProgress,
    refetch: fetchGoals
  };
};

export const useVocabulary = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [recentVocabulary, setRecentVocabulary] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchVocabulary = async (limit?: number) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('vocabulary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (limit) {
        setRecentVocabulary(data || []);
      } else {
        setVocabulary(data || []);
      }
    } catch (err) {
      console.error('Error fetching vocabulary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentVocabulary = () => fetchVocabulary(5);

  useEffect(() => {
    fetchRecentVocabulary();
  }, [user?.id]);

  return {
    vocabulary,
    recentVocabulary,
    loading,
    error,
    fetchVocabulary,
    fetchRecentVocabulary,
    refetch: fetchRecentVocabulary
  };
};

export const useStudyStreaks = () => {
  const [streaks, setStreaks] = useState<StudyStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStreaks = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user.id)
        .order('category');

      if (error) throw error;
      setStreaks(data || []);
    } catch (err) {
      console.error('Error fetching study streaks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch streaks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreaks();
  }, [user?.id]);

  return {
    streaks,
    loading,
    error,
    refetch: fetchStreaks
  };
};
