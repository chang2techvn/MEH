import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Message, AICharacter } from '@/types/ai-hub.types';
import { formatTime, highlightText } from '@/lib/utils/format';
import { useAuthState } from '@/contexts/auth-context';

// Optimized Avatar Component for Messages with next/image
const OptimizedMessageAvatar = ({ 
  src, 
  alt, 
  size = 48, 
  className = "",
  fallbackText,
  darkMode = false,
  ...props 
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackText: string;
  darkMode?: boolean;
  [key: string]: any;
}) => {
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div 
        className={`relative overflow-hidden rounded-full flex items-center justify-center animate-pulse bg-orange-100 border-2 ${darkMode ? 'border-gray-700' : 'border-white'} shadow-md ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <span 
          className="text-orange-800 font-medium select-none" 
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackText}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      className={`relative overflow-hidden rounded-full flex items-center justify-center bg-orange-100 border-2 ${darkMode ? 'border-gray-700' : 'border-white'} shadow-md ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          width={size * 2} // 2x resolution for retina displays
          height={size * 2}
          quality={100} // Maximum quality
          priority={size >= 40} // Priority for larger avatars in chat
          className="object-cover rounded-full transition-all duration-300"
          style={{ 
            width: size, 
            height: size,
            imageRendering: 'crisp-edges' // Ensures sharp rendering
          }}
          onError={() => setImageError(true)}
          sizes={`${size}px`}
          // Add loading optimization
          loading={size >= 40 ? 'eager' : 'lazy'}
          // Prevent drag
          draggable={false}
        />
      ) : (
        <span 
          className="text-orange-800 font-medium select-none" 
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackText}
        </span>
      )}
    </div>
  );
};

interface MessageItemProps {
  message: Message;
  ai?: AICharacter;
  darkMode: boolean;
  onReply?: (messageId: string, aiId: string, aiName: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, ai, darkMode, onReply }) => {
  const isUser = message.sender === 'user';
  const { user: currentUser } = useAuthState();
  const [avatarSize, setAvatarSize] = useState(48);

  // Handle responsive avatar sizing
  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setAvatarSize(32);
        } else if (window.innerWidth < 1024) {
          setAvatarSize(40);
        } else {
          setAvatarSize(48);
        }
      }
    };

    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-slide-in px-1 sm:px-3 group mb-3 sm:mb-6`}
      data-message-id={message.id}
    >
      {!isUser && ai && (
        <div className="mr-1 sm:mr-3 flex-shrink-0">
          <OptimizedMessageAvatar
            src={ai.avatar}
            alt={ai.name}
            size={avatarSize} // Use responsive state
            fallbackText={ai.name?.substring(0, 2) || 'AI'}
            darkMode={darkMode}
          />
        </div>
      )}
      <div className={`${isUser ? 'max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%]' : 'min-w-0 flex-1 max-w-[85%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%]'}`}>
        {!isUser && ai && (
          <div className="flex items-center mb-1 sm:mb-2 gap-2 min-w-0">
            <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{ai.name}</span>
            <Badge 
              variant="outline" 
              className={`text-[7px] h-5 px-2 py-0 max-w-[80px] sm:max-w-[120px] truncate leading-none flex-shrink-0 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50'}`}
              title={ai.field} // Show full text on hover
            >
              {ai.field}
            </Badge>
          </div>
        )}
        <div
          className={`rounded-2xl p-2 sm:p-3 shadow-md min-h-fit ${
            isUser 
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white inline-block w-fit max-w-full'
              : 'bg-gray-700 border border-gray-600 dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-200 min-w-0 max-w-full overflow-hidden'
          }`}
        >
          {message.type === 'text' && (
            <div>
              {isUser ? (
                <div className="text-sm sm:text-base break-words leading-relaxed">{message.content}</div>
              ) : (
                <div className="w-full min-w-0 overflow-hidden">
                  <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none w-full break-words overflow-wrap-anywhere">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom styling for markdown elements with mobile-first responsive design
                        strong: ({ children }) => (
                          <strong className="text-orange-600 dark:text-orange-400 font-semibold break-words word-break-break-word">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="text-blue-600 dark:text-blue-400 break-words word-break-break-word">
                            {children}
                          </em>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400 px-1 sm:px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono break-all word-break-break-all overflow-wrap-anywhere">
                            {children}
                          </code>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 sm:mb-3 leading-relaxed text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words word-break-break-word overflow-wrap-anywhere">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside space-y-1 sm:space-y-2 ml-2 sm:ml-3 my-2 sm:my-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-normal break-words overflow-hidden">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside space-y-1 sm:space-y-2 ml-2 sm:ml-3 my-2 sm:my-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-normal break-words overflow-hidden">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="leading-normal mb-1 pl-1 sm:pl-2 break-words word-break-break-word overflow-wrap-anywhere">
                            {children}
                          </li>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2 sm:mt-3 mb-1 sm:mb-2 break-words leading-tight">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-orange-600 dark:text-orange-400 mt-2 sm:mt-3 mb-1 sm:mb-2 break-words leading-tight">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm sm:text-base md:text-lg font-medium text-orange-600 dark:text-orange-400 mt-1 sm:mt-2 mb-1 break-words leading-snug">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-sm sm:text-base font-medium text-orange-600 dark:text-orange-400 mt-1 sm:mt-2 mb-1 break-words leading-normal">
                            {children}
                          </h4>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 sm:border-l-4 border-orange-300 dark:border-orange-600 pl-2 sm:pl-4 py-1 sm:py-2 bg-orange-50 dark:bg-orange-900/20 italic text-gray-700 dark:text-gray-300 my-1 sm:my-2 text-sm sm:text-base leading-relaxed break-words">
                            {children}
                          </blockquote>
                        ),
                        // Add table support with mobile-first responsive styling
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2 sm:my-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm max-w-full">
                            <table className="min-w-full border-collapse text-xs sm:text-sm table-fixed w-full">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-orange-50 dark:bg-orange-900/30">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-1 sm:px-2 py-1 sm:py-2 text-left font-semibold text-orange-600 dark:text-orange-400 text-xs sm:text-sm break-words word-break-break-word overflow-wrap-anywhere">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-1 sm:px-2 py-1 sm:py-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-normal break-words word-break-break-word overflow-wrap-anywhere">
                            {children}
                          </td>
                        ),
                        // Improved link support with professional styling
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 break-all cursor-pointer transition-all duration-200 hover:decoration-blue-600 dark:hover:decoration-blue-400 text-sm sm:text-base"
                          >
                            {children}
                          </a>
                        ),
                        // Add strikethrough support (from remark-gfm)
                        del: ({ children }) => (
                          <del className="text-gray-500 dark:text-gray-400 line-through text-sm sm:text-base break-words">
                            {children}
                          </del>
                        ),
                        // Add task list support (from remark-gfm)
                        input: ({ checked, ...props }) => (
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled
                            className="mr-2 accent-orange-500"
                            {...props}
                          />
                        ),
                        // Enhanced code block support with professional styling
                        pre: ({ children }) => (
                          <pre className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 sm:p-4 rounded-lg overflow-x-auto my-2 sm:my-5 text-xs sm:text-sm font-mono leading-relaxed shadow-sm break-words">
                            {children}
                          </pre>
                        ),
                        // Add horizontal rule support
                        hr: () => (
                          <hr className="border-0 border-t border-gray-300 dark:border-gray-600 my-8" />
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.vocabulary && message.vocabulary.length > 0 && (
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
        
        {/* Message Footer with timestamp and actions */}
        <div className={`flex items-center justify-between mt-1 sm:mt-2`}>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {formatTime(message.timestamp)}
            {message.isReplyMode && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                Phản hồi
              </span>
            )}
          </div>
          
          {/* Reply button for AI messages */}
          {!isUser && onReply && ai && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(message.id, ai.id, ai.name)}
              className={`text-xs px-2 py-1 h-6 transition-opacity opacity-0 group-hover:opacity-100 ${
                darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              title={`Phản hồi ${ai.name}`}
            >
              <i className="fas fa-reply text-xs mr-1"></i>
              Phản hồi
            </Button>
          )}
        </div>
      </div>
      {isUser && (
        <div className="ml-1 sm:ml-3 flex-shrink-0">
          <OptimizedMessageAvatar
            src={currentUser?.avatar || "/placeholder-user.jpg"}
            alt={currentUser?.name || "User avatar"}
            size={avatarSize} // Use responsive state
            fallbackText={currentUser?.name?.substring(0, 2)?.toUpperCase() || "ND"}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
};
