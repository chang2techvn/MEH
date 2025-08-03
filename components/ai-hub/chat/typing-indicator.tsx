"use client"

import React from 'react';
import { OptimizedAvatarEnhanced } from '@/components/optimized/optimized-avatar-enhanced';
import { AICharacter } from '@/types/ai-hub.types';
import { singleChatService } from '@/lib/single-chat-service';

interface TypingIndicatorProps {
  /** Whether dark mode is enabled */
  isDarkMode: boolean;
  /** Selected AI IDs */
  selectedAIs: string[];
  /** Whether single chat is processing */
  singleChatProcessing: boolean;
  /** Typing AIs array */
  typingAIs: { id: string; name: string; avatar: string; }[];
  /** Function to get dynamic padding */
  getDynamicPadding: () => string;
  /** Whether this is mobile version (fixed positioning) */
  isMobile?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isDarkMode,
  selectedAIs,
  singleChatProcessing,
  typingAIs,
  getDynamicPadding,
  isMobile = false
}) => {
  // Only show when typing is active
  const shouldShow = selectedAIs.length === 0 ? singleChatProcessing : typingAIs.length > 0;

  if (!shouldShow) {
    return null;
  }

  // Mobile version with fixed positioning above input
  if (isMobile) {
    return (
      <div className="lg:hidden fixed bottom-32 left-4 right-auto z-30 pointer-events-none">
        <div className="flex justify-start">
          <div className={`rounded-full px-2 py-1.5 ${isDarkMode ? 'bg-gray-800/90 border border-gray-600/30' : 'bg-white/90 border border-gray-200/30'} shadow-md backdrop-blur-sm`}>
            <div className="flex items-center space-x-1.5">
              {/* Compact Mobile Avatar */}
              <div className="flex -space-x-0.5">
                {selectedAIs.length === 0 ? (
                  // Single chat assistant avatar - smaller
                  <OptimizedAvatarEnhanced
                    src={singleChatService.getAssistantAvatar()}
                    alt={singleChatService.getAssistantName()}
                    size={16}
                    className="shadow-xs border border-white"
                    fallbackText="EA"
                  />
                ) : (
                  // Group chat typing AIs - smaller
                  typingAIs.slice(0, 2).map((ai) => (
                    <OptimizedAvatarEnhanced
                      key={ai.id}
                      src={ai.avatar}
                      alt={ai.name}
                      size={16}
                      className="shadow-xs border border-white"
                      fallbackText={ai.name.substring(0, 1)}
                    />
                  ))
                )}
              </div>
              {/* Compact Mobile Typing Animation */}
              <div className="flex space-x-0.5">
                <div className="w-1 h-1 rounded-full bg-orange-400 animate-bounce"></div>
                <div className="w-1 h-1 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1 h-1 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version (original)
  return (
    <div className={`hidden lg:block ${getDynamicPadding()} py-2`}>
      <div className="flex items-center space-x-2">
        {/* Desktop Avatars */}
        <div className="flex -space-x-1">
          {selectedAIs.length === 0 ? (
            // Single chat assistant avatar
            <OptimizedAvatarEnhanced
              src={singleChatService.getAssistantAvatar()}
              alt={singleChatService.getAssistantName()}
              size={16}
              className="shadow-sm border border-white"
              fallbackText="EA"
            />
          ) : (
            // Group chat typing AIs
            typingAIs.map((ai) => (
              <OptimizedAvatarEnhanced
                key={ai.id}
                src={ai.avatar}
                alt={ai.name}
                size={16}
                className="shadow-sm border border-white"
                fallbackText={ai.name.substring(0, 1)}
              />
            ))
          )}
        </div>
        {/* Desktop Compact Typing Indicator */}
        <div className={`rounded-lg px-2 py-1 ${isDarkMode ? 'bg-gray-700/95 border border-gray-600/50' : 'bg-white/95 border border-gray-200/50'} shadow-md backdrop-blur-sm`}>
          <div className="flex items-center space-x-1.5">
            <div className="flex space-x-0.5">
              <div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse sm:animate-bounce"></div>
              <div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse sm:animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse sm:animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className={`text-[10px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedAIs.length === 0 
                ? 'typing...'
                : (typingAIs.length === 1 
                  ? 'typing...'
                  : `${typingAIs.length} typing...`
                )
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
