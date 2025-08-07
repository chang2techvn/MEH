"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OptimizedAvatarEnhanced } from '@/components/optimized/optimized-avatar-enhanced';
import { CreateCharacterModal } from '@/app/admin/ai-assistants/components/create-character-modal';
import { AICharacter } from '@/types/ai-hub.types';

interface ChatHeaderProps {
  /** Whether the header is in dark mode */
  isDarkMode: boolean;
  /** Array of currently selected AI IDs */
  selectedAIs: string[];
  /** Maximum number of avatars to show */
  maxAvatars: number;
  /** Whether device is mobile */
  isMobile: boolean;
  /** Function to get AI by ID */
  getAIById: (id: string) => AICharacter | undefined;
  /** Single chat service for assistant info */
  singleChatService: {
    getAssistantAvatar: () => string;
    getAssistantName: () => string;
  };
  /** Function to get chat title */
  getChatTitle: () => string;
  /** Function to get chat subtitle */
  getChatSubtitle: () => string;
  /** Current chat object */
  currentChat: any;
  /** Function to handle new chat */
  onNewChat: () => void;
  /** Current session object */
  currentSession: any;
  /** Auto interaction active state */
  autoInteractionActive: boolean;
  /** Current timeout seconds for auto interaction */
  currentTimeoutSeconds: number;
  /** Function to toggle auto interaction */
  onToggleAutoInteraction: () => void;
  /** Array of all AI assistants */
  aiAssistants: AICharacter[];
  /** Function to toggle AI selection */
  onToggleAI: (aiId: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isDarkMode,
  selectedAIs,
  maxAvatars,
  isMobile,
  getAIById,
  singleChatService,
  getChatTitle,
  getChatSubtitle,
  currentChat,
  onNewChat,
  currentSession,
  autoInteractionActive,
  currentTimeoutSeconds,
  onToggleAutoInteraction,
  aiAssistants,
  onToggleAI
}) => {
  const [showCreateCharacterModal, setShowCreateCharacterModal] = useState(false);

  const handleCreateCharacterSuccess = () => {
    // Refresh the page or update the AI list
    window.location.reload();
  };
  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-2 sm:px-4 py-2 sm:py-4 h-12 sm:h-16 flex items-center justify-between`}>
      <div className="flex items-center">
        <div className="flex items-center min-w-0 flex-1">
          <div className="flex -space-x-2 sm:-space-x-3 mr-2 sm:mr-4 flex-shrink-0">
            {selectedAIs.length === 0 ? (
              // Single chat mode - show assistant avatar
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <OptimizedAvatarEnhanced
                        src={singleChatService.getAssistantAvatar()}
                        alt={singleChatService.getAssistantName()}
                        size={isMobile ? 32 : 48}
                        className={`border-2 shadow-lg ${isDarkMode ? 'border-gray-700' : 'border-white'}`}
                        fallbackText="EA"
                        priority={true}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{singleChatService.getAssistantName()} - Hani Assistant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              // Group chat mode - show selected AIs
              <>
                {selectedAIs.slice(0, maxAvatars).map((aiId) => {
                  const ai = getAIById(aiId);
                  const avatarSize = isMobile ? 32 : 48; // Use mobile hook for consistency
                  return (
                    <TooltipProvider key={aiId}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <OptimizedAvatarEnhanced
                              src={ai?.avatar}
                              alt={ai?.name || 'AI Avatar'}
                              size={avatarSize}
                              className={`border-2 shadow-lg ${isDarkMode ? 'border-gray-700' : 'border-white'}`}
                              fallbackText={ai?.name?.substring(0, 2) || 'AI'}
                              priority={true} // High priority for main header avatars
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ai?.name} - {ai?.role}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                {selectedAIs.length > maxAvatars && (
                  <div 
                    className={`border-2 rounded-full flex items-center justify-center shadow-lg ${
                      isDarkMode ? 'border-gray-700 bg-gray-600' : 'border-white bg-gray-200'
                    }`}
                    style={{ 
                      width: isMobile ? 32 : 48, 
                      height: isMobile ? 32 : 48 
                    }}
                  >
                    <span className="text-xs font-medium">+{selectedAIs.length - maxAvatars}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-1">
                {getChatTitle()}
              </h2>
              {currentChat && (
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-600 dark:text-green-400">History</span>
                </div>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
              {getChatSubtitle()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
        {/* New Chat Button - Always visible and responsive */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onNewChat}
          className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white rounded-full h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center touch-target whitespace-nowrap cursor-pointer"
          title={currentChat ? "Create New Chat" : "Start New Chat"}
        >
          <i className="fas fa-plus mr-0 sm:mr-1 text-xs sm:text-sm"></i>
          <span className="hidden sm:inline">
            {currentChat ? "New Chat" : "New Chat"}
          </span>
        </Button>
        
        {/* Auto-interaction Toggle - Only show when session exists */}
        {currentSession && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleAutoInteraction}
                  className={`touch-target rounded-full whitespace-nowrap cursor-pointer transition-colors duration-200 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                    autoInteractionActive
                      ? (isDarkMode ? 'bg-green-700 border-green-600 hover:bg-green-600' : 'bg-green-100 border-green-300 hover:bg-green-200')
                      : (isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50')
                  }`}
                  title={autoInteractionActive ? "Turn Off Auto Interaction" : "Turn On Auto Interaction"}
                >
                  <i className={`fas ${autoInteractionActive ? 'fa-robot' : 'fa-pause'} mr-1 text-xs sm:text-sm`}></i>
                  <span className="hidden md:inline">
                    {autoInteractionActive ? "Auto ON" : "Auto OFF"}
                  </span>
                  <span className="md:hidden">
                    {autoInteractionActive ? "ON" : "OFF"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {autoInteractionActive 
                    ? `Auto interaction is ON (${currentTimeoutSeconds} seconds)`
                    : "Enable automatic interaction between AI and questions for you"
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Add AI Button - Create New Character */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowCreateCharacterModal(true)}
          className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/80 hover:to-purist-blue/80 text-white rounded-full h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center touch-target whitespace-nowrap cursor-pointer"
          title="Create New AI Character"
        >
          <i className="fas fa-user-plus mr-0 sm:mr-1 text-xs sm:text-sm"></i>
          <span className="hidden sm:inline">New AI</span>
        </Button>
        
        {/* More options button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="touch-target rounded-full whitespace-nowrap cursor-pointer h-8 w-8 sm:h-9 sm:w-9"
          title="More Options"
        >
          <i className="fas fa-ellipsis-v text-sm"></i>
        </Button>
      </div>

      {/* Create Character Modal */}
      <CreateCharacterModal
        open={showCreateCharacterModal}
        onOpenChange={setShowCreateCharacterModal}
        onSuccess={handleCreateCharacterSuccess}
      />
    </div>
  );
};
