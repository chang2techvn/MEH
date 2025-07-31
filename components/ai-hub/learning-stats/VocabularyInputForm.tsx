/* eslint-disable bem/classname */
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VocabularyInputFormProps {
  darkMode: boolean;
  onAdd: (word: string, meaning: string) => void;
  existingWords: string[];
}

export const VocabularyInputForm: React.FC<VocabularyInputFormProps> = ({ 
  darkMode, 
  onAdd,
  existingWords 
}) => {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [error, setError] = useState('');
  const wordInputRef = useRef<HTMLInputElement>(null);

  // Focus word input when component mounts
  useEffect(() => {
    if (wordInputRef.current) {
      wordInputRef.current.focus();
    }
  }, []);

  const handleAdd = () => {
    const trimmedWord = word.trim();
    const trimmedMeaning = meaning.trim();
    
    // Clear previous error
    setError('');
    
    // Validation
    if (!trimmedWord) {
      setError('Please enter a vocabulary word');
      wordInputRef.current?.focus();
      return;
    }
    
    if (!trimmedMeaning) {
      setError('Please enter the meaning');
      return;
    }
    
    // Check for duplicates
    if (existingWords.some(existingWord => 
      existingWord.toLowerCase() === trimmedWord.toLowerCase()
    )) {
      setError(`Word "${trimmedWord}" already exists in the list!`);
      wordInputRef.current?.focus();
      wordInputRef.current?.select();
      return;
    }
    
    // Success - add entry
    onAdd(trimmedWord, trimmedMeaning);
    
    // Reset form
    setWord('');
    setMeaning('');
    setError('');
    
    // Focus back to word input for continuous adding
    setTimeout(() => {
      wordInputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: 'word' | 'meaning') => {
    if (e.key === 'Enter') {
      if (field === 'word' && word.trim()) {
        // Move to meaning input
        const meaningInput = document.getElementById('meaning-input') as HTMLInputElement;
        meaningInput?.focus();
      } else if (field === 'meaning' && meaning.trim()) {
        handleAdd();
      }
    }
  };

  return (
    <div className="space-y-0 flex flex-col">
      {/* Input Form - Ultra compact mobile */}
      <div className="grid grid-cols-1 gap-2 sm:gap-4">
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Word <span className="text-red-500">*</span>
          </label>
          <Input
            ref={wordInputRef}
            type="text"
            value={word}
            onChange={(e) => {
              setWord(e.target.value);
              if (error) setError(''); // Clear error when user types
            }}
            onKeyPress={(e) => handleKeyPress(e, 'word')}
            placeholder="Enter word..."
            className={`h-8 sm:h-10 text-xs sm:text-sm ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-md sm:rounded-xl ${
              error && !word.trim() ? 'border-red-400 focus:ring-red-500' : ''
            }`}
          />
        </div>
        
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Meaning <span className="text-red-500">*</span>
          </label>
          <Input
            id="meaning-input"
            type="text"
            value={meaning}
            onChange={(e) => {
              setMeaning(e.target.value);
              if (error) setError(''); // Clear error when user types
            }}
            onKeyPress={(e) => handleKeyPress(e, 'meaning')}
            placeholder="Enter meaning..."
            className={`h-8 sm:h-10 text-xs sm:text-sm ${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-md sm:rounded-xl ${
              error && !meaning.trim() ? 'border-red-400 focus:ring-red-500' : ''
            }`}
          />
        </div>
      </div>
      
      {/* Error Message - Ultra compact */}
      <div className="h-4 sm:h-6 flex items-start mt-1">
        {error && !error.includes('already exists') && (
          <div className="flex items-center gap-1 sm:gap-2 text-red-500 text-xs sm:text-sm animate-in fade-in duration-200">
            <i className="fas fa-exclamation-circle text-xs"></i>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      {/* Add Button and Duplicate Error - Ultra compact */}
      <div className="flex flex-col gap-1 sm:gap-3 mt-1 sm:mt-0">
        {error.includes('already exists') && (
          <div className="text-red-500 text-xs sm:text-sm">
            <i className="fas fa-exclamation-triangle mr-1 text-xs"></i>
            {error}
          </div>
        )}
        <div className="flex justify-center sm:justify-end">
          <Button
            onClick={handleAdd}
            disabled={!word.trim() || !meaning.trim()}
            className={`w-full sm:w-auto px-3 sm:px-6 py-1 h-7 sm:h-10 rounded-md sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
              !word.trim() || !meaning.trim()
                ? `${darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                : 'bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white shadow-lg'
            }`}
          >
            <i className="fas fa-plus mr-1 sm:mr-2 text-xs"></i>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
