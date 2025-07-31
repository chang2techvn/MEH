import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AICard } from './AICard';
import { ChatHistoryItem } from './ChatHistoryItem';
import { fields } from '@/lib/ai-hub-data';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { AICharacter } from '@/types/ai-hub.types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedAIs: string[];
  onToggleAI: (aiId: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  onChatSelect?: (chatId: string) => void;
  currentChatId?: string | null;
  aiCharacters?: AICharacter[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  selectedAIs,
  onToggleAI,
  activeFilter,
  onFilterChange,
  darkMode,
  onToggleDarkMode,
  collapsed,
  onCollapseToggle,
  onChatSelect,
  currentChatId,
  aiCharacters = []
}) => {
  const { sessions, loading: sessionsLoading, error: sessionsError } = useChatSessions();
  
  const filteredAIs = activeFilter === 'Tất cả'
    ? aiCharacters
    : aiCharacters.filter(ai => ai.field === activeFilter);

  const getAIById = (id: string) => {
    return aiCharacters.find(ai => ai.id === id);
  };

  return (
    <div className="relative h-full">
      <style jsx>{`
        .smooth-container {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        .chat-item {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          contain: layout style paint;
        }
      `}</style>
      {/* Sidebar Container */}
      <div
        className={`${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'} ${collapsed ? '' : 'border-r'} transition-all duration-300 ease-in-out flex flex-col h-full shadow-lg ${collapsed ? 'w-0' : 'w-full max-w-sm lg:max-w-none lg:w-80'} overflow-hidden`}
        style={{ minHeight: '100vh' }}
      >
        {/* Header */}
        <div className={`px-4 py-4 h-16 border-b ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/80'} backdrop-blur-sm flex items-center justify-center safe-area-top`}>
          {!collapsed && (
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-neo-mint to-purist-blue rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0">
                  <i className="fas fa-robot text-white text-lg"></i>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-vibrant-orange rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue line-clamp-1">
                  AI Learning Hub
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Powered by AI
                </p>
              </div>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <>
            {/* Search */}
            <div className="p-4">
              <div className="relative group">
                <Input
                  placeholder="Tìm kiếm AI..."
                  className={`pl-10 pr-4 text-sm placeholder:text-xs sm:placeholder:text-sm h-10 ${darkMode ? 'bg-gray-700/50 border-gray-600 focus:bg-gray-700' : 'bg-gray-50 border-gray-200 focus:bg-white'} transition-all duration-300 rounded-xl`}
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-neo-mint transition-colors duration-200 text-sm"></i>
              </div>
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="ai" className="flex-1 flex flex-col overflow-hidden">
              <div className={`px-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <TabsList className={`grid grid-cols-2 w-full h-11 p-1 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-xl`}>
                  <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint data-[state=active]:to-purist-blue data-[state=active]:text-white transition-all duration-300 rounded-lg text-sm font-medium">
                    <i className="fas fa-robot mr-2 text-sm"></i>
                    AI Assistants
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neo-mint data-[state=active]:to-purist-blue data-[state=active]:text-white transition-all duration-300 rounded-lg text-sm font-medium">
                    <i className="fas fa-history mr-2 text-sm"></i>
                    Lịch sử
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* AI Tab */}
              <TabsContent value="ai" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=inactive]:hidden">
                {/* Filter */}
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`w-full justify-between h-10 px-4 ${darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 text-gray-200' : 'bg-white border-gray-200 hover:bg-gray-50'} transition-all duration-200 rounded-xl group`}
                      >
                        <div className="flex items-center min-w-0">
                          <i className="fas fa-filter mr-3 text-neo-mint text-sm flex-shrink-0 group-hover:rotate-12 transition-transform duration-200"></i>
                          <span className="line-clamp-1 font-medium">{activeFilter}</span>
                        </div>
                        <i className="fas fa-chevron-down text-gray-400 text-xs flex-shrink-0 group-hover:text-neo-mint transition-colors duration-200"></i>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className={`w-[240px] ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-xl`}>
                      {fields.map((field) => (
                        <DropdownMenuItem
                          key={field}
                          onClick={() => onFilterChange(field)}
                          className={`cursor-pointer text-sm px-4 py-3 transition-all duration-200 rounded-lg mx-1 ${activeFilter === field 
                            ? (darkMode ? 'bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 text-neo-mint border-l-2 border-neo-mint' : 'bg-gradient-to-r from-neo-mint/10 to-purist-blue/10 text-purist-blue border-l-2 border-neo-mint') 
                            : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
                          }`}
                        >
                          <i className="fas fa-tag mr-3 text-xs opacity-60"></i>
                          {field}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* AI List */}
                <div className={`flex-1 overflow-y-auto scrollbar-auto-hide smooth-container`}
                  style={{
                    contain: 'layout style paint',
                    willChange: 'scroll-position'
                  }}
                >
                  <div className="pt-2 px-2 pb-12 space-y-1">
                    {filteredAIs.map((ai) => (
                      <div key={ai.id} className="chat-item">
                        <AICard
                          ai={ai}
                          isSelected={selectedAIs.includes(ai.id)}
                          onToggle={onToggleAI}
                          darkMode={darkMode}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* History Tab */}
              <TabsContent value="history" className="flex-1 overflow-hidden mt-0 pt-0 data-[state=inactive]:hidden">
                <div 
                  className="h-full overflow-y-auto scrollbar-auto-hide scroll-smooth smooth-container"
                  style={{
                    contain: 'strict',
                    willChange: 'scroll-position'
                  }}
                >
                  <div className="px-3 py-2 pb-12 space-y-0.5">
                    {sessionsLoading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                        <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Đang tải lịch sử...
                        </span>
                      </div>
                    )}
                    
                    {sessionsError && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Lỗi tải lịch sử: {sessionsError}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {!sessionsLoading && !sessionsError && sessions.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <i className="fas fa-comments text-gray-400 text-3xl mb-3"></i>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            Chưa có lịch sử trò chuyện
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Bắt đầu cuộc trò chuyện đầu tiên với AI
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {!sessionsLoading && !sessionsError && sessions.map((session) => (
                      <div key={session.id} className="chat-item">
                        <ChatHistoryItem
                          chat={session}
                          aiCharacters={aiCharacters}
                          darkMode={darkMode}
                          onChatSelect={onChatSelect}
                          isActive={currentChatId === session.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* User Profile Footer */}
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/80'} backdrop-blur-sm safe-area-bottom`}>
              <div className="flex items-center">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-neo-mint/30 shadow-lg flex-shrink-0 ring-2 ring-neo-mint/20 dark:ring-neo-mint/30">
                    <AvatarImage src="https://readdy.ai/api/search-image?query=A%20professional%20young%20Vietnamese%20person%20with%20a%20friendly%20smile%2C%20wearing%20smart%20casual%20attire%2C%20against%20a%20clean%20light%20blue%20background%2C%20photorealistic%20portrait%2C%20high%20quality%2C%20professional%20lighting&width=100&height=100&seq=user&orientation=squarish" />
                    <AvatarFallback className="bg-gradient-to-br from-neo-mint/20 to-purist-blue/20 text-purist-blue text-sm font-semibold">ND</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-vibrant-orange rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="font-semibold text-base line-clamp-1">Người Dùng</h3>
                  <p className="text-sm text-neo-mint flex items-center font-medium">
                    <span className="w-2 h-2 bg-vibrant-orange rounded-full mr-2 animate-pulse"></span>
                    Online
                  </p>
                </div>
                <div className="ml-auto flex gap-2 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onToggleDarkMode}
                    className={`h-9 w-9 rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-orange-400' : 'hover:bg-orange-50 text-gray-500 hover:text-orange-600'}`}
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    <i className={`fas fa-${darkMode ? 'sun' : 'moon'} text-sm`}></i>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-9 w-9 rounded-xl transition-all duration-200 ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
                    title="Settings"
                  >
                    <i className="fas fa-cog text-sm"></i>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toggle Button - Fixed at center */}
      {onCollapseToggle && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-[5] hidden lg:block pointer-events-none transition-all duration-300 ${collapsed ? '-right-8' : '-right-3'}`}>
          <div className="pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onCollapseToggle}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 shadow-lg transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-800/90 border-gray-600 hover:bg-gray-700 text-gray-300' 
                        : 'bg-white/90 border-gray-300 hover:bg-gray-50 text-gray-600'
                    } backdrop-blur-sm hover:border-orange-400 hover:text-orange-500`}
                  >
                    <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'} text-xs transition-transform duration-300`}></i>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{collapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
};
