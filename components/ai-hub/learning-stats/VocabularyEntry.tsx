import React from 'react';
import { Button } from '@/components/ui/button';

interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  timestamp: Date;
  index: number;
}

interface VocabularyEntryProps {
  entry: VocabularyItem;
  darkMode: boolean;
  onRemove: (id: string) => void;
}

export const VocabularyEntry: React.FC<VocabularyEntryProps> = ({ 
  entry, 
  darkMode, 
  onRemove 
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US');
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
      darkMode ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="flex items-center justify-between gap-4">
        {/* Index */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
          darkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600'
        }`}>
          #{entry.index}
        </div>
        
        {/* Word and Meaning - Improved responsive layout */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Vocabulary
              </div>
              <div className={`font-semibold text-sm break-words ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {entry.word}
              </div>
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Meaning
              </div>
              <div className={`text-sm break-words ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {entry.meaning}
              </div>
            </div>
          </div>
        </div>
        
        {/* Timestamp and Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatTime(entry.timestamp)}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {formatDate(entry.timestamp)}
            </div>
          </div>
          
          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(entry.id)}
            className={`h-8 w-8 rounded-full transition-all duration-200 ${
              darkMode ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
            }`}
          >
            <i className="fas fa-trash-alt text-sm"></i>
          </Button>
        </div>
      </div>
      
      {/* Mobile timestamp */}
      <div className="sm:hidden mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatTime(entry.timestamp)} • {formatDate(entry.timestamp)}
        </div>
      </div>
    </div>
  );
};
