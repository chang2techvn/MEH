import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useVocabulary, VocabularyEntry } from '@/hooks/use-learning-goals';
import { pronounceVocabulary } from '@/lib/text-to-speech';
import { useToast } from '@/hooks/use-toast';

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  selectedVocabularyId?: string; // Add selected vocabulary ID prop
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({ isOpen, onClose, darkMode, selectedVocabularyId }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const vocabularyRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Use real database data
  const { vocabulary, loading, error, fetchVocabulary } = useVocabulary();

  // Fetch all vocabulary when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchVocabulary(); // Fetch all vocabulary (no limit)
    }
  }, [isOpen]);

  // Scroll to selected vocabulary after data loads
  useEffect(() => {
    if (selectedVocabularyId && vocabulary.length > 0 && vocabularyRefs.current[selectedVocabularyId]) {
      // Use setTimeout to ensure the modal is fully rendered
      setTimeout(() => {
        vocabularyRefs.current[selectedVocabularyId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [selectedVocabularyId, vocabulary.length]);

  // Handle pronunciation
  const handlePronunciation = async (term: string, pronunciation?: string) => {
    try {
      await pronounceVocabulary(term, pronunciation, (error) => {
        // Only show toast for actual errors, not interruptions
        if (!error.includes('interrupted') && !error.includes('canceled')) {
          toast({
            title: "Pronunciation Error",
            description: error,
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      // Silent catch for interrupted/canceled errors
      console.debug('Pronunciation handling completed:', error);
    }
  };

  // Get unique categories from real data
  const categories = ['All', ...Array.from(new Set(vocabulary.map(word => word.category)))];
  
  const sortOptions = [
    { value: 'created_at', label: 'Date Added' },
    { value: 'usage_count', label: 'Usage Frequency' },
    { value: 'term', label: 'Alphabetical' },
    { value: 'mastery_level', label: 'Mastery Level' }
  ];

  const filteredVocabulary = vocabulary
    .filter(word => 
      (selectedCategory === 'All' || word.category === selectedCategory) &&
      (word.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
       word.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage_count':
          return b.usage_count - a.usage_count;
        case 'term':
          return a.term.localeCompare(b.term);
        case 'mastery_level':
          return b.mastery_level - a.mastery_level;
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getMasteryColor = (masteryLevel: number) => {
    if (masteryLevel <= 1) return 'bg-red-100 text-red-800 border-red-200';
    if (masteryLevel <= 2) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (masteryLevel <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (masteryLevel <= 4) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getMasteryLabel = (masteryLevel: number) => {
    if (masteryLevel <= 1) return 'Beginner';
    if (masteryLevel <= 2) return 'Basic';
    if (masteryLevel <= 3) return 'Intermediate';
    if (masteryLevel <= 4) return 'Good';
    return 'Master';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-6xl mx-4 h-[80vh] ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl transform transition-all duration-300 animate-fadeIn flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-neo-mint/5 to-purist-blue/5'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neo-mint to-purist-blue flex items-center justify-center shadow-lg">
                <i className="fas fa-book text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent">
                  Your Vocabulary Collection
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total {vocabulary.length} words learned
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
        </div>

        {/* Controls */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-4 flex-shrink-0`}>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Input
                placeholder="Search vocabulary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 focus:ring-purist-blue' : 'bg-gray-50 border-gray-200 focus:ring-neo-mint'} transition-all duration-200`}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`min-w-[140px] justify-between rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-neo-mint/5 border-gray-200 hover:border-neo-mint/20'} transition-all duration-200`}
                >
                  <div className="flex items-center">
                    <i className="fas fa-filter mr-2 text-sm"></i>
                    {selectedCategory}
                  </div>
                  <i className="fas fa-chevron-down text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`cursor-pointer ${selectedCategory === category ? 'bg-neo-mint/10 text-neo-mint dark:bg-purist-blue/10 dark:text-purist-blue' : ''}`}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className={`min-w-[140px] justify-between rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-neo-mint/5 border-gray-200 hover:border-neo-mint/20'} transition-all duration-200`}
                >
                  <div className="flex items-center">
                    <i className="fas fa-sort mr-2 text-sm"></i>
                    {sortOptions.find(opt => opt.value === sortBy)?.label}
                  </div>
                  <i className="fas fa-chevron-down text-xs"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`cursor-pointer ${sortBy === option.value ? 'bg-neo-mint/10 text-neo-mint dark:bg-purist-blue/10 dark:text-purist-blue' : ''}`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Vocabulary Grid - Scrollable Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 scrollbar-auto-hide">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-sm`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-5 w-8" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-16 w-full mb-3" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className={`text-6xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  Data Loading Error
                </h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-4`}>
                  {error}
                </p>
                <Button onClick={() => fetchVocabulary()} variant="outline" className="rounded-xl">
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
                </Button>
              </div>
            ) : vocabulary.length === 0 ? (
              <div className="text-center py-12">
                <div className={`text-6xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
                  <i className="fas fa-book-open"></i>
                </div>
                <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  No Vocabulary Yet
                </h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Start learning to build your vocabulary collection!
                </p>
              </div>
            ) : filteredVocabulary.length === 0 ? (
              <div className="text-center py-12">
                <div className={`text-6xl ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
                  <i className="fas fa-search"></i>
                </div>
                <h3 className={`text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                  No Words Found
                </h3>
                <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Try changing your search keywords or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredVocabulary.map((word, index) => (
                  <div
                    key={word.id}
                    ref={(el) => { vocabularyRefs.current[word.id] = el; }}
                    className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-sm transition-all duration-300 animate-fadeIn group cursor-pointer ${selectedVocabularyId === word.id ? 'ring-2 ring-orange-500' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-neo-mint dark:group-hover:text-purist-blue transition-colors duration-200">
                          {word.term}
                        </h3>
                        {word.pronunciation && (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-mono`}>
                            [{word.pronunciation}]
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-neo-mint/10 text-neo-mint dark:bg-purist-blue/10 dark:text-purist-blue hover:bg-neo-mint/20 dark:hover:bg-purist-blue/20 transition-colors duration-200 rounded-lg">
                          {word.usage_count}x
                        </Badge>
                        <Badge className={`text-xs border rounded-lg ${getMasteryColor(word.mastery_level)}`}>
                          {getMasteryLabel(word.mastery_level)}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3 font-medium`}>
                      {word.meaning}
                    </p>
                    
                    {word.example_sentence && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-3`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>
                          "{word.example_sentence}"
                        </p>
                        {word.example_translation && (
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                            {word.example_translation}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs rounded-lg">
                          {word.category}
                        </Badge>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(word.created_at).toLocaleDateString('en-US')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-neo-mint/10 hover:text-neo-mint dark:hover:bg-purist-blue/10 dark:hover:text-purist-blue transition-all duration-200"
                          title="Pronounce"
                          onClick={() => handlePronunciation(word.term, word.pronunciation)}
                        >
                          <i className="fas fa-volume-up text-sm"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-neo-mint/10 hover:text-neo-mint dark:hover:bg-purist-blue/10 dark:hover:text-purist-blue transition-all duration-200"
                          title="Add to Review"
                        >
                          <i className="fas fa-bookmark text-sm"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-shrink-0`}>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className={`rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-neo-mint/5 border-gray-200 hover:border-neo-mint/20'} transition-all duration-200`}
            >
              <i className="fas fa-download mr-2"></i>
              Export File
            </Button>
            <Button
              variant="outline"
              className={`rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-neo-mint/5 border-gray-200 hover:border-neo-mint/20'} transition-all duration-200`}
            >
              <i className="fas fa-upload mr-2"></i>
              Import File
            </Button>
          </div>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 shadow-lg rounded-xl"
            onClick={onClose}
          >
            <i className="fas fa-check mr-2"></i>
            Complete
          </Button>
        </div>
      </div>
    </div>
  );
};
