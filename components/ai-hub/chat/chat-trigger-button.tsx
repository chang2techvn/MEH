"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Edit3 } from 'lucide-react';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

interface ChatTriggerButtonProps {
  onTriggerChat: () => void;
  className?: string;
}

export const ChatTriggerButton: React.FC<ChatTriggerButtonProps> = ({
  onTriggerChat,
  className = ""
}) => {
  const keyboard = useKeyboardHeight();
  const [isPressed, setIsPressed] = useState(false);

  // Hide trigger when keyboard is visible
  const shouldHide = keyboard.isVisible;

  const handleClick = () => {
    setIsPressed(true);
    onTriggerChat();
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div 
      className={`
        lg:hidden fixed right-4 z-40 transition-all duration-300 ease-out
        ${shouldHide ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100 translate-y-0'}
        ${className}
      `}
      style={{
        bottom: shouldHide ? '60px' : '95px', // Above bottom navigation
      }}
    >
      <Button
        onClick={handleClick}
        size="icon"
        className={`
          h-12 w-12 rounded-full shadow-lg
          bg-gradient-to-r from-blue-500 to-indigo-600 
          hover:from-blue-600 hover:to-indigo-700
          text-white border-0
          transition-all duration-200 ease-out
          ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
          backdrop-blur-xl
        `}
      >
        <Edit3 className="h-5 w-5" />
      </Button>
    </div>
  );
};
