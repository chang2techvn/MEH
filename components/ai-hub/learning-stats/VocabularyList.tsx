import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VocabularyEntry } from './VocabularyEntry';

interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  timestamp: Date;
  index: number;
}

interface VocabularyListProps {
  entries: VocabularyItem[];
  darkMode: boolean;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const VocabularyList: React.FC<VocabularyListProps> = ({ 
  entries, 
  darkMode, 
  onRemove,
  onClearAll
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Filter entries based on search
  const filteredEntries = entries.filter(entry =>
    entry.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.timestamp.getTime() - a.timestamp.getTime();
      case 'oldest':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'alphabetical':
        return a.word.localeCompare(b.word);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header with search and controls - Fixed height */}
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <i className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}></i>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vocabulary or meaning..."
                className={`pl-10 rounded-xl ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}>
              {filteredEntries.length}/{entries.length}
            </div>
            
            {entries.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className={`text-red-500 hover:text-red-600 ${
                  darkMode ? 'hover:bg-red-600/20' : 'hover:bg-red-50'
                } flex-shrink-0 rounded-xl`}
              >
                <i className="fas fa-trash-alt mr-1"></i>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Sort options - Fixed height */}
        <div className="h-10 flex items-center">
          {entries.length > 1 && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sort by:
              </span>
              <div className="flex gap-1">
                {[
                  { key: 'newest', label: 'Newest', icon: 'fa-clock' },
                  { key: 'oldest', label: 'Oldest', icon: 'fa-history' },
                  { key: 'alphabetical', label: 'A-Z', icon: 'fa-sort-alpha-down' }
                ].map(({ key, label, icon }) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortBy(key as any)}
                    className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                      sortBy === key
                        ? `${darkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600'}`
                        : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <i className={`fas ${icon} mr-1`}></i>
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List header - Fixed */}
      <div className={`text-sm font-medium flex-shrink-0 ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Added List ({filteredEntries.length} items)
      </div>

      {/* Vocabulary list - Flexible height with scroll */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4">
          {sortedEntries.length === 0 ? (
            <div className={`text-center py-12 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {entries.length === 0 ? (
                <>
                  <i className="fas fa-book text-3xl mb-3 opacity-50"></i>
                  <p className="text-lg font-medium">No vocabulary added yet</p>
                  <p className="text-sm mt-1">Add your first vocabulary word!</p>
                </>
              ) : (
                <>
                  <i className="fas fa-search text-3xl mb-3 opacity-50"></i>
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-sm mt-1">Try searching with different keywords</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {sortedEntries.map((entry) => (
                <VocabularyEntry
                  key={entry.id}
                  entry={entry}
                  darkMode={darkMode}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
