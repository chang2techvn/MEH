import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
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
  existingCount?: number;
  latestEntryId?: string; // ID of the most recently added entry
}

export interface VocabularyListRef {
  scrollToLatest: () => void;
  scrollToEntry: (entryId: string) => void;
}

export const VocabularyList = forwardRef<VocabularyListRef, VocabularyListProps>(({ 
  entries, 
  darkMode, 
  onRemove,
  onClearAll,
  existingCount = 0,
  latestEntryId
}, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const latestEntryRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Expose scroll functions to parent
  useImperativeHandle(ref, () => ({
    scrollToLatest: () => {
      if (latestEntryRef.current) {
        latestEntryRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    },
    scrollToEntry: (entryId: string) => {
      const entryElement = entryRefs.current[entryId];
      if (entryElement) {
        entryElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }));

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
    <div className="h-full flex flex-col">
      {/* Header with search and controls - Ultra compact */}
      <div className="flex-shrink-0 min-h-[80px] sm:min-h-[120px] pb-2 sm:pb-4">
        <div className="flex flex-col gap-1.5 sm:gap-3 mb-1.5 sm:mb-3">
          <div className="w-full">
            <div className="relative">
              <i className={`fas fa-search absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm pointer-events-none ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}></i>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={`w-full pl-7 sm:pl-10 h-7 sm:h-10 rounded-md sm:rounded-xl text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm transition-none ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
                darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}>
                {filteredEntries.length}/{entries.length}
              </div>
              
              {existingCount > 0 && (
                <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
                  darkMode ? 'bg-blue-900/30 border-blue-600 text-blue-400' : 'bg-blue-100 border-blue-300 text-blue-600'
                }`}>
                  {existingCount} saved
                </div>
              )}
            </div>
            
            {entries.length > existingCount && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className={`text-red-500 hover:text-red-600 whitespace-nowrap ${
                  darkMode ? 'hover:bg-red-600/20' : 'hover:bg-red-50'
                } flex-shrink-0 rounded-md sm:rounded-xl text-xs px-1.5 py-0.5 h-5 sm:h-7`}
              >
                <i className="fas fa-trash-alt mr-0.5 text-xs"></i>
                <span className="hidden sm:inline">Clear New</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* Sort options - Ultra compact */}
        <div className="h-5 sm:h-8 flex items-center justify-start">
          {entries.length > 1 && (
            <div className="flex items-center gap-1 sm:gap-2">
              <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sort:
              </span>
              <div className="flex gap-0.5 flex-wrap">
                {[
                  { key: 'newest', label: 'New', fullLabel: 'Newest', icon: 'fa-clock' },
                  { key: 'oldest', label: 'Old', fullLabel: 'Oldest', icon: 'fa-history' },
                  { key: 'alphabetical', label: 'A-Z', fullLabel: 'A-Z', icon: 'fa-sort-alpha-down' }
                ].map(({ key, label, fullLabel, icon }) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortBy(key as any)}
                    className={`text-xs px-1.5 sm:px-3 py-0.5 h-5 sm:h-7 rounded-full transition-all duration-200 whitespace-nowrap ${
                      sortBy === key
                        ? `${darkMode ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-600'}`
                        : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                    }`}
                  >
                    <i className={`fas ${icon} mr-0.5`}></i>
                    <span className="hidden sm:inline">{fullLabel}</span>
                    <span className="sm:hidden">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          {/* Empty space to maintain height when no sort options */}
          {entries.length <= 1 && <div className="h-5 sm:h-7"></div>}
        </div>
      </div>

      {/* List header - Ultra compact */}
      <div className={`text-xs sm:text-sm font-medium flex-shrink-0 pb-1 flex items-center justify-between ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <span>List ({filteredEntries.length})</span>
      </div>

      {/* Vocabulary list - Ultra compact with responsive scroll */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-1 sm:pr-4">
          {sortedEntries.length === 0 ? (
            <div className={`text-center py-4 sm:py-12 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {entries.length === 0 ? (
                <>
                  <i className="fas fa-book text-lg sm:text-3xl mb-1 sm:mb-3 opacity-50"></i>
                  <p className="text-xs sm:text-lg font-medium">No vocabulary added</p>
                  <p className="text-xs sm:text-sm mt-0.5">Add your first word!</p>
                </>
              ) : (
                <>
                  <i className="fas fa-search text-lg sm:text-3xl mb-1 sm:mb-3 opacity-50"></i>
                  <p className="text-xs sm:text-lg font-medium">No results found</p>
                  <p className="text-xs sm:text-sm mt-0.5">Try different keywords</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-0.5 pb-1 sm:pb-4">
              {sortedEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  ref={(el) => {
                    entryRefs.current[entry.id] = el;
                    // Also set as latest entry ref for backwards compatibility
                    if (index === 0 && sortBy === 'newest') {
                      latestEntryRef.current = el;
                    }
                  }}
                >
                  <VocabularyEntry
                    entry={entry}
                    darkMode={darkMode}
                    onRemove={onRemove}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
});
