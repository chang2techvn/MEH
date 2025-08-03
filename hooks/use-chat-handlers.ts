import { useState } from 'react';
import { AICharacter } from '@/types/ai-hub.types';

interface UseChatHandlersProps {
  selectedAIs: string[];
  setSelectedAIs: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  chatSessions: any[];
  loadSession: (chatId: string) => Promise<void>;
  clearSession: () => void;
  clearSingleChatMessages: () => void;
  createSession: (title: string) => Promise<void>;
  aiAssistants: AICharacter[];
  windowWidth: number;
  setIsSidebarOpen: (open: boolean) => void;
}

interface UseChatHandlersReturn {
  toggleAISelection: (aiId: string) => void;
  handleChatSelect: (chatId: string) => Promise<void>;
  handleNewChat: () => void;
  handleMobileAISelection: (ai: AICharacter) => Promise<void>;
  handleMobileStartChat: (selectedAIIds: string[]) => Promise<void>;
  handleMobileChatSelection: (chatId: string) => void;
}

export const useChatHandlers = ({
  selectedAIs,
  setSelectedAIs,
  setCurrentChatId,
  chatSessions,
  loadSession,
  clearSession,
  clearSingleChatMessages,
  createSession,
  aiAssistants,
  windowWidth,
  setIsSidebarOpen
}: UseChatHandlersProps): UseChatHandlersReturn => {

  const toggleAISelection = (aiId: string) => {
    if (selectedAIs.includes(aiId)) {
      // Allow deselecting any AI, even if it's the last one
      setSelectedAIs(selectedAIs.filter(id => id !== aiId));
    } else {
      setSelectedAIs([...selectedAIs, aiId]);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    setCurrentChatId(chatId);
    // Load session and messages from Supabase
    const session = chatSessions.find(s => s.id === chatId);
    if (session) {
      setSelectedAIs(session.participants);
      // Load the session with its messages
      await loadSession(chatId);
    }
    // Đóng sidebar trên mobile sau khi select
    if (windowWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    clearSession(); // Clear current session and messages
    // Reset to no AIs selected - single chat mode
    setSelectedAIs([]);
    // Clear single chat messages using hook function
    clearSingleChatMessages();
  };

  // Handler for AI selection from mobile bottom navigation
  const handleMobileAISelection = async (ai: AICharacter) => {
    // Start new chat with selected AI
    handleNewChat();
    // Switch to multi-chat mode with selected AI
    setSelectedAIs([ai.id]);
    // Create a new session with this AI
    try {
      await createSession(`Trò chuyện với ${ai.name}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Handler for multi-AI chat start from mobile bottom navigation
  const handleMobileStartChat = async (selectedAIIds: string[]) => {
    // Start new chat
    handleNewChat();
    // Switch to multi-chat mode with selected AIs
    setSelectedAIs(selectedAIIds);
    // Create a new session with these AIs
    try {
      const aiNames = selectedAIIds.map(id => {
        const ai = aiAssistants.find(a => a.id === id);
        return ai?.name || 'AI';
      }).join(', ');
      await createSession(`Trò chuyện với ${aiNames}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Handler for chat selection from mobile bottom navigation
  const handleMobileChatSelection = (chatId: string) => {
    handleChatSelect(chatId);
  };

  return {
    toggleAISelection,
    handleChatSelect,
    handleNewChat,
    handleMobileAISelection,
    handleMobileStartChat,
    handleMobileChatSelection
  };
};
