import React, { useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatHistory, AICharacter } from '@/types/ai-hub.types';
import { formatDate } from '@/lib/utils/format';

interface ChatHistoryItemProps {
  chat: ChatHistory;
  aiCharacters: AICharacter[];
  darkMode: boolean;
  onChatSelect?: (chatId: string) => void;
  isActive?: boolean;
}

export const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({ 
  chat, 
  aiCharacters, 
  darkMode, 
  onChatSelect,
  isActive = false 
}) => {
  const getAIById = (id: string) => aiCharacters.find(ai => ai.id === id);
  const mainAI = getAIById(chat.participants[0]);

  const handleClick = useCallback(() => {
    if (onChatSelect) {
      onChatSelect(chat.id);
    }
  }, [onChatSelect, chat.id]);

  return (
    <div
      onClick={handleClick}
      className={`relative p-3 rounded-xl cursor-pointer transition-all duration-150 ease-out min-h-[72px] flex items-center ${
        isActive 
          ? (darkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200')
          : (darkMode ? 'hover:bg-gray-700 border border-transparent' : 'hover:bg-gray-100 border border-transparent')
      }`}
      style={{
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'background-color, border-color'
      }}
    >
      <div className="flex items-center gap-3 w-full">
        {/* Avatar AI chính */}
        <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-800 shadow-sm flex-shrink-0">
          <AvatarImage src={mainAI?.avatar} alt={mainAI?.name} />
          <AvatarFallback className="bg-blue-100 text-blue-800 text-sm">
            {mainAI?.name?.substring(0, 2) || '?'}
          </AvatarFallback>
        </Avatar>
        
        {/* Nội dung chat */}
        <div className="flex-1 min-w-0 py-1">
          {/* Dòng 1: Tiêu đề và thời gian */}
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium text-sm line-clamp-1 flex-1 mr-2 ${
              isActive ? (darkMode ? 'text-blue-400' : 'text-blue-700') : ''
            }`}>
              {chat.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
              isActive 
                ? (darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-700')
                : (darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100')
            }`}>
              {formatDate(chat.timestamp)}
            </span>
          </div>
          
          {/* Dòng 2: Avatar phụ + tin nhắn cuối */}
          <div className="flex items-center gap-2">
            {/* Avatar phụ (nếu có nhiều AI) */}
            {chat.participants.length > 1 && (
              <div className="flex -space-x-1 flex-shrink-0">
                {chat.participants.slice(1, 3).map((aiId) => {
                  const ai = getAIById(aiId);
                  return (
                    <Avatar key={aiId} className="w-5 h-5 border border-white dark:border-gray-800 shadow-sm">
                      <AvatarImage src={ai?.avatar} alt={ai?.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                        {ai?.name?.substring(0, 1) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {chat.participants.length > 3 && (
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center border border-white dark:border-gray-800">
                    <span className="text-xs text-gray-600 dark:text-gray-300">+{chat.participants.length - 3}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Tin nhắn cuối */}
            <p className={`text-xs line-clamp-1 flex-1 ${
              isActive 
                ? (darkMode ? 'text-blue-300' : 'text-blue-600')
                : (darkMode ? 'text-gray-400' : 'text-gray-600')
            }`} title={chat.lastMessage}>
              {chat.lastMessage}
            </p>
          </div>
        </div>
      </div>
      
      {/* Active indicator */}
      <div className={`absolute left-0 top-4 w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full transition-opacity duration-150 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  );
};
