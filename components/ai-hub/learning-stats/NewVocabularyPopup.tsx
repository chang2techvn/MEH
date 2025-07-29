import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVocabulary } from '@/hooks/use-learning-goals';
import { generateGeminiResponse } from '@/lib/gemini-api';
import { useToast } from '@/hooks/use-toast';

interface NewVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSuccess?: () => void; // Optional callback for when vocabulary is created successfully
}

export const NewVocabularyModal: React.FC<NewVocabularyModalProps> = ({ 
  isOpen, 
  onClose, 
  darkMode,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { createVocabularyEntry } = useVocabulary();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!term.trim()) {
      toast({
        title: "Error",
        description: "Please enter a vocabulary term",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create detailed prompt for Gemini AI
      const prompt = `Please analyze the English word "${term.trim()}" and provide comprehensive vocabulary information in the following JSON format:

{
  "term": "${term.trim()}",
  "meaning": "Vietnamese translation/meaning",
  "pronunciation": "IPA phonetic transcription (e.g., /ˈeksəmpəl/)",
  "definition": "Detailed English definition",
  "example_sentence": "Example sentence in English using this word",
  "example_translation": "Vietnamese translation of the example sentence",
  "difficulty_level": "beginner/intermediate/advanced",
  "category": "category like 'noun', 'verb', 'adjective', 'business', 'academic', etc."
}

Please ensure:
- The meaning is in Vietnamese
- The pronunciation uses correct IPA notation
- The example sentence is natural and contextual
- The difficulty level is appropriate for ESL learners
- The category reflects the word type or domain
- All fields are filled with accurate information

Return only the JSON object, no additional text.`;

      console.log('🤖 Sending request to Gemini AI for vocabulary:', term);
      
      const response = await generateGeminiResponse(prompt);
      console.log('📝 Gemini AI response:', response);

      // Parse the JSON response
      let vocabularyData;
      try {
        // Clean the response to extract JSON
        const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        vocabularyData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      // Validate required fields
      if (!vocabularyData.term || !vocabularyData.meaning) {
        throw new Error('Incomplete vocabulary data received from AI');
      }

      // Create vocabulary entry in database
      const newEntry = {
        term: vocabularyData.term,
        meaning: vocabularyData.meaning,
        pronunciation: vocabularyData.pronunciation || '',
        definition: vocabularyData.definition || '',
        example_sentence: vocabularyData.example_sentence || '',
        example_translation: vocabularyData.example_translation || '',
        difficulty_level: vocabularyData.difficulty_level || 'beginner',
        category: vocabularyData.category || 'general',
        source: 'AI Generated',
        usage_count: 0,
        mastery_level: 'learning' as const
      };

      await createVocabularyEntry(newEntry);

      toast({
        title: "Success",
        description: `Vocabulary "${vocabularyData.term}" has been added successfully!`,
        variant: "default",
      });

      // Reset form and close modal
      setTerm('');
      onSuccess?.();
      onClose();

    } catch (error: any) {
      console.error('❌ Error creating vocabulary:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create vocabulary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
      <div className={`relative w-full max-w-md mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl transform transition-all duration-300 animate-fadeIn`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <i className="fas fa-plus text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Add New Vocabulary
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enter an English word and AI will complete the rest
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`h-9 w-9 rounded-xl transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'
              }`}
            >
              <i className="fas fa-times text-lg"></i>
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="term" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              English Word *
            </Label>
            <Input
              id="term"
              type="text"
              placeholder="e.g., extraordinary, achieve, perspective..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className={`rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 focus:ring-orange-500' : 'bg-gray-50 border-gray-200 focus:ring-orange-500'} transition-all duration-200`}
              disabled={loading}
              autoFocus
            />
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              🤖 AI will automatically generate pronunciation, meaning, examples, and more
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} border ${darkMode ? 'border-gray-600' : 'border-orange-200'}`}>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-orange-800'}`}>
                    🤖 AI is analyzing "{term}"...
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                    Generating pronunciation, meaning, examples, and categories
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`flex-1 rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50 border-gray-200'} transition-all duration-200`}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 shadow-lg rounded-xl"
              disabled={loading || !term.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
