import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVocabulary } from '@/hooks/use-learning-goals';

interface NewVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSuccess?: () => void; // Optional callback for when vocabulary is created successfully
}

interface VocabularyFormData {
  term: string;
  meaning: string;
  pronunciation: string;
  definition: string;
  example_sentence: string;
  example_translation: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  source: string;
}

export const NewVocabularyModal: React.FC<NewVocabularyModalProps> = ({ 
  isOpen, 
  onClose, 
  darkMode,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VocabularyFormData>({
    term: '',
    meaning: '',
    pronunciation: '',
    definition: '',
    example_sentence: '',
    example_translation: '',
    difficulty_level: 'beginner',
    category: 'general',
    source: ''
  });

  const { createVocabularyEntry } = useVocabulary();

  const categories = [
    'general',
    'business',
    'technology',
    'education',
    'travel',
    'food',
    'health',
    'entertainment',
    'sports',
    'science',
    'art',
    'politics',
    'nature',
    'family',
    'emotions',
    'other'
  ];

  const handleInputChange = (field: keyof VocabularyFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.term.trim() || !formData.meaning.trim()) {
      alert('Please fill in the required fields: Term and Meaning');
      return;
    }

    setLoading(true);
    try {
      await createVocabularyEntry(formData);
      
      // Reset form
      setFormData({
        term: '',
        meaning: '',
        pronunciation: '',
        definition: '',
        example_sentence: '',
        example_translation: '',
        difficulty_level: 'beginner',
        category: 'general',
        source: ''
      });
      
      onSuccess?.(); // Call success callback if provided
      onClose();
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      alert('Failed to create vocabulary entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl transform transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <i className="fas fa-plus text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Vocabulary</h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                  Expand your vocabulary collection
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

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-2`}>
                Required Information
              </h3>
              
              {/* Term */}
              <div className="space-y-2">
                <Label htmlFor="term" className="text-sm font-medium">
                  Term <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="term"
                  type="text"
                  placeholder="Enter the vocabulary term..."
                  value={formData.term}
                  onChange={(e) => handleInputChange('term', e.target.value)}
                  className={`rounded-xl ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  required
                />
              </div>

              {/* Meaning */}
              <div className="space-y-2">
                <Label htmlFor="meaning" className="text-sm font-medium">
                  Meaning <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="meaning"
                  type="text"
                  placeholder="Enter the meaning in Vietnamese..."
                  value={formData.meaning}
                  onChange={(e) => handleInputChange('meaning', e.target.value)}
                  className={`rounded-xl ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  required
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-2`}>
                Additional Details
              </h3>

              {/* Pronunciation */}
              <div className="space-y-2">
                <Label htmlFor="pronunciation" className="text-sm font-medium">
                  Pronunciation (IPA)
                </Label>
                <Input
                  id="pronunciation"
                  type="text"
                  placeholder="e.g., /ˈvɒkæbjʊləri/"
                  value={formData.pronunciation}
                  onChange={(e) => handleInputChange('pronunciation', e.target.value)}
                  className={`rounded-xl ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
              </div>

              {/* Definition */}
              <div className="space-y-2">
                <Label htmlFor="definition" className="text-sm font-medium">
                  Definition (English)
                </Label>
                <Textarea
                  id="definition"
                  placeholder="Detailed English definition..."
                  value={formData.definition}
                  onChange={(e) => handleInputChange('definition', e.target.value)}
                  rows={2}
                  className={`rounded-xl resize-none ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
              </div>

              {/* Example Sentence */}
              <div className="space-y-2">
                <Label htmlFor="example_sentence" className="text-sm font-medium">
                  Example Sentence
                </Label>
                <Textarea
                  id="example_sentence"
                  placeholder="Example sentence using this word..."
                  value={formData.example_sentence}
                  onChange={(e) => handleInputChange('example_sentence', e.target.value)}
                  rows={2}
                  className={`rounded-xl resize-none ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
              </div>

              {/* Example Translation */}
              <div className="space-y-2">
                <Label htmlFor="example_translation" className="text-sm font-medium">
                  Example Translation
                </Label>
                <Textarea
                  id="example_translation"
                  placeholder="Vietnamese translation of the example sentence..."
                  value={formData.example_translation}
                  onChange={(e) => handleInputChange('example_translation', e.target.value)}
                  rows={2}
                  className={`rounded-xl resize-none ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
              </div>

              {/* Row with selects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                      handleInputChange('difficulty_level', value)
                    }
                  >
                    <SelectTrigger className={`rounded-xl ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                      <SelectItem value="beginner">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Beginner
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                          Intermediate
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          Advanced
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={`rounded-xl ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center">
                            <i className="fas fa-tag mr-2 text-xs"></i>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm font-medium">
                  Source
                </Label>
                <Input
                  id="source"
                  type="text"
                  placeholder="Where did you learn this word? (book, movie, conversation, etc.)"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className={`rounded-xl ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-orange-200'} flex justify-between items-center flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <i className="fas fa-info-circle text-orange-500"></i>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Fill in the required fields to add vocabulary
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={`${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'}`}
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !formData.term.trim() || !formData.meaning.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Add Vocabulary
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
