import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AICharacter } from '@/types/ai-hub.types';

interface AIAssistant {
  id: string;
  name: string;
  description: string;
  category: string;
  field: string;
  role: string;
  experience: string;
  personality_traits: string[];
  response_threshold: number;
  tags: string[];
  is_active: boolean;
  avatar?: string;
  model?: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
}

export function useAIAssistants() {
  const [aiAssistants, setAIAssistants] = useState<AICharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAIAssistants();
  }, []);

  const fetchAIAssistants = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_assistants')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) {
        throw fetchError;
      }

      // Transform Supabase data to AICharacter format
      const transformedAIs: AICharacter[] = (data || []).map((ai: AIAssistant) => ({
        id: ai.id,
        name: ai.name,
        role: ai.role || 'AI Assistant',
        field: ai.field || 'General',
        description: ai.description || `${ai.name} là một AI assistant chuyên về ${ai.field}`,
        avatar: ai.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ai.name)}&background=3b82f6&color=fff&size=100`,
        online: true,
        animation: getRandomAnimation(),
        category: ai.category,
        experience: ai.experience,
        personality_traits: ai.personality_traits || [],
        response_threshold: ai.response_threshold || 0.5,
        tags: ai.tags || [],
        system_prompt: ai.system_prompt
      }));

      setAIAssistants(transformedAIs);
    } catch (error) {
      console.error('Error fetching AI assistants:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch AI assistants');
    } finally {
      setLoading(false);
    }
  };

  const getRandomAnimation = (): 'bounce' | 'pulse' | 'slide' | 'fade' => {
    const animations: ('bounce' | 'pulse' | 'slide' | 'fade')[] = ['bounce', 'pulse', 'slide', 'fade'];
    return animations[Math.floor(Math.random() * animations.length)];
  };

  const getAIById = (id: string): AICharacter | undefined => {
    return aiAssistants.find(ai => ai.id === id);
  };

  const getAIsByCategory = (category: string): AICharacter[] => {
    if (category === 'Tất cả') return aiAssistants;
    return aiAssistants.filter(ai => ai.category === category.toLowerCase());
  };

  const getAllCategories = (): string[] => {
    const categories = ['Tất cả'];
    const uniqueCategories = [...new Set(aiAssistants.map(ai => ai.category).filter(Boolean))];
    const formattedCategories = uniqueCategories.map(cat => 
      cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : ''
    ).filter(Boolean);
    return [...categories, ...formattedCategories.sort()];
  };

  return {
    aiAssistants,
    loading,
    error,
    refetch: fetchAIAssistants,
    getAIById,
    getAIsByCategory,
    getAllCategories
  };
}
