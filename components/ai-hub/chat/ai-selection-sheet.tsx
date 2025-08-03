"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { OptimizedAvatarEnhanced } from '@/components/optimized/optimized-avatar-enhanced';
import { AICharacter } from '@/types/ai-hub.types';

interface AISelectionSheetProps {
  /** Whether the sheet is in dark mode */
  isDarkMode: boolean;
  /** Array of available AI assistants */
  aiAssistants: AICharacter[];
  /** Array of currently selected AI IDs */
  selectedAIs: string[];
  /** Function to toggle AI selection */
  onToggleAI: (aiId: string) => void;
  /** Trigger element for the sheet */
  children: React.ReactNode;
}

export const AISelectionSheet: React.FC<AISelectionSheetProps> = ({
  isDarkMode,
  aiAssistants,
  selectedAIs,
  onToggleAI,
  children
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="right"
        className={`w-full sm:max-w-md lg:max-w-lg ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'} border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <SheetHeader className="pb-4">
          <SheetTitle className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Thêm AI vào cuộc trò chuyện
          </SheetTitle>
          <SheetDescription className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chọn AI bạn muốn thêm vào cuộc trò chuyện hiện tại
          </SheetDescription>
        </SheetHeader>
        
        {/* AI Selection List */}
        <div className="mt-4 space-y-2 sm:space-y-3 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {aiAssistants.map((ai) => (
            <div
              key={ai.id}
              onClick={() => onToggleAI(ai.id)}
              className={`p-3 sm:p-4 rounded-xl flex items-center cursor-pointer transition-colors touch-target ${
                selectedAIs.includes(ai.id) 
                  ? (isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200') 
                  : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
            >
              <OptimizedAvatarEnhanced
                src={ai.avatar}
                alt={ai.name}
                size={48}
                className="border-2 border-gray-200 shadow-md flex-shrink-0"
                fallbackText={ai.name.substring(0, 2)}
              />
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base line-clamp-1">{ai.name}</h3>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
                  {ai.role}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    ai.online 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                      ai.online ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    {ai.online ? 'Online' : 'Offline'}
                  </span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {ai.field}
                  </span>
                </div>
              </div>
              {selectedAIs.includes(ai.id) && (
                <div className="flex-shrink-0 ml-2">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Footer with selected count */}
        <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Đã chọn {selectedAIs.length} AI
            </span>
            <Button
              onClick={() => {
                // Close sheet on mobile/tablet
                if (window.innerWidth < 1024) {
                  const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
                  closeButton?.click();
                }
              }}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white h-8 px-4 text-sm"
            >
              <i className="fas fa-check mr-2"></i>
              Hoàn thành
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
