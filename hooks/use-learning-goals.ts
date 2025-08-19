import { useState, useEffect, useCallback } from 'react';
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

  const fetchGoalProgress = useCallback(async (goalId: string) => {
    if (!user?.id) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_id', goalId)
        .eq('activity_type', 'vocabulary_learned')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Extract vocabulary entries from activity_data
      const vocabularyEntries: any[] = [];
      data?.forEach((progress) => {
        if (progress.activity_data?.entries) {
          progress.activity_data.entries.forEach((entry: any, index: number) => {
            const vocabularyEntry = {
              id: `${progress.id}-${index}`,
              word: entry.word,
              meaning: entry.meaning,
              timestamp: new Date(entry.timestamp || progress.created_at),
              index: entry.index || index + 1,
              progressId: progress.id,
              created_at: progress.created_at
            };
            vocabularyEntries.push(vocabularyEntry);
          });
        }
      });

      return vocabularyEntries;
    } catch (err) {
      console.error('Error fetching goal progress:', err);
      return [];
    }
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
    fetchGoalProgress,
    refetch: fetchGoals
  };
};

export const useVocabulary = () => {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [recentVocabulary, setRecentVocabulary] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Cache vocabulary data to avoid refetching
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchVocabulary = async (limit?: number, forceRefresh = false) => {
    if (!user?.id) return;

    // Skip if already have data and not forcing refresh
    if (!forceRefresh && vocabulary.length > 0 && !limit) {
      return;
    }

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
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (err) {
      console.error('Error fetching vocabulary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch vocabulary');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentVocabulary = () => fetchVocabulary(5, true);

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchVocabulary(); // Fetch all vocabulary
    fetchRecentVocabulary(); // Fetch recent

    // Setup real-time subscription
    const subscription = supabase
      .channel('vocabulary_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vocabulary_entries',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as VocabularyEntry;
            
            // Add to vocabulary list
            setVocabulary(prev => {
              // Avoid duplicates
              const exists = prev.some(vocab => vocab.id === newEntry.id);
              if (exists) return prev;
              return [newEntry, ...prev];
            });
            
            // Update recent vocabulary (keep only 5 most recent)
            setRecentVocabulary(prev => {
              const exists = prev.some(vocab => vocab.id === newEntry.id);
              if (exists) return prev;
              const updated = [newEntry, ...prev];
              return updated.slice(0, 5);
            });
            
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            
            // Remove from vocabulary list
            setVocabulary(prev => prev.filter(vocab => vocab.id !== deletedId));
            
            // Remove from recent vocabulary
            setRecentVocabulary(prev => prev.filter(vocab => vocab.id !== deletedId));
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedEntry = payload.new as VocabularyEntry;
            
            // Update in vocabulary list
            setVocabulary(prev => 
              prev.map(vocab => vocab.id === updatedEntry.id ? updatedEntry : vocab)
            );
            
            // Update in recent vocabulary if exists
            setRecentVocabulary(prev => 
              prev.map(vocab => vocab.id === updatedEntry.id ? updatedEntry : vocab)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const createVocabularyEntry = async (vocabularyData: {
    term: string;
    meaning: string;
    pronunciation?: string;
    definition?: string;
    example_sentence?: string;
    example_translation?: string;
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
    source?: string;
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vocabulary_entries')
        .insert([{
          ...vocabularyData,
          user_id: user.id,
          mastery_level: 1, // Default mastery level as integer
          usage_count: 1,   // Default usage count
          difficulty_level: vocabularyData.difficulty_level || 'beginner',
          category: vocabularyData.category || 'general'
        }])
        .select()
        .single();

      if (error) throw error;

      // Immediately update local state for instant UI feedback
      setVocabulary(prev => [data, ...prev]);
      setRecentVocabulary(prev => {
        const updated = [data, ...prev];
        return updated.slice(0, 5); // Keep only 5 most recent
      });
      
      return data;
    } catch (err) {
      console.error('Error creating vocabulary entry:', err);
      throw err instanceof Error ? err : new Error('Failed to create vocabulary entry');
    } finally {
      setLoading(false);
    }
  };

  const deleteVocabularyEntry = async (vocabularyId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('vocabulary_entries')
        .delete()
        .eq('id', vocabularyId)
        .eq('user_id', user.id); // Ensure user can only delete their own vocabulary

      if (error) {
        console.error('Error deleting vocabulary:', error);
        setError(error.message);
        return false;
      }

      // Immediately update local state for instant UI feedback
      setVocabulary(prev => prev.filter(vocab => vocab.id !== vocabularyId));
      setRecentVocabulary(prev => prev.filter(vocab => vocab.id !== vocabularyId));
      
      return true;
    } catch (err) {
      console.error('Error deleting vocabulary:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete vocabulary');
      return false;
    }
  };

  // Manual refresh function for edge cases
  const refreshVocabulary = useCallback(async () => {
    await fetchVocabulary(undefined, true); // Force refresh all vocabulary
    await fetchRecentVocabulary(); // Refresh recent
  }, [user?.id]);

  return {
    vocabulary,
    recentVocabulary,
    loading,
    error,
    isInitialized,
    fetchVocabulary,
    fetchRecentVocabulary,
    createVocabularyEntry,
    deleteVocabularyEntry,
    refreshVocabulary,
    refetch: refreshVocabulary
  };
};
