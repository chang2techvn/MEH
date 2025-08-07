"use client"

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

interface MobileChatInputProps {
  /** Input message value */
  inputMessage: string;
  /** Function to handle input change */
  onInputChange: (value: string) => void;
  /** Function to handle send message */
  onSendMessage: (content: string) => void;
  /** Whether input is disabled */
  disabled: boolean;
  /** Input placeholder text */
  placeholder: string;
  /** Reply mode information */
  replyMode?: {
    isActive: boolean;
    aiName: string;
  } | null;
  /** Ref to expose input element */
  ref?: React.RefObject<HTMLInputElement>;
}

export const MobileChatInput = React.forwardRef<HTMLInputElement, MobileChatInputProps>(({
  inputMessage,
  onInputChange,
  onSendMessage,
  disabled,
  placeholder,
  replyMode
}, forwardedRef) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboard = useKeyboardHeight();
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Merge refs
  const mergedRef = forwardedRef || inputRef;

  // Debug keyboard state - only log on changes
  useEffect(() => {
    if (keyboard.isVisible) {
      console.log('🎹 Keyboard opened - Input position:', getBottomPosition());
    } else {
      console.log('🎹 Keyboard closed - Input position:', getBottomPosition());
    }
  }, [keyboard.isVisible]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && inputMessage.trim()) {
        onSendMessage(inputMessage);
      }
    }
  };

  const handleSendClick = () => {
    if (!disabled && inputMessage.trim()) {
      onSendMessage(inputMessage);
    }
  };

  // Handle input focus - scroll into view when keyboard appears
  const handleFocus = () => {
    setIsInputFocused(true);
    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
      const currentRef = (mergedRef as React.RefObject<HTMLInputElement>)?.current;
      if (currentRef) {
        currentRef.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    });
  };

  // Handle input blur
  const handleBlur = () => {
    setIsInputFocused(false);
  };

  // Calculate dynamic bottom position and visibility
  const getBottomPosition = () => {
    if (!keyboard.isVisible && !isInputFocused) {
      return 85; // Default 85px from bottom (above navigation)
    }
    
    // When keyboard is visible or input is focused, position just above the keyboard
    return 25; // Fixed 25px above keyboard when visible
  };

  // Determine if input should be visible
  const shouldShowInput = () => {
    // Always show on desktop (lg:hidden handles this)
    // On mobile: show when keyboard is visible OR input is focused
    return keyboard.isVisible || isInputFocused;
  };

  return (
    <div 
      className="lg:hidden fixed left-0 right-0 z-50 mx-4"
      style={{
        bottom: `${getBottomPosition()}px`,
        transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth transition
        willChange: 'transform, bottom', // Optimize for animations
        opacity: shouldShowInput() ? 1 : 0,
        transform: shouldShowInput() ? 'translateY(0)' : 'translateY(10px)',
        pointerEvents: shouldShowInput() ? 'auto' : 'none',
      }}
    >
      <div className="relative">
        <Input
          ref={mergedRef}
          value={inputMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={
            replyMode?.isActive 
              ? `Reply to ${replyMode.aiName}...` 
              : placeholder
          }
          disabled={disabled}
          style={{ fontSize: '16px' }} // Prevent zoom on mobile
          className={`
            w-full h-10 pl-10 pr-16 text-sm lg:text-sm rounded-full
            backdrop-blur-xl bg-white/5 dark:bg-black/5
            border border-white/15 dark:border-white/8
            shadow-2xl shadow-black/10 dark:shadow-black/30
            text-gray-900 dark:text-white
            placeholder:text-gray-700/90 dark:placeholder:text-gray-200/80
            focus:bg-white/8 dark:focus:bg-black/8
            focus:border-white/25 dark:focus:border-white/15
            focus:ring-1 focus:ring-orange-400/40
            transition-all duration-300 ease-out
            hover:bg-white/6 dark:hover:bg-black/6
            hover:border-white/20 dark:hover:border-white/12
            [font-size:16px] lg:[font-size:0.875rem]
          `}
        />
        
        {/* Left buttons group */}
        <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2 flex items-center">
          {/* Attach Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full backdrop-blur-xl bg-white/5 dark:bg-white/3 hover:bg-white/12 dark:hover:bg-white/8 border border-white/15 dark:border-white/8 transition-all duration-200"
          >
            <i className="fas fa-paperclip text-xs text-gray-800 dark:text-gray-100"></i>
          </Button>
        </div>
        
        {/* Right buttons group */}
        <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Send Button - only show when there's text */}
          {inputMessage.trim() && (
            <Button
              onClick={handleSendClick}
              disabled={disabled}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full backdrop-blur-xl bg-orange-500/60 hover:bg-orange-500/70 text-white border border-orange-400/20 disabled:opacity-50 transition-all duration-200 shadow-lg"
            >
              <i className="fas fa-paper-plane text-xs"></i>
            </Button>
          )}
          
          {/* Voice Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full backdrop-blur-xl bg-white/5 dark:bg-white/3 hover:bg-white/12 dark:hover:bg-white/8 border border-white/15 dark:border-white/8 transition-all duration-200"
          >
            <i className="fas fa-microphone text-xs text-gray-800 dark:text-gray-100"></i>
          </Button>
        </div>
      </div>
    </div>
  );
});

MobileChatInput.displayName = 'MobileChatInput';
