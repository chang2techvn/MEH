import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Message, AICharacter } from '@/types/ai-hub.types';
import { formatTime, highlightText } from '@/lib/utils/format';

interface MessageItemProps {
  message: Message;
  ai?: AICharacter;
  darkMode: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, ai, darkMode }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn px-2 sm:px-0`}>
      {!isUser && ai && (
        <div className="mr-2 sm:mr-3 flex-shrink-0">
          <Avatar className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 shadow-md border-2 ${darkMode ? 'border-gray-700' : 'border-white'}`}>
            <AvatarImage src={ai.avatar} alt={ai.name} className="object-cover" />
            <AvatarFallback className="bg-orange-100 text-orange-800 text-xs sm:text-sm">
              {ai.name?.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
        {!isUser && ai && (
          <div className="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-2 space-y-1 sm:space-y-0">
            <div className="flex items-center flex-wrap gap-1 sm:gap-2">
              <span className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{ai.name}</span>
              <Badge variant="outline" className={`text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50'}`}>
                {ai.field}
              </Badge>
            </div>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} sm:ml-2`}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
        <div
          className={`rounded-2xl p-3 sm:p-4 shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : (darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200')
          } transform transition-transform duration-300 hover:scale-[1.01]`}
        >
          {message.type === 'text' && (
            <div>
              {isUser ? (
                <div className="text-sm sm:text-base break-words">{message.content}</div>
              ) : (
                <div>
                  <div 
                    className="text-sm sm:text-base break-words"
                    dangerouslySetInnerHTML={{ __html: highlightText(message.content, message.highlights) }} 
                  />
                  {message.vocabulary && (
                    <div className={`mt-3 sm:mt-4 p-3 sm:p-4 ${darkMode ? 'bg-gradient-to-r from-orange-900/30 to-orange-900/30 border border-orange-800' : 'bg-gradient-to-r from-orange-50 to-orange-50 border border-orange-100'} rounded-xl`}>
                      <div className="flex items-center mb-2 sm:mb-3">
                        <i className="fas fa-book-open text-orange-600 mr-2 text-sm sm:text-base"></i>
                        <div className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-orange-400' : 'text-orange-800'}`}>Từ vựng mới</div>
                      </div>
                      {message.vocabulary.map((word, index) => (
                        <div key={index} className={`${index > 0 ? `mt-2 sm:mt-3 pt-2 sm:pt-3 border-t ${darkMode ? 'border-green-800/50' : 'border-green-100'}` : ''}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className={`font-medium text-sm sm:text-base ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>{word.term}</span>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} font-mono text-xs sm:text-sm`}>[{word.pronunciation}]</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const audio = new Audio(word.audioUrl);
                                      audio.play();
                                    }}
                                    className={`touch-target h-6 w-6 sm:h-7 sm:w-7 !rounded-full ${darkMode ? 'hover:bg-orange-800/50' : 'hover:bg-orange-100'}`}
                                  >
                                    <i className="fas fa-volume-up text-orange-600 text-xs sm:text-sm"></i>
                                  </Button>
                                </div>
                              </div>
                              <div className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm`}>
                                <i className="fas fa-arrow-right text-xs text-orange-500 mr-1 sm:mr-2"></i>
                                {word.meaning}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className={`mt-2 sm:mt-3 pt-2 sm:pt-3 border-t ${darkMode ? 'border-orange-800/50' : 'border-orange-100'} flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2`}>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                          <span className="hidden sm:inline">Nhấn vào icon</span>
                          <span className="sm:hidden">Nhấn</span>
                          <i className="fas fa-volume-up text-orange-600 mx-1"></i> 
                          <span className="hidden sm:inline">để nghe phát âm</span>
                          <span className="sm:hidden">nghe phát âm</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`text-xs ${darkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'} !rounded-button whitespace-nowrap touch-target`}
                        >
                          <i className="fas fa-plus mr-1"></i>
                          <span className="hidden sm:inline">Thêm vào sổ tay</span>
                          <span className="sm:hidden">Lưu</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {message.type === 'image' && (
            <img
              src={message.mediaUrl || ''}
              alt="Shared image"
              className="rounded-lg max-w-full h-auto max-h-64 sm:max-h-80 object-cover"
            />
          )}
          {message.type === 'video' && (
            <video
              src={message.mediaUrl || ''}
              controls
              className="rounded-lg max-w-full h-auto max-h-64 sm:max-h-80"
            />
          )}
          {message.type === 'audio' && (
            <audio
              src={message.mediaUrl || ''}
              controls
              className="w-full max-w-xs sm:max-w-sm"
            />
          )}
        </div>
        {isUser && (
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1 sm:mt-2 text-right`}>
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
      {isUser && (
        <div className="ml-2 sm:ml-3 flex-shrink-0">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 shadow-md border-2 border-white">
            <AvatarImage src="https://readdy.ai/api/search-image?query=A%20professional%20young%20Vietnamese%20person%20with%20a%20friendly%20smile%2C%20wearing%20smart%20casual%20attire%2C%20against%20a%20clean%20light%20blue%20background%2C%20photorealistic%20portrait%2C%20high%20quality%2C%20professional%20lighting&width=100&height=100&seq=user&orientation=squarish" />
            <AvatarFallback className="bg-orange-100 text-orange-800 text-xs sm:text-sm">ND</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};
