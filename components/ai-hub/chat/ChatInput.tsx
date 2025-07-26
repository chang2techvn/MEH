import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { emojis } from '@/lib/ai-hub-data';

interface ChatInputProps {
  onSendMessage: (content: string, mediaUrl?: string | null, mediaType?: string | null) => void;
  darkMode: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  darkMode, 
  disabled = false,
  placeholder = "Nhập tin nhắn của bạn..."
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '' && !mediaPreview) return;
    if (disabled) return;
    
    onSendMessage(inputMessage, mediaPreview, mediaType);
    setInputMessage('');
    setMediaPreview(null);
    setMediaType(null);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) {
        handleSendMessage();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      if (event.target?.result) {
        setMediaPreview(event.target.result as string);
        if (file.type.startsWith('image/')) {
          setMediaType('image');
        } else if (file.type.startsWith('video/')) {
          setMediaType('video');
        } else if (file.type.startsWith('audio/')) {
          setMediaType('audio');
        }
      }
    };
    fileReader.readAsDataURL(file);
  };

  const handleMediaButtonClick = () => {
    fileInputRef.current?.click();
  };

  const addEmoji = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg safe-area-bottom`}>
      {/* Media Preview */}
      {mediaPreview && (
        <div className={`p-3 sm:p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-b rounded-lg mx-3 sm:mx-4 mt-3 sm:mt-4`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-sm font-medium">Đính kèm phương tiện</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMediaPreview(null);
                setMediaType(null);
              }}
              className="touch-target !rounded-button whitespace-nowrap cursor-pointer h-8 w-8"
            >
              <i className="fas fa-times text-sm"></i>
            </Button>
          </div>
          <div className="flex justify-center">
            {mediaType === 'image' && (
              <img
                src={mediaPreview}
                alt="Preview"
                className="h-32 sm:h-40 rounded-lg object-cover shadow-md max-w-full"
              />
            )}
            {mediaType === 'video' && (
              <video
                src={mediaPreview}
                className="h-32 sm:h-40 rounded-lg object-cover shadow-md max-w-full"
                controls
              />
            )}
            {mediaType === 'audio' && (
              <audio
                src={mediaPreview}
                className="w-full max-w-xs"
                controls
              />
            )}
          </div>
        </div>
      )}
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className={`p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-2 animate-fadeIn mx-3 sm:mx-4 mt-3 sm:mt-4 rounded-lg max-h-40 overflow-y-auto scrollbar-auto-hide`}>
          {emojis.map((emoji, index) => (
            <button 
              key={index} 
              onClick={() => addEmoji(emoji)}
              className={`text-lg sm:text-xl p-2 rounded-lg touch-target ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200 cursor-pointer flex items-center justify-center`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      
      {/* Main Input Area */}
      <div className="p-4 space-y-4">
        <div className="flex items-end gap-3">
          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,audio/*"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMediaButtonClick}
              className={`h-10 w-10 rounded-full transition-all duration-200 ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-orange-400' 
                  : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'
              }`}
            >
              <i className="fas fa-paperclip"></i>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-full transition-all duration-200 ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-orange-400' 
                  : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'
              }`}
            >
              <i className="fas fa-microphone"></i>
            </Button>
          </div>
          
          {/* Text Input */}
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className={`pr-20 text-base min-h-[48px] rounded-2xl border-2 transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white'
              }`}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {/* Send Button - di chuyển vào trong input, hiển thị trước */}
              {(inputMessage.trim() || mediaPreview) && (
                <Button
                  onClick={handleSendMessage}
                  disabled={disabled}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full transition-all duration-200 text-orange-500 hover:text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-paper-plane text-sm"></i>
                </Button>
              )}
              
              {/* Emoji Button - di chuyển vào trong input, hiển thị sau */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`h-8 w-8 rounded-full transition-all duration-200 ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-orange-400' 
                    : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'
                }`}
              >
                <i className="fas fa-smile text-sm"></i>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2 text-sm">
            <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <i className="fas fa-info-circle text-orange-500"></i>
              <span className="hidden sm:inline">Chat with AI to improve your English</span>
              <span className="sm:hidden">Chat with AI to learn English</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
