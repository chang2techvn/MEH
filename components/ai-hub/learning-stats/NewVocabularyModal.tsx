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
  onSuccess?: () => void;
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

          await createVocabularyEntry({
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
          
          successCount++;
        } catch (saveError) {
          console.error('Failed to save vocabulary:', vocab.term, saveError);
        }
      }

      if (successCount > 0) {
        // Reset form and close modal
        setVocabularyInput('');
        onSuccess?.();
        onClose();
        
        toast({
          title: "Vocabulary Added Successfully!",
          description: `Successfully added ${successCount} vocabulary item(s) to your collection.`,
          variant: "default",
        });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-lg transform transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      } rounded-2xl shadow-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        
        {/* Header */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                <i className="fas fa-brain text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Vocabulary Generator</h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-orange-600'}`}>
                  Let AI analyze and create vocabulary entries
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'} border`}>
            <div className="flex items-start space-x-3">
              <i className={`fas fa-info-circle mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}></i>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}>
                  How it works
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                  Enter one or multiple English words/phrases. AI will automatically generate:
                </p>
                <ul className={`text-sm mt-2 space-y-1 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>
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
          <div className="space-y-3">
            <Label htmlFor="vocabulary-input" className="text-sm font-medium flex items-center">
              <i className="fas fa-keyboard mr-2 text-orange-500"></i>
              Enter vocabulary words
            </Label>
            <Textarea
              id="vocabulary-input"
              placeholder="Enter English words or phrases (one per line or separated by commas)&#10;&#10;Examples:&#10;achievement&#10;opportunity, challenge&#10;artificial intelligence"
              value={vocabularyInput}
              onChange={(e) => setVocabularyInput(e.target.value)}
              rows={6}
              className={`rounded-xl resize-none ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              disabled={loading}
            />
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tip: You can enter multiple words at once, separated by commas or new lines
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-orange-200'} flex justify-between items-center flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <i className="fas fa-magic text-orange-500"></i>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Powered by Gemini AI
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
              onClick={handleAddVocabulary}
              disabled={loading || !vocabularyInput.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-brain mr-2"></i>
                  Generate & Add
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
