"use client"

import React from 'react';
import { Sidebar } from '@/components/ai-hub/sidebar/Sidebar';
import { AICharacter } from '@/types/ai-hub.types';

interface SidebarManagerProps {
  /** Whether mobile sidebar is open */
  isSidebarOpen: boolean;
  /** Function to close mobile sidebar */
  onCloseMobileSidebar: () => void;
  /** Whether desktop sidebar is collapsed */
  isDesktopSidebarCollapsed: boolean;
  /** Function to handle left sidebar hover enter */
  onLeftSidebarHoverEnter: () => void;
  /** Function to handle left sidebar hover leave */
  onLeftSidebarHoverLeave: () => void;
  /** Selected AI IDs */
  selectedAIs: string[];
  /** Function to toggle AI selection */
  onToggleAI: (aiId: string) => void;
  /** Active filter */
  activeFilter: string;
  /** Function to change filter */
  onFilterChange: (filter: string) => void;
  /** Whether dark mode is enabled */
  isDarkMode: boolean;
  /** Function to toggle dark mode */
  onToggleDarkMode: () => void;
  /** Function to handle chat selection */
  onChatSelect: (chatId: string) => void;
  /** Current chat ID */
  currentChatId: string | null;
  /** AI characters array */
  aiCharacters: AICharacter[];
  /** Function to toggle desktop sidebar collapse */
  onDesktopSidebarToggle: () => void;
}

export const SidebarManager: React.FC<SidebarManagerProps> = ({
  isSidebarOpen,
  onCloseMobileSidebar,
  isDesktopSidebarCollapsed,
  onLeftSidebarHoverEnter,
  onLeftSidebarHoverLeave,
  selectedAIs,
  onToggleAI,
  activeFilter,
  onFilterChange,
  isDarkMode,
  onToggleDarkMode,
  onChatSelect,
  currentChatId,
  aiCharacters,
  onDesktopSidebarToggle
}) => {
  return (
    <>
      {/* Sidebar dạng trượt cho mobile/tablet */}
      <div className={`lg:hidden fixed inset-0 z-[70] ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Overlay mờ */}
        <div 
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onCloseMobileSidebar}
        />
        {/* Sidebar trượt */}
        <div className={`absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar
            isOpen={true}
            onToggle={onCloseMobileSidebar}
            selectedAIs={selectedAIs}
            onToggleAI={onToggleAI}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            darkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            onChatSelect={onChatSelect}
            currentChatId={currentChatId}
            aiCharacters={aiCharacters}
          />
        </div>
      </div>

      {/* Sidebar cố định cho desktop */}
      <div className="relative hidden lg:block flex-shrink-0 h-full">
        {/* Hover trigger zone when sidebar is collapsed */}
        {isDesktopSidebarCollapsed && (
          <div
            className="absolute left-0 top-0 w-6 h-full z-10 bg-transparent hover:bg-blue-500/5 transition-all duration-200 border-r-2 border-transparent hover:border-blue-500/20 cursor-pointer group"
            onMouseEnter={onLeftSidebarHoverEnter}
            title="Hover để mở rộng sidebar"
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <i className="fas fa-chevron-right text-blue-500 text-xs animate-pulse"></i>
            </div>
          </div>
        )}
        
        <div 
          className={`transition-all duration-300 ease-in-out ${isDesktopSidebarCollapsed ? 'w-0' : 'w-80'} h-full`}
          onMouseEnter={onLeftSidebarHoverEnter}
          onMouseLeave={onLeftSidebarHoverLeave}
        >
          <Sidebar
            isOpen={true}
            onToggle={onDesktopSidebarToggle}
            selectedAIs={selectedAIs}
            onToggleAI={onToggleAI}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            darkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            collapsed={isDesktopSidebarCollapsed}
            onCollapseToggle={onDesktopSidebarToggle}
            onChatSelect={onChatSelect}
            currentChatId={currentChatId}
            aiCharacters={aiCharacters}
          />
        </div>
      </div>
    </>
  );
};
