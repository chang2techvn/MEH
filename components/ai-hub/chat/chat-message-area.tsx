"use client"

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from '@/components/ai-hub/chat/MessageItem';
import { WelcomeScreen } from '@/components/ai-hub/chat/WelcomeScreen';
import { Message, AICharacter } from '@/types/ai-hub.types';
import { singleChatService } from '@/lib/single-chat-service';

interface ChatMessageAreaProps {
  /** Whether dark mode is enabled */
  isDarkMode: boolean;
  /** Selected AI IDs */
  selectedAIs: string[];
  /** Single chat messages */
  singleChatMessages: Message[];
  /** Group chat messages */
  messages: Message[];
  /** Function to get scroll area padding */
  getScrollAreaPadding: () => string;
  /** Function to get dynamic max width */
  getDynamicMaxWidth: () => string;
  /** Function to get dynamic padding */
  getDynamicPadding: () => string;
  /** Function to toggle AI selection */
  onToggleAI: (aiId: string) => void;
  /** AI characters array */
  aiCharacters: AICharacter[];
  /** Function to get AI by name */
  getAIByName: (name: string) => AICharacter | undefined;
  /** Function to start reply mode */
  startReplyMode: (messageId: string, aiId: string, aiName: string) => void;
  /** Chat container ref */
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessageArea: React.FC<ChatMessageAreaProps> = ({
  isDarkMode,
  selectedAIs,
  singleChatMessages,
  messages,
  getScrollAreaPadding,
  getDynamicMaxWidth,
  getDynamicPadding,
  onToggleAI,
  aiCharacters,
  getAIByName,
  startReplyMode,
  chatContainerRef
}) => {
  return (
    <ScrollArea
      className={`flex-1 chat-mobile smooth-auto-scroll ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'} ${getScrollAreaPadding()} pb-28 lg:pb-0`}
      ref={chatContainerRef}
    >
      <div className={getDynamicMaxWidth()}>
        {/* Show Welcome Screen when no messages exist */}
        {(selectedAIs.length === 0 ? singleChatMessages.length === 0 : messages.length === 0) ? (
          <WelcomeScreen
            selectedAIs={selectedAIs}
            onToggleAI={onToggleAI}
            aiCharacters={aiCharacters}
            darkMode={isDarkMode}
            onStartChat={() => {
              // Focus on input after selecting AIs
              const input = document.querySelector('textarea');
              if (input) input.focus();
            }}
          />
        ) : (
          <div className={`space-y-3 sm:space-y-6 ${getDynamicPadding()} py-4 sm:py-8`}>
            {selectedAIs.length === 0 ? (
              // Single chat mode - show single chat messages
              (() => {
                return singleChatMessages.map((message) => {
                  const isUser = message.sender === 'user';
                  // Get AI character from service for single chat assistant
                  const assistantCharacter = isUser ? undefined : singleChatService.getAssistantCharacter();
                  
                  return (
                    <MessageItem
                      key={message.id}
                      message={message}
                      ai={assistantCharacter}
                      darkMode={isDarkMode}
                      onReply={() => {}} // No reply function for single chat
                    />
                  );
                });
              })()
            ) : (
              // Group chat mode - show group chat messages
              messages.map((message) => {
                const isUser = message.sender === 'user';
                // For AI messages, sender will be the AI name (not ID)
                const ai = isUser ? null : getAIByName(message.sender);
                
                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    ai={ai ?? undefined}
                    darkMode={isDarkMode}
                    onReply={startReplyMode}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
