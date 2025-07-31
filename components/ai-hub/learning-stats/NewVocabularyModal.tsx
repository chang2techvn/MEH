import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useVocabulary } from '@/hooks/use-learning-goals';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSuccess?: () => Promise<void> | void;
}

interface AIVocabularyResponse {
  vocabularies: Array<{
    term: string;
    meaning: string;
    pronunciation: string;
    definition: string;
    example_sentence: string;
    example_translation: string;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
  }>;
}

export const NewVocabularyModal: React.FC<NewVocabularyModalProps> = ({ 
  isOpen, 
  onClose, 
  darkMode,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [vocabularyInput, setVocabularyInput] = useState('');

  const { createVocabularyEntry } = useVocabulary();

  const generateVocabularyPrompt = (input: string) => `
You are an English vocabulary expert. Please analyze the following English word(s) or phrase(s) and provide detailed information.

Input: "${input}"

For each vocabulary item, provide this information:
1. term: The exact English word/phrase
2. meaning: Vietnamese translation
3. pronunciation: IPA phonetic transcription (if available)
4. definition: Clear English definition
5. example_sentence: Natural example sentence using the word
6. example_translation: Vietnamese translation of the example sentence
7. difficulty_level: Choose from "beginner", "intermediate", or "advanced"
8. category: Choose from "general", "business", "technology", "education", "travel", "food", "health", "entertainment", "sports", "science", "art", "politics", "nature", "family", "emotions"

Respond ONLY with valid JSON in this exact format (no extra text before or after):
{
  "vocabularies": [
    {
      "term": "example",
      "meaning": "ví dụ",
      "pronunciation": "/ɪɡˈzæmpəl/",
      "definition": "a thing characteristic of its kind or illustrating a general rule",
      "example_sentence": "This is a good example of modern architecture.",
      "example_translation": "Đây là một ví dụ tốt về kiến trúc hiện đại.",
      "difficulty_level": "beginner",
      "category": "general"
    }
  ]
}
`;

  const handleAddVocabulary = async () => {
    if (!vocabularyInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter at least one English word or phrase",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call Gemini AI to generate vocabulary data
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generateVocabularyPrompt(vocabularyInput.trim()),
          systemPrompt: 'You are a professional English language teacher. Respond only with valid JSON, no additional text.'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate vocabulary: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Response:', data); // Debug log
      
      // Parse AI response with better error handling
      let aiResponse: AIVocabularyResponse;
      try {
        const content = data.content || data.message || data.response || '';
        console.log('AI Content:', content); // Debug log
        
        // Try to extract JSON from the response
        let jsonStr = content;
        
        // If the response contains extra text, try to extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        
        // Clean up the JSON string
        jsonStr = jsonStr.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/```json\s*/, '').replace(/```\s*$/, '');
        }
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/```\s*/, '').replace(/```\s*$/, '');
        }
        
        console.log('Parsed JSON string:', jsonStr); // Debug log
        aiResponse = JSON.parse(jsonStr);
        
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('Raw response:', data);
        throw new Error('AI returned invalid format. Please try again.');
      }

      // Validate the response structure
      if (!aiResponse.vocabularies || !Array.isArray(aiResponse.vocabularies) || aiResponse.vocabularies.length === 0) {
        throw new Error('No vocabulary data received from AI');
      }

      // Save all vocabularies to database
      let successCount = 0;
      for (const vocab of aiResponse.vocabularies) {
        try {
          // Validate required fields
          if (!vocab.term || !vocab.meaning) {
            console.warn('Skipping incomplete vocabulary:', vocab);
            continue;
          }

          console.log('Attempting to save vocabulary:', vocab.term);
          const result = await createVocabularyEntry({
            term: vocab.term,
            meaning: vocab.meaning,
            pronunciation: vocab.pronunciation || '',
            definition: vocab.definition || '',
            example_sentence: vocab.example_sentence || '',
            example_translation: vocab.example_translation || '',
            difficulty_level: vocab.difficulty_level || 'beginner',
            category: vocab.category || 'general',
            source: 'AI Generated'
          });
          
          console.log('Vocabulary saved successfully:', vocab.term, result);
          successCount++;
        } catch (saveError) {
          console.error('Failed to save vocabulary:', vocab.term, saveError);
        }
      }

      if (successCount > 0) {
        // Reset form and show success message
        setVocabularyInput('');
        
        toast({
          title: "Vocabulary Added Successfully!",
          description: `Successfully added ${successCount} vocabulary item(s) to your collection.`,
          variant: "default",
        });

        // Call onSuccess callback first to refresh data
        if (onSuccess) {
          console.log('Calling onSuccess callback to refresh data');
          await onSuccess();
        }
        
        // Then close modal
        onClose();
      } else {
        throw new Error('Failed to save any vocabulary items');
      }
      
    } catch (error) {
      console.error('Error processing vocabulary:', error);
      toast({
        title: "Failed to Add Vocabulary",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg transform transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col max-h-[95vh] sm:max-h-[90vh]`}>
        
        {/* Header */}
        <div className={`px-3 py-3 sm:px-6 sm:py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-neo-mint/5 to-purist-blue/5'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-neo-mint to-purist-blue flex items-center justify-center shadow-lg">
                <i className="fas fa-brain text-white text-sm sm:text-lg"></i>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-xl font-semibold bg-gradient-to-r from-neo-mint to-purist-blue bg-clip-text text-transparent truncate">
                  AI Vocabulary Generator
                </h2>
                <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                  Let AI analyze and create vocabulary entries
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0 ${
                darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-neo-mint/10 text-gray-500 hover:text-neo-mint'
              }`}
            >
              <i className="fas fa-times text-sm sm:text-lg"></i>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Instructions */}
          <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'} border`}>
            <div className="flex items-start space-x-2 sm:space-x-3">
              <i className={`fas fa-info-circle mt-0.5 text-sm sm:text-base ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}></i>
              <div className="min-w-0 flex-1">
                <h3 className={`font-medium text-sm sm:text-base ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}>
                  How it works
                </h3>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'} mb-2`}>
                  Enter one or multiple English words/phrases. AI will automatically generate:
                </p>
                <ul className={`text-xs sm:text-sm space-y-0.5 sm:space-y-1 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>
                  <li>• Vietnamese meaning</li>
                  <li>• Pronunciation (IPA)</li>
                  <li>• English definition</li>
                  <li>• Example sentences</li>
                  <li>• Difficulty level & category</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="vocabulary-input" className="text-xs sm:text-sm font-medium flex items-center">
              <i className="fas fa-keyboard mr-1.5 sm:mr-2 text-orange-500 text-xs sm:text-sm"></i>
              Enter vocabulary words
            </Label>
            <Textarea
              id="vocabulary-input"
              placeholder="Enter English words or phrases (one per line or separated by commas)&#10;&#10;Examples:&#10;achievement&#10;opportunity, challenge&#10;artificial intelligence"
              value={vocabularyInput}
              onChange={(e) => setVocabularyInput(e.target.value)}
              rows={5}
              className={`rounded-lg sm:rounded-xl resize-none text-xs sm:text-sm p-3 sm:p-4 min-h-[120px] sm:min-h-[140px] ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
              disabled={loading}
            />
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tip: You can enter multiple words at once, separated by commas or new lines
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3 sm:p-6 border-t ${darkMode ? 'border-gray-700' : 'border-orange-200'} flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 flex-shrink-0`}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <i className="fas fa-magic text-orange-500 text-xs sm:text-sm"></i>
            <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Powered by Gemini AI
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'}`}
            >
              <i className="fas fa-times mr-1.5 sm:mr-2 text-xs sm:text-sm"></i>
              Cancel
            </Button>
            <Button
              onClick={handleAddVocabulary}
              disabled={loading || !vocabularyInput.trim()}
              className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                  <span className="hidden xs:inline sm:inline">Processing...</span>
                  <span className="xs:hidden sm:hidden">...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-brain mr-1.5 sm:mr-2 text-xs sm:text-sm"></i>
                  <span className="hidden xs:inline">Generate & Add</span>
                  <span className="xs:hidden">Generate</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
