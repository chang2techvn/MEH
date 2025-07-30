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
  vocabulary?: VocabularyEntry[]; // Optional vocabulary data from parent
  loading?: boolean; // Optional loading state from parent
  onDeleteVocabulary?: (vocabularyId: string) => Promise<boolean>; // Optional delete function from parent
  onCreateNew?: () => void; // Optional create new vocabulary function
}

export const VocabularyModal: React.FC<VocabularyModalProps> = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  selectedVocabularyId,
  vocabulary: parentVocabulary,
  loading: parentLoading,
  onDeleteVocabulary: parentDeleteVocabulary,
  onCreateNew
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const vocabularyRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    vocabularyId: string;
    term: string;
  }>({
    isOpen: false,
    vocabularyId: '',
    term: ''
  });

  // Use real database data with improved caching
  const { 
    vocabulary: hookVocabulary, 
    loading: hookLoading, 
    error, 
    isInitialized, 
    fetchVocabulary, 
    deleteVocabularyEntry: hookDeleteVocabulary, 
    refreshVocabulary 
  } = useVocabulary();

  // Use parent-provided data if available, otherwise use hook data
  const vocabulary = parentVocabulary || hookVocabulary;
  const loading = parentLoading ?? hookLoading;
  const deleteVocabularyEntry = parentDeleteVocabulary || hookDeleteVocabulary;

  // Fetch vocabulary data with smart caching
  useEffect(() => {
    if (isOpen && !isInitialized) {
      // Only fetch if not already initialized
      fetchVocabulary();
    } else if (isOpen && isInitialized && vocabulary.length === 0) {
      // Fallback refresh if somehow we lost data
      refreshVocabulary();
    }
  }, [isOpen, isInitialized, vocabulary.length]);

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

  // Handle CSV export
  const handleExportCSV = () => {
    if (!vocabulary || vocabulary.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no vocabulary entries to export.",
        variant: "destructive",
      });
      return;
    }

    // Helper function to escape CSV values
    const escapeCSV = (value: string | number | undefined | null): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
      if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    // Create CSV content with proper formatting
    const headers = ['Term', 'Meaning', 'Pronunciation', 'Definition', 'Example Sentence', 'Example Translation', 'Category', 'Difficulty Level', 'Usage Count', 'Mastery Level', 'Date Added'];
    
    const csvRows = [
      headers.join(','),
      ...vocabulary.map(entry => [
        escapeCSV(entry.term),
        escapeCSV(entry.meaning),
        escapeCSV(entry.pronunciation),
        escapeCSV(entry.definition),
        escapeCSV(entry.example_sentence),
        escapeCSV(entry.example_translation),
        escapeCSV(entry.category),
        escapeCSV(entry.difficulty_level),
        escapeCSV(entry.usage_count),
        escapeCSV(entry.mastery_level),
        escapeCSV(entry.created_at ? new Date(entry.created_at).toLocaleDateString('vi-VN') : '')
      ].join(','))
    ];

    const csvContent = csvRows.join('\r\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create and download file
    const blob = new Blob([csvWithBOM], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vocabulary-collection-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${vocabulary.length} vocabulary entries to CSV file.`,
    });
  };

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

  // Handle vocabulary deletion confirmation
  const handleDeleteVocabulary = (vocabularyId: string, term: string) => {
    setDeleteConfirmation({
      isOpen: true,
      vocabularyId,
      term
    });
  };

  // Confirm and execute deletion
  const confirmDeleteVocabulary = async () => {
    try {
      const { vocabularyId, term } = deleteConfirmation;
      
      const success = await deleteVocabularyEntry(vocabularyId);
      
      if (success) {
        toast({
          title: "Vocabulary Deleted",
          description: `"${term}" has been removed from your collection.`,
          variant: "default",
        });
        
        // Real-time subscription will handle UI updates automatically
        // No need to manually refresh
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete the vocabulary. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the vocabulary.",
        variant: "destructive",
      });
    } finally {
      // Close confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        vocabularyId: '',
        term: ''
      });
    }
  };

  // Cancel deletion
  const cancelDeleteVocabulary = () => {
    setDeleteConfirmation({
      isOpen: false,
      vocabularyId: '',
      term: ''
    });
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
                  {loading && vocabulary.length > 0 && (
                    <span className="ml-2 inline-flex items-center">
                      <i className="fas fa-sync-alt fa-spin text-xs"></i>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onCreateNew && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onCreateNew}
                  className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add New Vocabulary
                </Button>
              )}
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
            {loading && vocabulary.length === 0 ? (
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
                <Button onClick={() => refreshVocabulary()} variant="outline" className="rounded-xl">
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
                    className={`p-5 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'} shadow-sm transition-all duration-300 animate-fadeIn group cursor-pointer ${selectedVocabularyId === word.id ? 'ring-2 ring-orange-500' : ''} flex flex-col`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Header Section - Fixed Height */}
                    <div className="flex items-start justify-between mb-3 min-h-[60px]">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-neo-mint dark:group-hover:text-purist-blue transition-colors duration-200 line-clamp-1">
                          {word.term}
                        </h3>
                        <div className="h-5 flex items-center">
                          {word.pronunciation ? (
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-mono`}>
                              [{word.pronunciation}]
                            </p>
                          ) : (
                            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>
                              No pronunciation
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-3">
                        <div className="h-6 flex items-center">
                          <Badge className="bg-neo-mint/10 text-neo-mint dark:bg-purist-blue/10 dark:text-purist-blue hover:bg-neo-mint/20 dark:hover:bg-purist-blue/20 transition-colors duration-200 rounded-lg min-w-[40px] text-center">
                            {word.usage_count}x
                          </Badge>
                        </div>
                        <div className="h-6 flex items-center">
                          <Badge className={`text-xs border rounded-lg min-w-[80px] text-center ${getMasteryColor(word.mastery_level)}`}>
                            {getMasteryLabel(word.mastery_level)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Meaning Section - Fixed Height */}
                    <div className="mb-3 min-h-[48px] flex items-start">
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium line-clamp-2`}>
                        {word.meaning}
                      </p>
                    </div>
                    
                    {/* Example Section - Flexible Height */}
                    <div className="flex-1 mb-3">
                      {word.example_sentence ? (
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} italic line-clamp-2`}>
                            "{word.example_sentence}"
                          </p>
                          {word.example_translation && (
                            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1 line-clamp-1`}>
                              {word.example_translation}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} min-h-[60px] flex items-center justify-center`}>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>
                            No example sentence
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer Section - Fixed Height */}
                    <div className="flex items-center justify-between h-8">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant="outline" className="text-xs rounded-lg flex-shrink-0">
                          {word.category}
                        </Badge>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                          {new Date(word.created_at).toLocaleDateString('en-US')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
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
                          className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
                          title="Delete Vocabulary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVocabulary(word.id, word.term);
                          }}
                        >
                          <i className="fas fa-trash text-sm"></i>
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
              onClick={handleExportCSV}
              className={`rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-neo-mint/5 border-gray-200 hover:border-neo-mint/20'} transition-all duration-200`}
            >
              <i className="fas fa-download mr-2"></i>
              Export File
            </Button>
          </div>
          <Button
            className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white transition-all duration-300 shadow-lg rounded-xl"
            onClick={onClose}
          >
            <i className="fas fa-check mr-2"></i>
            Complete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={cancelDeleteVocabulary}
          />
          
          {/* Confirmation Modal */}
          <div className={`relative max-w-md mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl transform transition-all duration-300 animate-fadeIn p-6`}>
            <div className="text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              
              {/* Title */}
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Delete Vocabulary
              </h3>
              
              {/* Message */}
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to delete "<span className="font-medium text-red-600 dark:text-red-400">{deleteConfirmation.term}</span>"? 
                This action cannot be undone.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={cancelDeleteVocabulary}
                  className={`px-6 rounded-xl ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteVocabulary}
                  className="px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
