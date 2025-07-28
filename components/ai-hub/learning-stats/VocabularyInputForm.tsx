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
    <div className="space-y-4 h-full flex flex-col">
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Vocabulary <span className="text-red-500">*</span>
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
            placeholder="Enter vocabulary word..."
            className={`${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-xl ${
              error && !word.trim() ? 'border-red-400 focus:ring-red-500' : ''
            }`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${
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
            placeholder="Enter word meaning..."
            className={`${
              darkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-xl ${
              error && !meaning.trim() ? 'border-red-400 focus:ring-red-500' : ''
            }`}
          />
        </div>
      </div>
      
      {/* Error Message - Fixed height to prevent layout shift */}
      <div className="h-6 flex items-start">
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm animate-in fade-in duration-200">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
      </div>
      
      {/* Add Button - Fixed position */}
      <div className="flex justify-end mt-auto">
        <Button
          onClick={handleAdd}
          disabled={!word.trim() || !meaning.trim()}
          className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
            !word.trim() || !meaning.trim()
              ? `${darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Word
        </Button>
      </div>
    </div>
  );
};
