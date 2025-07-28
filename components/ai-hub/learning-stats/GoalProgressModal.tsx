import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LearningGoal } from '@/hooks/use-learning-goals';
import { VocabularyInputForm } from './VocabularyInputForm';
import { VocabularyList } from './VocabularyList';

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

  // Reset entries when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setVocabularyEntries([]);
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
    const newEntry: VocabularyItem = {
      id: Date.now().toString(),
      word: word.trim(),
      meaning: meaning.trim(),
      timestamp: new Date(),
      index: vocabularyEntries.length + 1
    };

    setVocabularyEntries([...vocabularyEntries, newEntry]);
  };

  // Remove vocabulary entry
  const handleRemoveVocabulary = (id: string) => {
    const updatedEntries = vocabularyEntries
      .filter(entry => entry.id !== id)
      .map((entry, index) => ({ ...entry, index: index + 1 }));
    setVocabularyEntries(updatedEntries);
  };

  // Clear all entries
  const handleClearAll = () => {
    setVocabularyEntries([]);
  };

  // Get existing words for duplicate check
  const existingWords = vocabularyEntries.map(entry => entry.word);

  // Submit progress
  const handleSubmit = async () => {
    if (vocabularyEntries.length === 0) return;

    setLoading(true);
    try {
      const progressData = {
        activity_type: `${goal.category}_practice`,
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

      await onProgress(goal.id, progressData);
      
      // Reset form
      setVocabularyEntries([]);
      onClose();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('An error occurred while updating progress!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl h-[90vh] transform transition-all duration-300 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <i className={`fas ${getCategoryIcon(goal.category)} text-white text-lg`}></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Update Progress</h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                  {goal.title}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`h-9 w-9 rounded-full ${
                darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-orange-100 text-gray-500 hover:text-orange-600'
              } transition-all duration-200`}
            >
              <i className="fas fa-times text-lg"></i>
            </Button>
          </div>
        </div>

        {/* Goal Info */}
        <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-orange-200'} flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 text-orange-800 px-2 py-1 text-xs">
                {goal.current + vocabularyEntries.length}/{goal.target} {goal.unit}
              </Badge>
              <Badge className={`text-xs px-2 py-1 ${goal.priority === 'high' ? 'bg-red-100 text-red-800' : goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
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
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 rounded-full"
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
          <div className={`w-1/2 p-5 border-r ${darkMode ? 'border-gray-700' : 'border-orange-200'} flex flex-col`}>
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
            <VocabularyList
              entries={vocabularyEntries}
              darkMode={darkMode}
              onRemove={handleRemoveVocabulary}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={`p-5 border-t ${darkMode ? 'border-gray-700' : 'border-orange-200'} flex justify-between items-center flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <i className="fas fa-info-circle text-orange-500"></i>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {vocabularyEntries.length > 0 ? `Will add ${vocabularyEntries.length} words to progress` : 'Add vocabulary to update progress'}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={`${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'}`}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || vocabularyEntries.length === 0}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Update Progress ({vocabularyEntries.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
