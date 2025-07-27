'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import MainHeader from "@/components/ui/main-header";
import { MobileNavigation } from "@/components/home/mobile-navigation";
import { Sidebar } from '@/components/ai-hub/sidebar/Sidebar';
import { MessageItem } from '@/components/ai-hub/chat/MessageItem';
import { ChatInput } from '@/components/ai-hub/chat/ChatInput';
import { LearningStatsSidebar } from '@/components/ai-hub/learning-stats/LearningStatsSidebar';
import { useAIAssistants } from '@/hooks/use-ai-assistants';
import { useNaturalConversation } from '@/hooks/use-natural-conversation';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { useAuth } from '@/contexts/auth-context';
import { useMobile } from "@/hooks/use-mobile";

export default function ResourcesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile: đóng mặc định
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false); // desktop: thu nhỏ sidebar
  const [isStatsSidebarOpen, setIsStatsSidebarOpen] = useState(false);
  const [isStatsDesktopCollapsed, setIsStatsDesktopCollapsed] = useState(false); // desktop: thu nhỏ stats sidebar
  const [selectedAIs, setSelectedAIs] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [darkMode, setDarkMode] = useState(false);
  const [maxAvatars, setMaxAvatars] = useState(3);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();

  // Authentication check - MUST be called before any early returns
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Use real AI assistants from Supabase - MUST be called before any early returns
  const { aiAssistants, loading: aiLoading, error: aiError, getAIById } = useAIAssistants();
  
  // Use real chat sessions from Supabase
  const { sessions: chatSessions, loading: sessionsLoading } = useChatSessions();
  
  // Initialize selectedAIs with first 2 active AIs when data loads
  useEffect(() => {
    if (aiAssistants.length > 0 && selectedAIs.length === 0) {
      const defaultAIs = aiAssistants.slice(0, 2).map(ai => ai.id);
      setSelectedAIs(defaultAIs);
    }
  }, [aiAssistants, selectedAIs.length]);

  const selectedAIsStable = useMemo(() => selectedAIs, [selectedAIs]);
  const { 
    messages, 
    isProcessing, 
    isAutoInteracting,
    typingAIs,
    currentSession,
    error: conversationError,
    chatContainerRef, 
    sendNaturalMessage,
    replyToMessage,
    loadSession,
    clearSession,
    // Auto-interaction functions
    autoInteractionEnabled,
    autoInteractionActive,
    currentTimeoutSeconds,
    startAutoInteraction,
    stopAutoInteraction,
    toggleAutoInteraction,
    resetAutoInteraction
  } = useNaturalConversation(selectedAIsStable);

  // Wrapper function for ChatInput compatibility
  const handleSendMessage = (content: string, mediaUrl?: string | null, mediaType?: string | null) => {
    // For now, ignore media parameters as we focus on text chat
    sendNaturalMessage(content);
  };

  // Function to handle reply to specific AI message
  const handleReplyToMessage = (content: string, originalMessageId: string, targetAIId: string) => {
    return replyToMessage(content, originalMessageId, targetAIId);
  };

  // State for reply mode
  const [replyMode, setReplyMode] = useState<{
    isActive: boolean;
    messageId: string;
    aiId: string;
    aiName: string;
  } | null>(null);

  // Function to start reply mode
  const startReplyMode = (messageId: string, aiId: string, aiName: string) => {
    setReplyMode({
      isActive: true,
      messageId,
      aiId,
      aiName
    });
  };

  // Function to cancel reply mode
  const cancelReplyMode = () => {
    setReplyMode(null);
  };

  // Enhanced send message that handles reply mode
  const enhancedSendMessage = (content: string, mediaUrl?: string | null, mediaType?: string | null) => {
    if (replyMode?.isActive) {
      // Send as reply
      replyToMessage(content, replyMode.messageId, replyMode.aiId);
      setReplyMode(null); // Exit reply mode after sending
    } else {
      // Send as normal message
      sendNaturalMessage(content);
    }
  };

  // ALL OTHER useEffect HOOKS MUST BE HERE - before any early returns
  useEffect(() => {
    const handleResize = () => {
      setMaxAvatars(window.innerWidth < 640 ? 2 : 3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tự động thu hẹp right sidebar sau 5 giây khi load trang
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStatsDesktopCollapsed(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để sử dụng tính năng AI Hub</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  // Lấy thông tin chat hiện tại từ Supabase sessions
  const currentChat = currentChatId ? chatSessions.find(session => session.id === currentChatId) : null;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleStatsSidebar = () => {
    setIsStatsSidebarOpen(!isStatsSidebarOpen);
  };

  const toggleAISelection = (aiId: string) => {
    if (selectedAIs.includes(aiId)) {
      if (selectedAIs.length > 1) {
        setSelectedAIs(selectedAIs.filter(id => id !== aiId));
      }
    } else {
      setSelectedAIs([...selectedAIs, aiId]);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    setCurrentChatId(chatId);
    // Load session and messages from Supabase
    const session = chatSessions.find(s => s.id === chatId);
    if (session) {
      setSelectedAIs(session.participants);
      // Load the session with its messages
      await loadSession(chatId);
    }
    // Đóng sidebar trên mobile sau khi select
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    clearSession(); // Clear current session and messages
    // Keep current selected AIs instead of resetting
    // setSelectedAIs(['ai1', 'ai3']); // Remove this line
  };

  const getChatTitle = () => {
    if (currentChat) {
      return currentChat.title;
    }
    return `Cuộc trò chuyện với ${selectedAIs.length} AI`;
  };

  const getChatSubtitle = () => {
    if (currentChat) {
      const participantNames = currentChat.participants.map(id => getAIById(id)?.name).filter(Boolean);
      return participantNames.join(', ');
    }
    return selectedAIs.map(aiId => getAIById(aiId)?.name).join(', ');
  };

  // Helper function to find AI by name (since API returns AI name, not ID)
  const getAIByName = (name: string) => {
    return aiAssistants.find(ai => ai.name === name);
  };

  // Show loading state
  if (aiLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải AI assistants...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (aiError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Lỗi khi tải AI assistants: {aiError}</p>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Header */}
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Main Content Container with proper margins */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-none px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8 2xl:px-12 py-4 sm:py-6 lg:py-8">
          <div className={`flex h-[calc(100vh-120px)] overflow-hidden ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} rounded-xl shadow-sm`}>  
      {/* Sidebar dạng trượt cho mobile/tablet */}
      <div className={`lg:hidden fixed inset-0 z-50 ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Overlay mờ */}
        <div 
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        {/* Sidebar trượt */}
        <div className={`absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar
            isOpen={true}
            onToggle={() => setIsSidebarOpen(false)}
            selectedAIs={selectedAIs}
            onToggleAI={toggleAISelection}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onChatSelect={handleChatSelect}
            currentChatId={currentChatId}
            aiCharacters={aiAssistants}
          />
        </div>
      </div>

      {/* Sidebar cố định cho desktop */}
      <div className={`hidden lg:block flex-shrink-0 h-full transition-all duration-300 ${isDesktopSidebarCollapsed ? 'w-16' : 'w-80'}`}>
        <Sidebar
          isOpen={true}
          onToggle={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
          selectedAIs={selectedAIs}
          onToggleAI={toggleAISelection}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          collapsed={isDesktopSidebarCollapsed}
          onCollapseToggle={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
          onChatSelect={handleChatSelect}
          currentChatId={currentChatId}
          aiCharacters={aiAssistants}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-4 h-16 flex items-center justify-between`}>
          <div className="flex items-center">
            {/* Nút mở sidebar mobile */}
            <button
              className={`lg:hidden mr-2 !rounded-button whitespace-nowrap cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200 p-2`}
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex -space-x-2 sm:-space-x-3 mr-2 sm:mr-4 flex-shrink-0">
                {selectedAIs.slice(0, maxAvatars).map((aiId) => {
                  const ai = getAIById(aiId);
                  return (
                    <TooltipProvider key={aiId}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 ${darkMode ? 'border-gray-700' : 'border-white'} shadow-lg transition-transform duration-300 hover:scale-110`}>
                            <AvatarImage src={ai?.avatar} alt={ai?.name} className="object-cover" />
                            <AvatarFallback className="bg-green-100 text-green-800 text-xs sm:text-sm">
                              {ai?.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ai?.name} - {ai?.role}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                {selectedAIs.length > maxAvatars && (
                  <Avatar className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 ${darkMode ? 'border-gray-700' : 'border-white'} ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center shadow-lg`}>
                    <span className="text-xs font-medium">+{selectedAIs.length - maxAvatars}</span>
                  </Avatar>
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
                      <span className="text-xs text-green-600 dark:text-green-400">Lịch sử</span>
                    </div>
                  )}
                </div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
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
              onClick={handleNewChat}
              className={`touch-target !rounded-button whitespace-nowrap cursor-pointer ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'} transition-colors duration-200 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex items-center`}
              title={currentChat ? "Tạo cuộc trò chuyện mới" : "Bắt đầu cuộc trò chuyện mới"}
            >
              <i className="fas fa-plus mr-1 text-xs sm:text-sm"></i>
              <span className="hidden xs:inline sm:hidden lg:inline">
                {currentChat ? "Chat mới" : "Tạo mới"}
              </span>
              <span className="xs:hidden sm:inline lg:hidden">
                {currentChat ? "Mới" : "Tạo"}
              </span>
              <span className="xxs:hidden xs:hidden sm:hidden">
                <i className="fas fa-plus text-xs"></i>
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
                      onClick={toggleAutoInteraction}
                      className={`touch-target !rounded-button whitespace-nowrap cursor-pointer transition-colors duration-200 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${
                        autoInteractionActive
                          ? (darkMode ? 'bg-green-700 border-green-600 hover:bg-green-600' : 'bg-green-100 border-green-300 hover:bg-green-200')
                          : (darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50')
                      }`}
                      title={autoInteractionActive ? "Tắt tương tác tự động" : "Bật tương tác tự động"}
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
                        ? `Tự động tương tác đang BẬT (${currentTimeoutSeconds} giây)`
                        : "Bật tương tác tự động giữa AI và câu hỏi cho bạn"
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Add AI Button - Always visible */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`touch-target !rounded-button whitespace-nowrap cursor-pointer ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50'} transition-colors duration-200 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3`}
                  title="Thêm AI vào cuộc trò chuyện"
                >
                  <i className="fas fa-user-plus mr-1 text-xs sm:text-sm"></i>
                  <span className="hidden md:inline">Thêm AI</span>
                  <span className="md:hidden">AI</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right"
                className={`w-full sm:max-w-md lg:max-w-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'} border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <SheetHeader className="pb-4">
                  <SheetTitle className={`text-lg sm:text-xl ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Thêm AI vào cuộc trò chuyện
                  </SheetTitle>
                  <SheetDescription className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Chọn AI bạn muốn thêm vào cuộc trò chuyện hiện tại
                  </SheetDescription>
                </SheetHeader>
                
                {/* AI Selection List */}
                <div className="mt-4 space-y-2 sm:space-y-3 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  {aiAssistants.map((ai) => (
                    <div
                      key={ai.id}
                      onClick={() => toggleAISelection(ai.id)}
                      className={`p-3 sm:p-4 rounded-xl flex items-center cursor-pointer transition-all touch-target ${
                        selectedAIs.includes(ai.id) 
                          ? (darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200') 
                          : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                      } transform hover:scale-[1.02] transition-all duration-300`}
                    >
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-200 shadow-md flex-shrink-0">
                        <AvatarImage src={ai.avatar} alt={ai.name} className="object-cover" />
                        <AvatarFallback className="bg-green-100 text-green-800 text-xs sm:text-sm">
                          {ai.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base line-clamp-1">{ai.name}</h3>
                        <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
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
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
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
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
            
            {/* Stats toggle for mobile/tablet - hidden on desktop */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleStatsSidebar}
              className="xl:hidden touch-target !rounded-button whitespace-nowrap cursor-pointer h-8 w-8 sm:h-9 sm:w-9"
              title="Thống kê học tập"
            >
              <i className="fas fa-chart-bar text-sm"></i>
            </Button>
            
            {/* More options button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="touch-target !rounded-button whitespace-nowrap cursor-pointer h-8 w-8 sm:h-9 sm:w-9"
              title="Tùy chọn khác"
            >
              <i className="fas fa-ellipsis-v text-sm"></i>
            </Button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <ScrollArea
          className={`flex-1 chat-mobile ${darkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'}`}
          ref={chatContainerRef}
        >
          <div className="w-full space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6">
            {messages.map((message) => {
              const isUser = message.sender === 'user';
              // For AI messages, sender will be the AI name (not ID)
              const ai = isUser ? null : getAIByName(message.sender);
              
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  ai={ai ?? undefined}
                  darkMode={darkMode}
                  onReply={startReplyMode}
                />
              );
            })}
          </div>
        </ScrollArea>
        
        {/* Reply Mode Indicator */}
        {replyMode?.isActive && (
          <div className={`px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border-t`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-reply text-blue-600 mr-2"></i>
                <span className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  Đang phản hồi <strong>{replyMode.aiName}</strong>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelReplyMode}
                className={`text-xs px-2 py-1 h-6 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <i className="fas fa-times mr-1"></i>
                Hủy
              </Button>
            </div>
          </div>
        )}
        
        {/* Fixed Typing Indicator Above Input */}
        {typingAIs.length > 0 && (
          <div className={`px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-2 ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-center mr-2 sm:mr-3 flex-shrink-0 space-x-1">
                {typingAIs.map((ai) => (
                  <Avatar key={ai.id} className="w-6 h-6 sm:w-8 sm:h-8 shadow-md border-2 border-white">
                    <AvatarImage
                      src={ai.avatar}
                      alt={ai.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-orange-100 text-orange-800 text-xs">
                      {ai.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className={`rounded-xl p-2 sm:p-3 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'} shadow-sm`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {typingAIs.length === 1 
                      ? `${typingAIs[0].name} typing...`
                      : `${typingAIs.length} person typing...`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <ChatInput 
          onSendMessage={enhancedSendMessage}
          darkMode={darkMode}
          disabled={isProcessing || selectedAIs.length === 0}
          placeholder={
            replyMode?.isActive 
              ? `Phản hồi ${replyMode.aiName}...` 
              : (isProcessing ? "Đang xử lý..." : 
                 isAutoInteracting ? "AI đang tương tác..." :
                 "Nhập tin nhắn của bạn...")
          }
        />
      </div>
      
      {/* Desktop Learning Stats Sidebar */}
      <div className={`hidden xl:block transition-all duration-300 ${isStatsDesktopCollapsed ? 'w-0' : 'w-80'}`}>
        <LearningStatsSidebar 
          darkMode={darkMode} 
          collapsed={isStatsDesktopCollapsed}
          onCollapseToggle={() => setIsStatsDesktopCollapsed(!isStatsDesktopCollapsed)}
        />
      </div>

      {/* Mobile Stats Sidebar */}
      {isStatsSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsStatsSidebarOpen(false)}
          />
          <div className={`fixed right-0 top-0 h-full w-full max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl transform transition-transform duration-300 ${isStatsSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">Thống kê học tập</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsStatsSidebarOpen(false)}
                className="touch-target"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
            <div className="h-full overflow-auto">
              <LearningStatsSidebar darkMode={darkMode} />
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
