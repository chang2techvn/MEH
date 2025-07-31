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
  const isExistingEntry = !entry.id.startsWith('new-');
  
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
    <div className={`p-1.5 sm:p-3 rounded-md sm:rounded-xl border transition-all duration-200 min-h-[50px] sm:min-h-[80px] ${
      darkMode ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'
    } ${isExistingEntry ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-orange-500'}`}>
      <div className="flex items-start justify-between gap-1.5 sm:gap-3 h-full">
        {/* Index with indicator - Ultra compact */}
        <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5 sm:mt-1 ${
          isExistingEntry 
            ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600')
            : (darkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600')
        }`}>
          {entry.index}
        </div>
        
        {/* Word and Meaning - Desktop-like mobile layout */}
        <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-2">
          {/* Mobile: Word and Meaning in single row like desktop table */}
          <div className="flex sm:hidden gap-2">
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium uppercase tracking-wide mb-0.5 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                WORD
              </div>
              <div className={`font-semibold text-xs leading-tight break-words ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {entry.word}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium uppercase tracking-wide mb-0.5 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                MEANING
              </div>
              <div className={`text-xs leading-tight break-words ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {entry.meaning}
              </div>
            </div>
          </div>
          
          {/* Desktop: Word and Meaning in columns */}
          <div className="hidden sm:flex gap-4">
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                WORD
              </div>
              <div className={`font-semibold text-sm leading-tight break-words ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {entry.word}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                MEANING
              </div>
              <div className={`text-sm leading-tight break-words ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {entry.meaning}
              </div>
            </div>
          </div>
          
          {/* Mobile timestamp - moved under content */}
          <div className="sm:hidden">
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatTime(entry.timestamp)}
            </div>
          </div>
        </div>
        
        {/* Actions and Status - Ultra compact */}
        <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
          {/* Desktop timestamp */}
          <div className="text-right hidden sm:block">
            <div className={`text-xs leading-tight ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {formatTime(entry.timestamp)}
            </div>
            <div className={`text-xs leading-tight ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {formatDate(entry.timestamp)}
            </div>
          </div>
          
          {/* Status indicator and remove button - Ultra compact */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-0.5 sm:gap-1.5">
            {isExistingEntry ? (
              <div className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                Saved
              </div>
            ) : (
              <>
                <div className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                  darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600'
                }`}>
                  New
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(entry.id)}
                  className={`h-5 w-5 sm:h-7 sm:w-7 rounded-full transition-all duration-200 ${
                    darkMode ? 'hover:bg-red-600/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'
                  }`}
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
