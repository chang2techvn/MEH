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
      {/* Header with search and controls - Fixed dimensions to prevent layout shifts */}
      <div className="flex-shrink-0 min-h-[120px] pb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
          <div className="w-full sm:w-64 flex-shrink-0">
            <div className="relative">
              <i className={`fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-sm pointer-events-none ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}></i>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vocabulary or meaning..."
                className={`w-full pl-10 h-10 rounded-xl transition-none ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0 flex-wrap">
            <div className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
              darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}>
              {filteredEntries.length}/{entries.length} total
            </div>
            
            {existingCount > 0 && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                darkMode ? 'bg-blue-900/30 border-blue-600 text-blue-400' : 'bg-blue-100 border-blue-300 text-blue-600'
              }`}>
                {existingCount} saved
              </div>
            )}
          </div>
        </div>

        {/* Sort options - Fixed height and layout */}
        <div className="h-8 flex items-center justify-start">
          {entries.length > 1 && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium whitespace-nowrap ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sort by:
              </span>
              <div className="flex gap-1 flex-wrap">
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
                    className={`text-xs px-3 py-1 h-7 rounded-full transition-all duration-200 whitespace-nowrap ${
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
          {/* Empty space to maintain height when no sort options */}
          {entries.length <= 1 && <div className="h-7"></div>}
        </div>
      </div>

      {/* List header with Clear New button */}
      <div className={`text-sm font-medium flex-shrink-0 pb-2 flex items-center justify-between ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <span>Added List ({filteredEntries.length} items)</span>
        
        {entries.length > existingCount && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className={`text-red-500 hover:text-red-600 whitespace-nowrap ${
              darkMode ? 'hover:bg-red-600/20' : 'hover:bg-red-50'
            } flex-shrink-0 rounded-xl text-xs px-2 py-1 h-7`}
          >
            <i className="fas fa-trash-alt mr-1"></i>
            Clear New
          </Button>
        )}
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
            <div className="space-y-1 pb-4">
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
