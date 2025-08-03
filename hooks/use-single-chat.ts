import { useState } from 'react';
import { Message } from '@/types/ai-hub.types';
import { singleChatService } from '@/lib/single-chat-service';

interface UseSingleChatReturn {
  singleChatMessages: Message[];
  singleChatProcessing: boolean;
  setSingleChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSingleChatProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  handleSingleChatMessage: (content: string, scrollToBottom: () => void) => Promise<void>;
  clearSingleChatMessages: () => void;
}

export const useSingleChat = (): UseSingleChatReturn => {
  const [singleChatMessages, setSingleChatMessages] = useState<Message[]>([]);
  const [singleChatProcessing, setSingleChatProcessing] = useState(false);

  // Handle single chat message
  const handleSingleChatMessage = async (content: string, scrollToBottom: () => void) => {
    const userMessageId = singleChatService.generateMessageId();
    const assistantMessageId = singleChatService.generateMessageId();
    
    // Add user message with correct Message interface
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      content,
      timestamp: new Date(),
      type: 'text' as const,
      isTyping: false,
      mediaUrl: null
    };
    
    setSingleChatMessages(prev => {
      const newMessages = [...prev, userMessage];
      return newMessages;
    });
    
    // Auto-scroll after adding user message
    setTimeout(() => scrollToBottom(), 100);
    
    setSingleChatProcessing(true);
    
    try {
      // Get AI response
      const aiResponse = await singleChatService.sendMessage(content);
      
      // Add assistant message with correct Message interface
      const assistantMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        type: 'text' as const,
        isTyping: false,
        mediaUrl: null,
        highlights: aiResponse.highlights,
        vocabulary: aiResponse.vocabulary
      };
      
      setSingleChatMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        return newMessages;
      });
      
      // Auto-scroll after adding assistant message
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('❌ Error in single chat:', error);
      // Add error message with correct Message interface
      const errorMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        content: "I'm sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
        type: 'text' as const,
        isTyping: false,
        mediaUrl: null
      };
      setSingleChatMessages(prev => [...prev, errorMessage]);
      
      // Auto-scroll after adding error message
      setTimeout(() => scrollToBottom(), 100);
    } finally {
      setSingleChatProcessing(false);
    }
  };

  // Clear single chat messages
  const clearSingleChatMessages = () => {
    setSingleChatMessages([]);
    setSingleChatProcessing(false);
  };

  return {
    singleChatMessages,
    singleChatProcessing,
    setSingleChatMessages,
    setSingleChatProcessing,
    handleSingleChatMessage,
    clearSingleChatMessages
  };
};
