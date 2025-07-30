import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LearningGoal, useLearningGoals } from '@/hooks/use-learning-goals';
import { VocabularyInputForm } from './VocabularyInputForm';
import { VocabularyList, VocabularyListRef } from './VocabularyList';

interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  timestamp: Date;
  index: number;
}

interface GoalProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  goal: LearningGoal | null;
  onProgress: (goalId: string, progressData: any) => Promise<void>;
}

export const GoalProgressModal: React.FC<GoalProgressModalProps> = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  goal,
  onProgress 
}) => {
  const [loading, setLoading] = useState(false);
  const [vocabularyEntries, setVocabularyEntries] = useState<VocabularyItem[]>([]);
  const [existingVocabulary, setExistingVocabulary] = useState<VocabularyItem[]>([]);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [latestEntryId, setLatestEntryId] = useState<string | undefined>();
  const [vocabularyCache, setVocabularyCache] = useState<{ [goalId: string]: VocabularyItem[] }>({});
  const { fetchGoalProgress } = useLearningGoals();
  const vocabularyListRef = useRef<VocabularyListRef>(null);

  // Optimized fetch existing vocabulary with caching
  useEffect(() => {
    const loadExistingVocabulary = async () => {
      if (!isOpen || !goal) return;

      // Check cache first
      if (vocabularyCache[goal.id]) {
        setExistingVocabulary(vocabularyCache[goal.id]);
        return;
      }

      setFetchingExisting(true);
      try {
        const existingEntries = await fetchGoalProgress(goal.id);
        setExistingVocabulary(existingEntries);
        // Cache the result
        setVocabularyCache(prev => ({
          ...prev,
          [goal.id]: existingEntries
        }));
      } catch (error) {
        console.error('Error loading existing vocabulary:', error);
        // Set empty array on error to prevent infinite loading
        setExistingVocabulary([]);
      } finally {
        setFetchingExisting(false);
      }
    };

    // Only load if modal is open and we don't have cached data
    if (isOpen && goal && !vocabularyCache[goal.id]) {
      loadExistingVocabulary();
    } else if (isOpen && goal && vocabularyCache[goal.id]) {
      // Use cached data immediately
      setExistingVocabulary(vocabularyCache[goal.id]);
    }
  }, [isOpen, goal?.id, fetchGoalProgress]);

  // Reset entries when modal opens/closes - optimized
  useEffect(() => {
    if (!isOpen) {
      setVocabularyEntries([]);
      setSaveSuccess(false);
      setLatestEntryId(undefined);
      // Don't clear existingVocabulary to keep cache
    }
  }, [isOpen]);

  if (!isOpen || !goal) return null;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      vocabulary: 'fa-book',
      grammar: 'fa-language',
      speaking: 'fa-microphone',
      listening: 'fa-headphones',
      reading: 'fa-book-open',
      writing: 'fa-pen'
    };
    return icons[category] || 'fa-book';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      vocabulary: 'from-orange-500 to-orange-600',
      grammar: 'from-blue-500 to-indigo-500',
      speaking: 'from-orange-500 to-red-500',
      listening: 'from-purple-500 to-pink-500',
      reading: 'from-indigo-500 to-purple-500',
      writing: 'from-pink-500 to-rose-500'
    };
    return colors[category] || 'from-orange-500 to-orange-600';
  };

  // Add new vocabulary entry
  const handleAddVocabulary = (word: string, meaning: string) => {
    const newEntryId = `new-${Date.now()}`;
    const newEntry: VocabularyItem = {
      id: newEntryId,
      word: word.trim(),
      meaning: meaning.trim(),
      timestamp: new Date(),
      index: totalVocabularyCount + 1
    };

    setVocabularyEntries([...vocabularyEntries, newEntry]);
    setLatestEntryId(newEntryId);
    
    // Auto-scroll to the newly added vocabulary after a short delay
    setTimeout(() => {
      vocabularyListRef.current?.scrollToEntry(newEntryId);
    }, 100);
  };

  // Remove vocabulary entry (only allow removing new entries, not existing ones)
  const handleRemoveVocabulary = (id: string) => {
    // Only remove if it's a new entry (starts with 'new-')
    if (id.startsWith('new-')) {
      const updatedEntries = vocabularyEntries
        .filter(entry => entry.id !== id)
        .map((entry, index) => ({ 
          ...entry, 
          index: existingVocabulary.length + index + 1 
        }));
      setVocabularyEntries(updatedEntries);
      
      // Reset latest entry ID if the removed entry was the latest
      if (latestEntryId === id) {
        setLatestEntryId(undefined);
      }
    }
  };

  // Clear all new entries (keep existing ones)
  const handleClearAll = () => {
    setVocabularyEntries([]);
    setLatestEntryId(undefined);
  };

  // Get existing words for duplicate check (both existing and new entries)
  const existingWords = [
    ...existingVocabulary.map(entry => entry.word.toLowerCase()),
    ...vocabularyEntries.map(entry => entry.word.toLowerCase())
  ];

  // Get total vocabulary count (existing + new)
  const totalVocabularyCount = existingVocabulary.length + vocabularyEntries.length;

  // Combine existing and new vocabulary for display
  const allVocabulary = [...existingVocabulary, ...vocabularyEntries];

  // Submit progress
  const handleSubmit = async () => {
    if (vocabularyEntries.length === 0) return;

    setLoading(true);
    try {
      // Map category to valid activity_type values
      const getActivityType = (category: string) => {
        switch (category) {
          case 'vocabulary':
            return 'vocabulary_learned';
          case 'grammar':
            return 'grammar_practice';
          case 'speaking':
            return 'speaking_session';
          case 'listening':
            return 'listening_exercise';
          case 'reading':
            return 'reading_comprehension';
          case 'writing':
            return 'writing_practice';
          default:
            return 'vocabulary_learned'; // fallback
        }
      };

      const progressData = {
        activity_type: getActivityType(goal.category),
        progress_value: vocabularyEntries.length,
        activity_data: {
          entries: vocabularyEntries.map(entry => ({
            word: entry.word,
            meaning: entry.meaning,
            timestamp: entry.timestamp.toISOString(),
            index: entry.index
          }))
        }
      };

      // Save to database
      await onProgress(goal.id, progressData);
      
      // Show success feedback
      setSaveSuccess(true);
      
      // Move new entries to existing vocabulary list
      const newExistingEntries = vocabularyEntries.map(entry => ({
        ...entry,
        // Update ID to match database format (will be overwritten by actual data from DB)
        id: `temp-${entry.id}` // Temporary ID until we refresh from DB
      }));
      
      // Update existing vocabulary state immediately for UI feedback
      setExistingVocabulary(prev => [...prev, ...newExistingEntries]);
      
      // Clear new entries form
      setVocabularyEntries([]);
      
      // Focus back to input for continuous adding
      setTimeout(() => {
        const wordInput = document.querySelector('input[placeholder*="vocabulary"]') as HTMLInputElement;
        if (wordInput) {
          wordInput.focus();
        }
      }, 600);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
      // Refresh existing vocabulary from database to get accurate data
      setTimeout(async () => {
        try {
          const refreshedEntries = await fetchGoalProgress(goal.id);
          setExistingVocabulary(refreshedEntries);
        } catch (error) {
          console.error('Error refreshing vocabulary:', error);
        }
      }, 500);
      
      // Show success message (optional)
      // You can add a toast notification here if you have one
      
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('An error occurred while updating progress!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl h-[90vh] transform transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-neo-mint/5 to-purist-blue/5'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neo-mint to-purist-blue flex items-center justify-center shadow-lg">
                <i className={`fas ${getCategoryIcon(goal.category)} text-white text-lg`}></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent">
                  Goal Progress
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {goal.title}
                  {fetchingExisting && (
                    <span className="ml-2 inline-flex items-center">
                      <i className="fas fa-sync-alt fa-spin text-xs"></i>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`h-9 w-9 rounded-xl transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-neo-mint/10 text-gray-500 hover:text-neo-mint'
              }`}
            >
              <i className="fas fa-times text-lg"></i>
            </Button>
          </div>
          
          {/* Success Message */}
          {saveSuccess && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-600 rounded-lg flex items-center animate-in fade-in duration-300">
              <i className="fas fa-check-circle text-green-600 dark:text-green-400 mr-2"></i>
              <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                Progress saved successfully! Your vocabulary has been added to the goal.
              </span>
            </div>
          )}
        </div>

        {/* Goal Info */}
        <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-orange-100 text-orange-800 px-2 py-1 text-xs pointer-events-none hover:bg-none transition-none"
              >
                {goal.current + vocabularyEntries.length}/{goal.target} {goal.unit}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs px-2 py-1 ${
                  goal.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : goal.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                } pointer-events-none hover:bg-none transition-none`}
              >
                {goal.priority === 'high' ? 'High Priority' : goal.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
              </Badge>
            </div>
            {goal.deadline && (
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Due: {new Date(goal.deadline).toLocaleDateString('en-US')}
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className={`w-full h-1.5 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden mb-2`}>
            <div 
              className="h-full bg-gradient-to-r from-neo-mint to-purist-blue transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(((goal.current + vocabularyEntries.length) / goal.target) * 100, 100)}%` }}
            />
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
            Current progress: {Math.round(((goal.current + vocabularyEntries.length) / goal.target) * 100)}%
          </p>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left Column - Input Form */}
          <div className={`w-1/2 p-5 border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Add New Vocabulary</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                Add vocabulary words to update your learning progress
              </p>
            </div>
            <VocabularyInputForm
              darkMode={darkMode}
              onAdd={handleAddVocabulary}
              existingWords={existingWords}
            />
          </div>

          {/* Right Column - Vocabulary List */}
          <div className="w-1/2 p-5 flex flex-col min-h-0">
            {fetchingExisting ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-neo-mint to-purist-blue flex items-center justify-center shadow-lg mb-4">
                  <i className="fas fa-sync-alt fa-spin text-white text-xl"></i>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  Loading existing vocabulary...
                </span>
                <div className={`w-32 h-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-neo-mint to-purist-blue rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : (
              <VocabularyList
                ref={vocabularyListRef}
                entries={allVocabulary}
                darkMode={darkMode}
                onRemove={handleRemoveVocabulary}
                onClearAll={handleClearAll}
                existingCount={existingVocabulary.length}
                latestEntryId={latestEntryId}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-5 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <i className="fas fa-info-circle text-neo-mint"></i>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {vocabularyEntries.length > 0 
                ? `Will add ${vocabularyEntries.length} new words to your progress` 
                : existingVocabulary.length > 0 
                  ? `${existingVocabulary.length} words already saved for this goal`
                  : 'Add vocabulary to update progress'
              }
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={`${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50 border-gray-200 hover:border-neo-mint/20'}`}
            >
              <i className="fas fa-times mr-2"></i>
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || vocabularyEntries.length === 0}
              className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Update Progress ({vocabularyEntries.length})                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
