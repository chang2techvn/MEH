'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "@/contexts/theme-context";
import { useMobile } from "@/hooks/use-mobile";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useSidebarManager } from "@/hooks/use-sidebar-manager";
import { useAIAssistants } from '@/hooks/use-ai-assistants';
import { useNaturalConversation } from '@/hooks/use-natural-conversation';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { useAuth } from '@/contexts/auth-context';
import { useSingleChat } from '@/hooks/use-single-chat';
import { useChatHandlers } from '@/hooks/use-chat-handlers';

// Type definition for reply mode
interface ReplyMode {
  isActive: boolean;
  messageId: string;
  aiId: string;
  aiName: string;
}

export const useResourcesPage = () => {
  const router = useRouter();
  
  // Core state management
  const [selectedAIs, setSelectedAIs] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState(''); // State for mobile input
  const [activeFilter, setActiveFilter] = useState('All');
  const [maxAvatars, setMaxAvatars] = useState(3);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Reply mode state
  const [replyMode, setReplyMode] = useState<ReplyMode | null>(null);

  // Theme management
  const { theme, updateTheme } = useTheme();
  const isDarkMode = theme.mode === 'dark';
  const toggleDarkMode = () => updateTheme({ mode: isDarkMode ? 'light' : 'dark' });

  // Mobile detection
  const isMobile = useMobile();

  // Sidebar management
  const {
    isSidebarOpen,
    isDesktopSidebarCollapsed,
    isStatsDesktopCollapsed,
    setIsSidebarOpen,
    setIsDesktopSidebarCollapsed,
    setIsStatsDesktopCollapsed,
    handleLeftSidebarHoverEnter,
    handleLeftSidebarHoverLeave,
    handleRightSidebarHoverEnter,
    handleRightSidebarHoverLeave
  } = useSidebarManager();
  
  // Responsive layout
  const {
    windowWidth,
    mounted,
    getDynamicPadding,
    getScrollAreaPadding,
    getDynamicMaxWidth
  } = useResponsiveLayout({
    isDesktopSidebarCollapsed,
    isStatsDesktopCollapsed
  });

  // Single chat hook
  const {
    singleChatMessages,
    singleChatProcessing,
    setSingleChatMessages,
    setSingleChatProcessing,
    handleSingleChatMessage,
    clearSingleChatMessages
  } = useSingleChat();

  // Authentication
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // AI assistants
  const { aiAssistants, loading: aiLoading, error: aiError, getAIById } = useAIAssistants();
  
  // Chat sessions
  const { sessions: chatSessions } = useChatSessions();

  // Enhanced auth
  const [authChecked, setAuthChecked] = useState(false);
  
  // Natural conversation - memoized selectedAIs for stability
  const selectedAIsStable = useMemo(() => selectedAIs, [selectedAIs]);
  const { 
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
    // Auto-interaction functions
    autoInteractionEnabled,
    autoInteractionActive,
    currentTimeoutSeconds,
    startAutoInteraction,
    stopAutoInteraction,
    toggleAutoInteraction,
    resetAutoInteraction,
    // Smooth scroll functions
    scrollToBottom,
    isAutoScrolling
  } = useNaturalConversation(selectedAIsStable);

  // Chat handlers
  const {
    toggleAISelection,
    handleChatSelect,
    handleNewChat,
    handleMobileAISelection,
    handleMobileStartChat,
    handleMobileChatSelection
  } = useChatHandlers({
    selectedAIs,
    setSelectedAIs,
    setCurrentChatId,
    chatSessions,
    loadSession,
    clearSession,
    clearSingleChatMessages,
    createSession,
    aiAssistants,
    windowWidth,
    setIsSidebarOpen
  });

  // Reply mode functions
  const startReplyMode = (messageId: string, aiId: string, aiName: string) => {
    setReplyMode({
      isActive: true,
      messageId,
      aiId,
      aiName
    });
  };

  const cancelReplyMode = () => {
    setReplyMode(null);
  };

  // Enhanced send message that handles both single chat and group chat modes
  const enhancedSendMessage = async (content: string, mediaUrl?: string | null, mediaType?: string | null) => {
    if (selectedAIs.length === 0) {
      // Single chat mode - no AIs selected
      await handleSingleChatMessage(content, scrollToBottom);
    } else if (replyMode?.isActive) {
      // Group chat reply mode
      replyToMessage(content, replyMode.messageId, replyMode.aiId);
      setReplyMode(null); // Exit reply mode after sending
    } else {
      // Group chat normal mode
      sendNaturalMessage(content);
    }
  };

  // Get current chat information
  const currentChat = currentChatId ? chatSessions.find(session => session.id === currentChatId) : null;

  // Chat title function
  const getChatTitle = () => {
    if (currentChat) {
      return currentChat.title;
    }
    if (selectedAIs.length === 0) {
      return "Hani Assistant - Single Chat";
    }
    return `Conversation with ${selectedAIs.length} people`;
  };

  // Chat subtitle function
  const getChatSubtitle = () => {
    if (currentChat) {
      const participantNames = currentChat.participants.map(id => getAIById(id)?.name).filter(Boolean);
      return participantNames.join(', ');
    }
    if (selectedAIs.length === 0) {
      return "Don't choose anybody, enter something to start a single chat with Hani";
    }
    return selectedAIs.map(aiId => getAIById(aiId)?.name).join(', ');
  };

  // Helper function to find AI by name (since API returns AI name, not ID)
  const getAIByName = (name: string) => {
    return aiAssistants.find(ai => ai.name === name);
  };

  // Window resize effect for maxAvatars
  useEffect(() => {
    const handleResize = () => {
      setMaxAvatars(windowWidth < 640 ? 2 : 3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth]);

  // Initialize selectedAIs effect
  useEffect(() => {
    // Don't auto-select any AIs - let user choose
    // The chat will work in single-chat mode when no AIs are selected
  }, [aiAssistants]);

  return {
    // Router
    router,
    
    // State
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
    
    // Theme
    theme,
    updateTheme,
    isDarkMode,
    toggleDarkMode,
    
    // Mobile
    isMobile,
    
    // Sidebar
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
    
    // Layout
    windowWidth,
    mounted,
    getDynamicPadding,
    getScrollAreaPadding,
    getDynamicMaxWidth,
    
    // Single chat
    singleChatMessages,
    singleChatProcessing,
    setSingleChatMessages,
    setSingleChatProcessing,
    handleSingleChatMessage,
    clearSingleChatMessages,
    
    // Auth
    user,
    authLoading,
    isAuthenticated,
    authChecked,
    setAuthChecked,
    
    // AI Assistants
    aiAssistants,
    aiLoading,
    aiError,
    getAIById,
    
    // Chat sessions
    chatSessions,
    
    // Natural conversation
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
    
    // Chat handlers
    toggleAISelection,
    handleChatSelect,
    handleNewChat,
    handleMobileAISelection,
    handleMobileStartChat,
    handleMobileChatSelection,
    
    // Reply mode functions
    startReplyMode,
    cancelReplyMode,
    
    // Enhanced send message
    enhancedSendMessage,
    
    // Current chat
    currentChat,
    
    // Utility functions
    getChatTitle,
    getChatSubtitle,
    getAIByName
  };
};
