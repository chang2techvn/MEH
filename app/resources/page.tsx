'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Critical above-the-fold components - NO lazy loading for immediate rendering
import MainHeader from "@/components/ui/main-header";
import { MobileNavigation } from "@/components/home/mobile-navigation";
import SmoothScrollIndicator from '@/components/ui/smooth-scroll-indicator';
import { Message, AICharacter } from '@/types/ai-hub.types';
import { LearningStatsSidebar } from '@/components/ai-hub/learning-stats/LearningStatsSidebar';
import { ResourcesMobileBottomNavigation } from '@/components/ai-hub/resources-mobile-bottom-navigation';
import { ChatHeader } from '@/components/ai-hub/chat/chat-header';
import { SidebarManager } from '@/components/ai-hub/sidebar/sidebar-manager';
import { ChatMessageArea } from '@/components/ai-hub/chat/chat-message-area';
import { MobileChatInput } from '@/components/ai-hub/chat/mobile-chat-input';
import { TypingIndicator } from '@/components/ai-hub/chat/typing-indicator';
import { ChatInput } from '@/components/ai-hub/chat/ChatInput';
import { supabase } from '@/lib/supabase';
import { singleChatService } from '@/lib/single-chat-service';
import { useResourcesPage } from '@/hooks/use-resources-page';
import { useResourcesContext } from '@/contexts/resources-context';

export default function ResourcesPage() {
  // Get cached resources data from context
  const resourcesContext = useResourcesContext()
  
  // Use the comprehensive resources page hook
  const {
    router,
    selectedAIs,
    setSelectedAIs,
    inputMessage,
    setInputMessage,
    activeFilter,
    setActiveFilter,
    maxAvatars,
    setMaxAvatars,
    currentChatId,
    setCurrentChatId,
    mobileMenuOpen,
    setMobileMenuOpen,
    replyMode,
    setReplyMode,
    theme,
    updateTheme,
    isDarkMode,
    toggleDarkMode,
    isMobile,
    isSidebarOpen,
    isDesktopSidebarCollapsed,
    isStatsDesktopCollapsed,
    setIsSidebarOpen,
    setIsDesktopSidebarCollapsed,
    setIsStatsDesktopCollapsed,
    handleLeftSidebarHoverEnter,
    handleLeftSidebarHoverLeave,
    handleRightSidebarHoverEnter,
    handleRightSidebarHoverLeave,
    windowWidth,
    mounted,
    getDynamicPadding,
    getScrollAreaPadding,
    getDynamicMaxWidth,
    singleChatMessages,
    singleChatProcessing,
    setSingleChatMessages,
    setSingleChatProcessing,
    handleSingleChatMessage,
    clearSingleChatMessages,
    user,
    authLoading,
    isAuthenticated,
    authChecked,
    setAuthChecked,
    aiAssistants: hookAiAssistants,
    aiLoading: hookAiLoading,
    aiError: hookAiError,
    getAIById: hookGetAIById,
    chatSessions: hookChatSessions,
    messages,
    isProcessing,
    isAutoInteracting,
    typingAIs,
    currentSession,
    chatContainerRef,
    sendNaturalMessage,
    replyToMessage,
    createSession,
    loadSession,
    clearSession,
    autoInteractionEnabled,
    autoInteractionActive,
    currentTimeoutSeconds,
    startAutoInteraction,
    stopAutoInteraction,
    toggleAutoInteraction,
    resetAutoInteraction,
    scrollToBottom,
    isAutoScrolling,
    toggleAISelection,
    handleChatSelect,
    handleNewChat,
    handleMobileAISelection,
    handleMobileStartChat,
    handleMobileChatSelection,
    startReplyMode,
    cancelReplyMode,
    enhancedSendMessage,
    currentChat,
    getChatTitle,
    getChatSubtitle,
    getAIByName
  } = useResourcesPage()

  // Use cached data when available, fallback to hook data
  const aiAssistants = resourcesContext.isCacheReady ? resourcesContext.aiAssistants : hookAiAssistants
  const aiLoading = resourcesContext.isCacheReady ? resourcesContext.aiLoading : hookAiLoading  
  const aiError = resourcesContext.isCacheReady ? resourcesContext.aiError : hookAiError
  const getAIById = resourcesContext.isCacheReady ? resourcesContext.getAIById : hookGetAIById
  const chatSessions = resourcesContext.isCacheReady ? resourcesContext.chatSessions : hookChatSessions
  
  // Improved loading state - show content faster when cache is ready
  const isContentReady = resourcesContext.isCacheReady || (!resourcesContext.isInitialLoad && aiAssistants.length > 0)

  // Early return for hydration - like other routes
  if (!mounted) {
    return null;
  }

  // Show loading state while authentication is being checked OR during auth resolution
  // Extended loading to prevent false authentication failures
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Show loading state if authentication is still being resolved
  // Give more time before showing "not authenticated" state
  if (mounted && !authLoading && (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Show loading state only if content is not ready
  if (!isContentReady && aiLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (aiError) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">
        <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-48 bg-red-200 dark:bg-red-800 rounded-lg mb-4"></div>
              <div className="h-4 w-64 bg-red-200 dark:bg-red-800 rounded-lg mb-6"></div>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80 dark:from-background dark:via-background/90 dark:to-background/80">
      {/* Background decorations - disabled on mobile for better performance */}
      <div className="absolute top-10 sm:top-20 left-2 sm:left-10 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-neo-mint/10 dark:bg-purist-blue/10 blur-3xl -z-10 hidden sm:animate-blob sm:block contain-paint"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-2 sm:right-10 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-cantaloupe/10 dark:bg-cassis/10 blur-3xl -z-10 hidden sm:animate-blob sm:animation-delay-2000 sm:block contain-paint"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-mellow-yellow/5 dark:bg-mellow-yellow/5 blur-3xl -z-10 hidden sm:animate-blob sm:animation-delay-4000 sm:block contain-paint"></div>
      
      {/* Critical above-the-fold components - NO Suspense */}
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {/* Mobile Navigation - responsive overlay */}
      <MobileNavigation 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main Content Container with proper margins - responsive layout */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-none px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-12 py-2 sm:py-4 lg:py-6">
          <div className={`flex h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] overflow-hidden ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} rounded-xl shadow-sm`}>  
            
            {/* Sidebar Manager */}
            <SidebarManager
              isSidebarOpen={isSidebarOpen}
              onCloseMobileSidebar={() => setIsSidebarOpen(false)}
              isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
              onLeftSidebarHoverEnter={handleLeftSidebarHoverEnter}
              onLeftSidebarHoverLeave={handleLeftSidebarHoverLeave}
              selectedAIs={selectedAIs}
              onToggleAI={toggleAISelection}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              onChatSelect={handleChatSelect}
              currentChatId={currentChatId}
              aiCharacters={aiAssistants}
              onDesktopSidebarToggle={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            />

            {/* Main Chat Area - responsive container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header - responsive padding */}
        <ChatHeader
          isDarkMode={isDarkMode}
          selectedAIs={selectedAIs}
          maxAvatars={maxAvatars}
          isMobile={isMobile.isMobile}
          getAIById={getAIById}
          singleChatService={singleChatService}
          getChatTitle={getChatTitle}
          getChatSubtitle={getChatSubtitle}
          currentChat={currentChat}
          onNewChat={handleNewChat}
          currentSession={currentSession}
          autoInteractionActive={autoInteractionActive}
          currentTimeoutSeconds={currentTimeoutSeconds}
          onToggleAutoInteraction={toggleAutoInteraction}
          aiAssistants={aiAssistants}
          onToggleAI={toggleAISelection}
        />
        
        {/* Chat Messages - responsive container */}
        <ChatMessageArea
          isDarkMode={isDarkMode}
          selectedAIs={selectedAIs}
          singleChatMessages={singleChatMessages}
          messages={messages}
          getScrollAreaPadding={getScrollAreaPadding}
          getDynamicMaxWidth={getDynamicMaxWidth}
          getDynamicPadding={getDynamicPadding}
          onToggleAI={toggleAISelection}
          aiCharacters={aiAssistants}
          getAIByName={getAIByName}
          startReplyMode={startReplyMode}
          chatContainerRef={chatContainerRef}
        />
        
        {/* Independent Typing Indicator - Above Reply/Input Area (Desktop only) */}
        <TypingIndicator
          isDarkMode={isDarkMode}
          selectedAIs={selectedAIs}
          singleChatProcessing={singleChatProcessing}
          typingAIs={typingAIs}
          getDynamicPadding={getDynamicPadding}
          isMobile={false}
        />
        
        {/* Mobile Typing Indicator - Fixed positioned above mobile input */}
        <TypingIndicator
          isDarkMode={isDarkMode}
          selectedAIs={selectedAIs}
          singleChatProcessing={singleChatProcessing}
          typingAIs={typingAIs}
          getDynamicPadding={getDynamicPadding}
          isMobile={true}
        />
        
        {/* Reply Mode Indicator - responsive padding */}
        {replyMode?.isActive && (
          <div className={`${getDynamicPadding()} py-2 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border-t`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-reply text-blue-600 mr-2"></i>
                <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  Đang phản hồi <strong>{replyMode.aiName}</strong>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelReplyMode}
                className={`text-xs px-2 py-1 h-6 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <i className="fas fa-times mr-1"></i>
                Hủy
              </Button>
            </div>
          </div>
        )}
        
        {/* Mobile Chat Input - positioned above bottom navigation */}
        <MobileChatInput
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          onSendMessage={(content) => {
            enhancedSendMessage(content);
            setInputMessage('');
          }}
          disabled={selectedAIs.length === 0 ? singleChatProcessing : (isProcessing && !isAutoInteracting)}
          placeholder={
            selectedAIs.length === 0
              ? (singleChatProcessing ? "Processing..." : "Type your English question...")
              : ((isProcessing && !isAutoInteracting) ? "Processing..." : 
                 isAutoInteracting ? "AI is interacting..." :
                 "Type your message...")
          }
          replyMode={replyMode}
        />
        
        {/* Desktop Chat Input */}
        <div className="hidden lg:block">
          <ChatInput 
            onSendMessage={enhancedSendMessage}
            darkMode={isDarkMode}
            disabled={selectedAIs.length === 0 ? singleChatProcessing : (isProcessing && !isAutoInteracting)}
            placeholder={
              replyMode?.isActive 
                ? `Phản hồi ${replyMode.aiName}...` 
                : selectedAIs.length === 0
                  ? (singleChatProcessing ? "Đang xử lý..." : "Nhập câu hỏi tiếng Anh của bạn...")
                  : ((isProcessing && !isAutoInteracting) ? "Đang xử lý..." : 
                     isAutoInteracting ? "AI đang tương tác..." :
                     "Nhập tin nhắn của bạn...")
            }
          />
        </div>
      </div>
      
      {/* Desktop Learning Stats Sidebar */}
      <div className="relative hidden xl:block flex-shrink-0 h-full">
        {/* Hover trigger zone when right sidebar is collapsed */}
        {isStatsDesktopCollapsed && (
          <div
            className="absolute right-0 top-0 w-6 h-full z-10 bg-transparent hover:bg-green-500/5 transition-all duration-200 border-l-2 border-transparent hover:border-green-500/20 cursor-pointer group"
            onMouseEnter={handleRightSidebarHoverEnter}
            title="Hover để mở rộng stats sidebar"
          >
            <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <i className="fas fa-chevron-left text-green-500 text-xs animate-pulse"></i>
            </div>
          </div>
        )}
        
        <div 
          className={`transition-all duration-300 ease-in-out ${isStatsDesktopCollapsed ? 'w-0' : 'w-80'} h-full`}
          onMouseEnter={handleRightSidebarHoverEnter}
          onMouseLeave={handleRightSidebarHoverLeave}
        >
          <LearningStatsSidebar 
            darkMode={isDarkMode} 
            collapsed={isStatsDesktopCollapsed}
            onCollapseToggle={() => setIsStatsDesktopCollapsed(!isStatsDesktopCollapsed)}
          />
        </div>
      </div>

      {/* Mobile Stats Sidebar - REMOVED */}
      
      {/* Smooth Scroll Indicator - Only show when auto-scrolling */}
      <SmoothScrollIndicator 
        isAutoScrolling={isAutoScrolling}
      />

      {/* Mobile Bottom Navigation */}
      <ResourcesMobileBottomNavigation 
        onSelectAI={handleMobileAISelection}
        onStartChat={handleMobileStartChat}
        onSelectChat={handleMobileChatSelection}
        selectedAIs={selectedAIs}
        onToggleAI={toggleAISelection}
      />
          </div>
        </div>
      </div>
    </div>
  );
}
