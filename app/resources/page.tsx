'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
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

// Critical above-the-fold components - NO lazy loading for immediate rendering
import MainHeader from "@/components/ui/main-header";
import { MobileNavigation } from "@/components/home/mobile-navigation";
import SmoothScrollIndicator from '@/components/ui/smooth-scroll-indicator';
import { Sidebar } from '@/components/ai-hub/sidebar/Sidebar';
import { MessageItem } from '@/components/ai-hub/chat/MessageItem';
import { ChatInput } from '@/components/ai-hub/chat/ChatInput';
import { WelcomeScreen } from '@/components/ai-hub/chat/WelcomeScreen';
import { Message, AICharacter } from '@/types/ai-hub.types';
import { LearningStatsSidebar } from '@/components/ai-hub/learning-stats/LearningStatsSidebar';
import { ResourcesMobileBottomNavigation } from '@/components/ai-hub/resources-mobile-bottom-navigation';
import { useMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/theme-context";

// Optimized Avatar Component with next/image
const OptimizedAvatar = ({ 
  src, 
  alt, 
  size = 48, 
  className = "",
  fallbackText,
  priority = false,
  ...props 
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackText: string;
  priority?: boolean;
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
        className={`relative overflow-hidden rounded-full bg-green-100 flex items-center justify-center animate-pulse ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <span className="text-green-800 font-medium" style={{ fontSize: size * 0.4 }}>
          {fallbackText}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      className={`relative overflow-hidden rounded-full bg-green-100 flex items-center justify-center ${className}`}
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
          priority={priority || size >= 48} // Priority for larger avatars or when specified
          className="object-cover rounded-full transition-all duration-300"
          style={{ 
            width: size, 
            height: size,
            imageRendering: 'crisp-edges' // Ensures sharp rendering
          }}
          onError={() => setImageError(true)}
          sizes={`${size}px`}
          // Add loading optimization
          loading={priority ? 'eager' : 'lazy'}
          // Prevent drag
          draggable={false}
        />
      ) : (
        <span 
          className="text-green-800 font-medium select-none" 
          style={{ fontSize: size * 0.4 }}
        >
          {fallbackText}
        </span>
      )}
    </div>
  );
};

import { useAIAssistants } from '@/hooks/use-ai-assistants';
import { useNaturalConversation } from '@/hooks/use-natural-conversation';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { singleChatService } from '@/lib/single-chat-service';

export default function ResourcesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false); // Add mounted state like other routes
  const [authChecked, setAuthChecked] = useState(false); // New state to track if auth has been thoroughly checked
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile: đóng mặc định
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false); // desktop: thu nhỏ sidebar
  // Mobile stats sidebar removed - no longer needed
  const [isStatsDesktopCollapsed, setIsStatsDesktopCollapsed] = useState(false); // desktop: thu nhỏ stats sidebar
  const [selectedAIs, setSelectedAIs] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState(''); // State for mobile input
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const { theme, updateTheme } = useTheme();
  const isDarkMode = theme.mode === 'dark';
  const toggleDarkMode = () => updateTheme({ mode: isDarkMode ? 'light' : 'dark' });
  const [maxAvatars, setMaxAvatars] = useState(3);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [singleChatMessages, setSingleChatMessages] = useState<Message[]>([]);
  const [singleChatProcessing, setSingleChatProcessing] = useState(false);
  const [leftHoverTimer, setLeftHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [rightHoverTimer, setRightHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [isHoveringLeftArea, setIsHoveringLeftArea] = useState(false);
  const [isHoveringRightArea, setIsHoveringRightArea] = useState(false);
  const isMobile = useMobile();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hydration and responsive logic
  useEffect(() => {
    setMounted(true);
    
    // Close mobile sidebars on desktop
    if (windowWidth >= 1024) { // lg breakpoint
      setIsSidebarOpen(false);
      // Mobile stats sidebar removed
    }
  }, [windowWidth]);

  // Detect small mobile devices
  const isSmallMobile = windowWidth < 640; // sm breakpoint
  const isTablet = windowWidth >= 640 && windowWidth < 1024; // between sm and lg

  // Dynamic padding based on sidebar states for responsive design
  const getDynamicPadding = () => {
    // Base padding classes for mobile/tablet (not affected by sidebar states)
    const baseMobile = "px-2 sm:px-6 md:px-8"; // Reduced mobile padding for better space utilization
    
    // Desktop padding that adapts to sidebar states
    if (windowWidth >= 1024) { // lg breakpoint and above
      const leftCollapsed = isDesktopSidebarCollapsed;
      const rightCollapsed = isStatsDesktopCollapsed;
      
      if (leftCollapsed && rightCollapsed) {
        // Both sidebars collapsed - use minimal padding for maximum width utilization
        return `${baseMobile} lg:px-2 xl:px-3 2xl:px-4`;
      } else if (leftCollapsed || rightCollapsed) {
        // One sidebar collapsed - use moderate padding
        return `${baseMobile} lg:px-3 xl:px-4 2xl:px-6`;
      } else {
        // Both sidebars open - use standard padding
        return `${baseMobile} lg:px-4 xl:px-6 2xl:px-8`;
      }
    }
    
    // Mobile/tablet default
    return baseMobile;
  };

  // Dynamic padding for ScrollArea container (slightly less padding)
  const getScrollAreaPadding = () => {
    // Base padding for mobile/tablet
    const baseMobile = "px-3 sm:px-4 md:px-6";
    
    // Desktop padding that adapts to sidebar states
    if (windowWidth >= 1024) { // lg breakpoint and above
      const leftCollapsed = isDesktopSidebarCollapsed;
      const rightCollapsed = isStatsDesktopCollapsed;
      
      if (leftCollapsed && rightCollapsed) {
        // Both sidebars collapsed - use very minimal padding
        return `${baseMobile} lg:px-1 xl:px-2 2xl:px-3`;
      } else if (leftCollapsed || rightCollapsed) {
        // One sidebar collapsed - use moderate padding
        return `${baseMobile} lg:px-2 xl:px-3 2xl:px-4`;
      } else {
        // Both sidebars open - use standard padding
        return `${baseMobile} lg:px-3 xl:px-4 2xl:px-6`;
      }
    }
    
    // Mobile/tablet default
    return baseMobile;
  };

  // Dynamic max-width based on sidebar states
  const getDynamicMaxWidth = () => {
    // Mobile/tablet - always use full width
    if (windowWidth < 1024) {
      return "w-full h-full transition-all duration-300";
    }
    
    // Desktop - adjust max-width based on sidebar states
    const leftCollapsed = isDesktopSidebarCollapsed;
    const rightCollapsed = isStatsDesktopCollapsed;
    
    if (leftCollapsed && rightCollapsed) {
      // Both sidebars collapsed - use maximum width
      return "w-full h-full max-w-none transition-all duration-300";
    } else if (leftCollapsed || rightCollapsed) {
      // One sidebar collapsed - use larger max-width
      return "w-full h-full max-w-6xl mx-auto transition-all duration-300";
    } else {
      // Both sidebars open - use standard max-width
      return "w-full h-full max-w-4xl mx-auto transition-all duration-300";
    }
  };

  // Authentication check - MUST be called before any early returns
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Use real AI assistants from Supabase - MUST be called before any early returns
  const { aiAssistants, loading: aiLoading, error: aiError, getAIById } = useAIAssistants();
  
  // Use real chat sessions from Supabase
  const { sessions: chatSessions, loading: sessionsLoading } = useChatSessions();
  
  // Initialize selectedAIs as empty array by default - no AI selected initially
  useEffect(() => {
    // Don't auto-select any AIs - let user choose
    // The chat will work in single-chat mode when no AIs are selected
  }, [aiAssistants]);

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

  // Enhanced send message that handles both single chat and group chat modes
  const enhancedSendMessage = async (content: string, mediaUrl?: string | null, mediaType?: string | null) => {
    if (selectedAIs.length === 0) {
      // Single chat mode - no AIs selected
      await handleSingleChatMessage(content);
    } else if (replyMode?.isActive) {
      // Group chat reply mode
      replyToMessage(content, replyMode.messageId, replyMode.aiId);
      setReplyMode(null); // Exit reply mode after sending
    } else {
      // Group chat normal mode
      sendNaturalMessage(content);
    }
  };

  // Handle single chat message
  const handleSingleChatMessage = async (content: string) => {
    console.log('🚀 Starting single chat message:', content);
    
    const userMessageId = singleChatService.generateMessageId();
    const assistantMessageId = singleChatService.generateMessageId();
    
    // Add user message with correct Message interface
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      content,
      timestamp: new Date(),
      type: 'text' as const,
      isTyping: false,
      mediaUrl: null
    };
    
    console.log('📤 Adding user message:', userMessage);
    setSingleChatMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('💾 Updated messages after user:', newMessages);
      return newMessages;
    });
    
    // Auto-scroll after adding user message
    setTimeout(() => scrollToBottom(), 100);
    
    setSingleChatProcessing(true);
    
    try {
      console.log('🤖 Calling AI service...');
      // Get AI response
      const aiResponse = await singleChatService.sendMessage(content);
      console.log('✅ AI response received:', aiResponse);
      
      // Add assistant message with correct Message interface
      const assistantMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        type: 'text' as const,
        isTyping: false,
        mediaUrl: null,
        highlights: aiResponse.highlights,
        vocabulary: aiResponse.vocabulary
      };
      
      console.log('📥 Adding assistant message:', assistantMessage);
      setSingleChatMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        console.log('💾 Final messages:', newMessages);
        return newMessages;
      });
      
      // Auto-scroll after adding assistant message
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('❌ Error in single chat:', error);
      // Add error message with correct Message interface
      const errorMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        content: "I'm sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
        type: 'text' as const,
        isTyping: false,
        mediaUrl: null
      };
      setSingleChatMessages(prev => [...prev, errorMessage]);
      
      // Auto-scroll after adding error message
      setTimeout(() => scrollToBottom(), 100);
    } finally {
      setSingleChatProcessing(false);
    }
  };

  // Handle authentication redirect in useEffect to avoid render-time side effects
  // ENHANCED LOGIC: Multiple safeguards to prevent false redirects
  useEffect(() => {
    // Skip if component not mounted yet
    if (!mounted) return;
    
    // Skip if auth is still loading
    if (authLoading) return;
    
    // Skip if already checked to prevent multiple calls
    if (authChecked) return;
    
    // Additional check: Look for stored session as backup
    const checkStoredSession = async () => {
      try {
        // Check Supabase session directly
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If we have a valid session but user/isAuthenticated is false, wait longer
        if (session && session.user && (!user || !isAuthenticated)) {
          console.log('Session exists but user data not loaded yet, waiting...');
          // Set a flag to check again later
          setTimeout(() => setAuthChecked(false), 1000);
          return;
        }
        
        // Check localStorage for additional confirmation
        const localSession = localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
        if (localSession && (!user || !isAuthenticated)) {
          try {
            const parsedSession = JSON.parse(localSession);
            if (parsedSession.access_token && parsedSession.refresh_token) {
              console.log('Local session found, giving more time for auth to resolve');
              // Set a flag to check again later
              setTimeout(() => setAuthChecked(false), 1500);
              return;
            }
          } catch (e) {
            console.log('Error parsing local session');
          }
        }
        
        // Mark as checked to prevent multiple calls
        setAuthChecked(true);
        
        // Only redirect if we're absolutely sure there's no authentication
        if (!session || !session.user) {
          console.log('No valid session found, redirecting to login');
          
          // Triple check with a delay to be absolutely sure
          setTimeout(async () => {
            const { data: { session: finalCheck } } = await supabase.auth.getSession();
            if (!finalCheck || !finalCheck.user) {
              router.push('/auth/login');
            }
          }, 500); // Increased delay for final check
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Don't redirect on error, retry later
        setTimeout(() => setAuthChecked(false), 2000);
      }
    };
    
    // Add debounce to prevent multiple checks
    const timeoutId = setTimeout(() => {
      checkStoredSession();
    }, 300); // Initial delay
    
    return () => clearTimeout(timeoutId);
  }, [mounted, authLoading, isAuthenticated, user, router, authChecked]);

  // ALL OTHER useEffect HOOKS MUST BE HERE - before any early returns
  useEffect(() => {
    setMounted(true); // Set mounted state like other routes
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setMaxAvatars(window.innerWidth < 640 ? 2 : 3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tự động thu hẹp both sidebars sau 5 giây khi load trang
  useEffect(() => {
    const leftTimer = setTimeout(() => {
      setIsDesktopSidebarCollapsed(true);
    }, 5000);
    
    const rightTimer = setTimeout(() => {
      setIsStatsDesktopCollapsed(true);
    }, 5000);

    return () => {
      clearTimeout(leftTimer);
      clearTimeout(rightTimer);
    };
  }, []);

  // Handle left sidebar hover auto-expand/collapse
  const handleLeftSidebarHoverEnter = () => {
    if (isDesktopSidebarCollapsed) {
      setIsHoveringLeftArea(true);
      setIsDesktopSidebarCollapsed(false);
    }
    // Clear any existing timer
    if (leftHoverTimer) {
      clearTimeout(leftHoverTimer);
      setLeftHoverTimer(null);
    }
  };

  const handleLeftSidebarHoverLeave = () => {
    setIsHoveringLeftArea(false);
    // Start timer to auto-collapse after 3 seconds
    const timer = setTimeout(() => {
      if (!isHoveringLeftArea) {
        setIsDesktopSidebarCollapsed(true);
      }
    }, 3000);
    setLeftHoverTimer(timer);
  };

  // Handle right sidebar hover auto-expand/collapse
  const handleRightSidebarHoverEnter = () => {
    if (isStatsDesktopCollapsed) {
      setIsHoveringRightArea(true);
      setIsStatsDesktopCollapsed(false);
    }
    // Clear any existing timer
    if (rightHoverTimer) {
      clearTimeout(rightHoverTimer);
      setRightHoverTimer(null);
    }
  };

  const handleRightSidebarHoverLeave = () => {
    setIsHoveringRightArea(false);
    // Start timer to auto-collapse after 3 seconds
    const timer = setTimeout(() => {
      if (!isHoveringRightArea) {
        setIsStatsDesktopCollapsed(true);
      }
    }, 3000);
    setRightHoverTimer(timer);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (leftHoverTimer) {
        clearTimeout(leftHoverTimer);
      }
      if (rightHoverTimer) {
        clearTimeout(rightHoverTimer);
      }
    };
  }, [leftHoverTimer, rightHoverTimer]);

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

  // Lấy thông tin chat hiện tại từ Supabase sessions
  const currentChat = currentChatId ? chatSessions.find(session => session.id === currentChatId) : null;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // toggleStatsSidebar removed - mobile stats sidebar no longer needed

  const toggleAISelection = (aiId: string) => {
    if (selectedAIs.includes(aiId)) {
      // Allow deselecting any AI, even if it's the last one
      setSelectedAIs(selectedAIs.filter(id => id !== aiId));
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
    // Reset to no AIs selected - single chat mode
    setSelectedAIs([]);
    // Clear single chat messages
    setSingleChatMessages([]);
    setSingleChatProcessing(false);
  };

  // Handler for AI selection from mobile bottom navigation
  const handleMobileAISelection = async (ai: AICharacter) => {
    // Start new chat with selected AI
    handleNewChat();
    // Switch to multi-chat mode with selected AI
    setSelectedAIs([ai.id]);
    // Create a new session with this AI
    try {
      await createSession(`Trò chuyện với ${ai.name}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Handler for multi-AI chat start from mobile bottom navigation
  const handleMobileStartChat = async (selectedAIIds: string[]) => {
    // Start new chat
    handleNewChat();
    // Switch to multi-chat mode with selected AIs
    setSelectedAIs(selectedAIIds);
    // Create a new session with these AIs
    try {
      const aiNames = selectedAIIds.map(id => {
        const ai = aiAssistants.find(a => a.id === id);
        return ai?.name || 'AI';
      }).join(', ');
      await createSession(`Trò chuyện với ${aiNames}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Handler for chat selection from mobile bottom navigation
  const handleMobileChatSelection = (chatId: string) => {
    handleChatSelect(chatId);
  };

  const getChatTitle = () => {
    if (currentChat) {
      return currentChat.title;
    }
    if (selectedAIs.length === 0) {
      return "Hani Assistant - Single Chat";
    }
    return `Conversation with ${selectedAIs.length} people`;
  };

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

  // Show loading state
  if (aiLoading) {
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
      {/* Sidebar dạng trượt cho mobile/tablet */}
      <div className={`lg:hidden fixed inset-0 z-[70] ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
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
            darkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onChatSelect={handleChatSelect}
            currentChatId={currentChatId}
            aiCharacters={aiAssistants}
          />
        </div>
      </div>

      {/* Sidebar cố định cho desktop */}
      <div className="relative hidden lg:block flex-shrink-0 h-full">
        {/* Hover trigger zone when sidebar is collapsed */}
        {isDesktopSidebarCollapsed && (
          <div
            className="absolute left-0 top-0 w-6 h-full z-10 bg-transparent hover:bg-blue-500/5 transition-all duration-200 border-r-2 border-transparent hover:border-blue-500/20 cursor-pointer group"
            onMouseEnter={handleLeftSidebarHoverEnter}
            title="Hover để mở rộng sidebar"
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <i className="fas fa-chevron-right text-blue-500 text-xs animate-pulse"></i>
            </div>
          </div>
        )}
        
        <div 
          className={`transition-all duration-300 ease-in-out ${isDesktopSidebarCollapsed ? 'w-0' : 'w-80'} h-full`}
          onMouseEnter={handleLeftSidebarHoverEnter}
          onMouseLeave={handleLeftSidebarHoverLeave}
        >
          <Sidebar
            isOpen={true}
            onToggle={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            selectedAIs={selectedAIs}
            onToggleAI={toggleAISelection}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            darkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            collapsed={isDesktopSidebarCollapsed}
            onCollapseToggle={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            onChatSelect={handleChatSelect}
            currentChatId={currentChatId}
            aiCharacters={aiAssistants}
          />
        </div>
      </div>

      {/* Main Chat Area - responsive container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header - responsive padding */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-2 sm:px-4 py-2 sm:py-4 h-12 sm:h-16 flex items-center justify-between`}>
          <div className="flex items-center">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex -space-x-2 sm:-space-x-3 mr-2 sm:mr-4 flex-shrink-0">
                {selectedAIs.length === 0 ? (
                  // Single chat mode - show assistant avatar
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <OptimizedAvatar
                            src={singleChatService.getAssistantAvatar()}
                            alt={singleChatService.getAssistantName()}
                            size={isMobile ? 32 : 48}
                            className={`border-2 shadow-lg ${isDarkMode ? 'border-gray-700' : 'border-white'}`}
                            fallbackText="EA"
                            priority={true}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{singleChatService.getAssistantName()} - Hani Assistant</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  // Group chat mode - show selected AIs
                  <>
                    {selectedAIs.slice(0, maxAvatars).map((aiId) => {
                      const ai = getAIById(aiId);
                      const avatarSize = isMobile ? 32 : 48; // Use mobile hook for consistency
                      return (
                        <TooltipProvider key={aiId}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <OptimizedAvatar
                                  src={ai?.avatar}
                                  alt={ai?.name || 'AI Avatar'}
                                  size={avatarSize}
                                  className={`border-2 shadow-lg ${isDarkMode ? 'border-gray-700' : 'border-white'}`}
                                  fallbackText={ai?.name?.substring(0, 2) || 'AI'}
                                  priority={true} // High priority for main header avatars
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{ai?.name} - {ai?.role}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                    {selectedAIs.length > maxAvatars && (
                      <div 
                        className={`border-2 rounded-full flex items-center justify-center shadow-lg ${
                          isDarkMode ? 'border-gray-700 bg-gray-600' : 'border-white bg-gray-200'
                        }`}
                        style={{ 
                          width: isMobile ? 32 : 48, 
                          height: isMobile ? 32 : 48 
                        }}
                      >
                        <span className="text-xs font-medium">+{selectedAIs.length - maxAvatars}</span>
                      </div>
                    )}
                  </>
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
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
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
              className={`touch-target !rounded-button whitespace-nowrap cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:scale-100 hover:translate-y-0 hover:shadow-none' : 'hover:bg-gray-50 hover:scale-100 hover:translate-y-0 hover:shadow-none'} transition-colors duration-200 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex items-center`}
              title={currentChat ? "Tạo cuộc trò chuyện mới" : "Bắt đầu cuộc trò chuyện mới"}
            >
              <i className="fas fa-plus mr-0 sm:mr-1 text-xs sm:text-sm"></i>
              <span className="hidden sm:inline">
                {currentChat ? "Chat mới" : "Tạo mới"}
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
                          ? (isDarkMode ? 'bg-green-700 border-green-600 hover:bg-green-600' : 'bg-green-100 border-green-300 hover:bg-green-200')
                          : (isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'hover:bg-gray-50')
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
                  className={`touch-target !rounded-button whitespace-nowrap cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:scale-100 hover:translate-y-0 hover:shadow-none' : 'hover:bg-gray-50 hover:scale-100 hover:translate-y-0 hover:shadow-none'} transition-colors duration-200 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3`}
                  title="Thêm AI vào cuộc trò chuyện"
                >
                  <i className="fas fa-user-plus mr-0 sm:mr-1 text-xs sm:text-sm"></i>
                  <span className="hidden sm:inline">Thêm AI</span>
                </Button>
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
                      onClick={() => toggleAISelection(ai.id)}
                      className={`p-3 sm:p-4 rounded-xl flex items-center cursor-pointer transition-colors touch-target ${
                        selectedAIs.includes(ai.id) 
                          ? (isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200') 
                          : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                      }`}
                    >
                      <OptimizedAvatar
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
        
        {/* Chat Messages - responsive container */}
        <ScrollArea
          className={`flex-1 chat-mobile smooth-auto-scroll ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'} ${getScrollAreaPadding()} pb-28 lg:pb-0`}
          ref={chatContainerRef}
        >
          <div className={getDynamicMaxWidth()}>
            {/* Show Welcome Screen when no messages exist */}
            {(selectedAIs.length === 0 ? singleChatMessages.length === 0 : messages.length === 0) ? (
              <WelcomeScreen
                selectedAIs={selectedAIs}
                onToggleAI={toggleAISelection}
                aiCharacters={aiAssistants}
                darkMode={isDarkMode}
                onStartChat={() => {
                  // Focus on input after selecting AIs
                  const input = document.querySelector('textarea');
                  if (input) input.focus();
                }}
              />
            ) : (
              <div className={`space-y-3 sm:space-y-6 ${getDynamicPadding()} py-4 sm:py-8`}>
                {selectedAIs.length === 0 ? (
                  // Single chat mode - show single chat messages
                  (() => {
                    console.log('🔍 Rendering single chat messages:', singleChatMessages);
                    return singleChatMessages.map((message) => {
                      console.log('🎨 Rendering message:', message);
                      const isUser = message.sender === 'user';
                      // Get AI character from service for single chat assistant
                      const assistantCharacter = isUser ? undefined : singleChatService.getAssistantCharacter();
                      
                      return (
                        <MessageItem
                          key={message.id}
                          message={message}
                          ai={assistantCharacter}
                          darkMode={isDarkMode}
                          onReply={() => {}} // No reply function for single chat
                        />
                      );
                    });
                  })()
                ) : (
                  // Group chat mode - show group chat messages
                  messages.map((message) => {
                    const isUser = message.sender === 'user';
                    // For AI messages, sender will be the AI name (not ID)
                    const ai = isUser ? null : getAIByName(message.sender);
                    
                    return (
                      <MessageItem
                        key={message.id}
                        message={message}
                        ai={ai ?? undefined}
                        darkMode={isDarkMode}
                        onReply={startReplyMode}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Independent Typing Indicator - Above Reply/Input Area */}
        {(selectedAIs.length === 0 ? singleChatProcessing : typingAIs.length > 0) && (
          <div className={`${getDynamicPadding()} py-2`}>
            <div className="flex items-center space-x-2">
              {/* Smaller Avatars */}
              <div className="flex -space-x-1">
                {selectedAIs.length === 0 ? (
                  // Single chat assistant avatar
                  <OptimizedAvatar
                    src={singleChatService.getAssistantAvatar()}
                    alt={singleChatService.getAssistantName()}
                    size={16}
                    className="shadow-sm border border-white"
                    fallbackText="EA"
                  />
                ) : (
                  // Group chat typing AIs
                  typingAIs.map((ai) => (
                    <OptimizedAvatar
                      key={ai.id}
                      src={ai.avatar}
                      alt={ai.name}
                      size={16}
                      className="shadow-sm border border-white"
                      fallbackText={ai.name.substring(0, 1)}
                    />
                  ))
                )}
              </div>
              {/* Compact Typing Indicator */}
              <div className={`rounded-lg px-2 py-1 ${isDarkMode ? 'bg-gray-700/95 border border-gray-600/50' : 'bg-white/95 border border-gray-200/50'} shadow-md backdrop-blur-sm`}>
                <div className="flex items-center space-x-1.5">
                  <div className="flex space-x-0.5">
                    <div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse sm:animate-bounce"></div>
                    <div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse sm:animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 rounded-full bg-orange-400 animate-pulse sm:animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className={`text-[10px] font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedAIs.length === 0 
                      ? 'typing...'
                      : (typingAIs.length === 1 
                        ? 'typing...'
                        : `${typingAIs.length} typing...`
                      )
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
        <div className="lg:hidden fixed bottom-20 left-0 right-0 z-40 mx-4">
          <div className="relative">
            <Input
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const isInputDisabled = selectedAIs.length === 0 ? singleChatProcessing : (isProcessing && !isAutoInteracting);
                  if (!isInputDisabled && inputMessage.trim()) {
                    enhancedSendMessage(inputMessage);
                    setInputMessage('');
                  }
                }
              }}
              placeholder={
                replyMode?.isActive 
                  ? `Reply to ${replyMode.aiName}...` 
                  : selectedAIs.length === 0
                    ? (singleChatProcessing ? "Processing..." : "Type your English question...")
                    : ((isProcessing && !isAutoInteracting) ? "Processing..." : 
                       isAutoInteracting ? "AI is interacting..." :
                       "Type your message...")
              }
              disabled={selectedAIs.length === 0 ? singleChatProcessing : (isProcessing && !isAutoInteracting)}
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
                  onClick={() => {
                    const isInputDisabled = selectedAIs.length === 0 ? singleChatProcessing : (isProcessing && !isAutoInteracting);
                    if (!isInputDisabled && inputMessage.trim()) {
                      enhancedSendMessage(inputMessage);
                      setInputMessage('');
                    }
                  }}
                  disabled={selectedAIs.length === 0 ? singleChatProcessing : (isProcessing && !isAutoInteracting)}
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
