"use client"
/* eslint-disable */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MessageSquare, User, LogOut, Settings, Bot, History, Sparkles, BookOpen, Target } from "lucide-react"
import { MessagesModal } from "@/components/messages/messages-modal"
import { AIChatBox } from "@/components/ai-helper/ai-chat-box"
import { AISelectionModal } from "@/components/ai-hub/ai-selection-modal"
import { ChatHistoryModal } from "@/components/ai-hub/chat-history-modal"
import { VocabularyModal } from "@/components/ai-hub/learning-stats/VocabularyModal"
import { GoalsListModal } from "@/components/ai-hub/learning-stats/GoalsListModal"
import { GoalModal } from "@/components/ai-hub/learning-stats/GoalModal"
import { NewVocabularyModal } from "@/components/ai-hub/learning-stats/NewVocabularyModal"
import { GoalProgressModal } from "@/components/ai-hub/learning-stats/GoalProgressModal"
import { useAuthState, useAuthActions } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context-realtime"
import { useRouter } from "next/navigation"
import { AICharacter } from "@/types/ai-hub.types"
import { LearningGoal, useLearningGoals, useVocabulary } from "@/hooks/use-learning-goals"
import { useTheme } from "@/contexts/theme-context"
import { useKeyboardHeight } from "@/hooks/use-keyboard-height"

interface ResourcesMobileBottomNavigationProps {
  isVisible?: boolean
  onSelectAI?: (ai: AICharacter) => void // Legacy single select
  onToggleAI?: (aiId: string) => void // Toggle AI selection
  onStartChat?: (selectedAIIds: string[]) => void // Multi-select callback
  onSelectChat?: (chatId: string) => void
  selectedAIs?: string[]
}

export function ResourcesMobileBottomNavigation({ 
  isVisible = true,
  onSelectAI,
  onToggleAI,
  onStartChat,
  onSelectChat,
  selectedAIs = []
}: ResourcesMobileBottomNavigationProps) {
  const [messagesModalOpen, setMessagesModalOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [aiSelectionModalOpen, setAISelectionModalOpen] = useState(false)
  const [chatHistoryModalOpen, setChatHistoryModalOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [vocabularyModalOpen, setVocabularyModalOpen] = useState(false)
  const [newVocabularyModalOpen, setNewVocabularyModalOpen] = useState(false)
  const [goalsListModalOpen, setGoalsListModalOpen] = useState(false)
  const [goalCreateModalOpen, setGoalCreateModalOpen] = useState(false)
  const [goalProgressModalOpen, setGoalProgressModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null)
  
  // Use theme context instead of manual detection
  const { theme } = useTheme()
  const darkMode = theme.mode === 'dark'
  const { user, isAuthenticated } = useAuthState()
  const { logout } = useAuthActions()
  const { toggleDropdown, totalUnreadCount, isDropdownOpen } = useChat()
  const { goals, loading: goalsLoading, createGoal, updateGoalProgress, refetch: refetchGoals } = useLearningGoals()
  const { vocabulary, loading: vocabularyLoading, refreshVocabulary } = useVocabulary()
  const router = useRouter()
  
  // Add keyboard detection to hide navigation when keyboard is open
  const keyboard = useKeyboardHeight()
  const isKeyboardOpen = keyboard.height > 0

  // Debug keyboard state - only log on changes
  useEffect(() => {
  }, [isKeyboardOpen, isVisible]);
  
  const handleMessageClick = () => {
    if (!isAuthenticated) return
    setMessagesModalOpen(true)
  }

  const handleAIChatClick = () => {
    setVocabularyModalOpen(true) // Changed: Open VocabularyModal instead of AIChatBox
  }

  const handleCreateNewVocabulary = () => {
    setNewVocabularyModalOpen(true)
  }

  const handleGoalsListClick = () => {
    setGoalsListModalOpen(true)
  }
  
  const handleCreateNewGoal = () => {
    setGoalCreateModalOpen(true)
  }
  
  const handleSaveGoal = async (newGoalData: any) => {
    try {
      const result = await createGoal(newGoalData)
      if (result) {
        setGoalCreateModalOpen(false)
        // Force refresh goals list to ensure UI updates
        await refetchGoals()
      } else {
        console.error('Failed to create goal - no result returned')
      }
    } catch (error) {
      console.error('Error in handleSaveGoal:', error)
    }
  }
  
  const handleGoalClick = (goal: LearningGoal) => {
    // Mở GoalProgressModal nếu goal chưa complete
    if (goal.current < goal.target) {
      setSelectedGoal(goal)
      setGoalProgressModalOpen(true)
    }
  }
  
  const handleGoalProgress = async (goalId: string, progressData: any) => {
    await updateGoalProgress(goalId, progressData)
  }

  const handleAISelectionClick = () => {
    setAISelectionModalOpen(true)
  }

  const handleChatHistoryClick = () => {
    setChatHistoryModalOpen(true)
  }

  const handleSelectAI = (ai: AICharacter) => {
    if (onSelectAI) {
      onSelectAI(ai)
    }
  }

  const handleStartChat = (selectedAIIds: string[]) => {
    if (onStartChat) {
      onStartChat(selectedAIIds)
    }
  }

  const handleSelectChat = (chatId: string) => {
    if (onSelectChat) {
      onSelectChat(chatId)
    }
  }

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
  }

  const handleLogout = () => {
    logout()
  }

  const handleLogin = () => {
    router.push("/auth/login")
  }

  if (!isVisible) return null

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: (isKeyboardOpen || !isVisible) ? 120 : 0, 
          opacity: (isKeyboardOpen || !isVisible) ? 0 : 1 
        }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ 
          duration: 0.25, 
          ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for smoothness
          type: "tween"
        }}
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          pointerEvents: (isKeyboardOpen || !isVisible) ? 'none' : 'auto',
          willChange: 'transform, opacity' // Optimize for animations
        }}
      >
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-800/20 shadow-lg">
          <div className="px-4 py-1">
            <div className="flex items-center justify-around max-w-md mx-auto">
              
              {/* AI Selection */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="flex flex-col items-center min-w-0"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`relative group transition-colors h-10 w-10 rounded-xl ${
                          aiSelectionModalOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                        }`}
                        onClick={handleAISelectionClick}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          aiSelectionModalOpen 
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                            : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <Sparkles className={`relative h-6 w-6 ${
                          aiSelectionModalOpen 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">AI</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Chọn AI để trò chuyện</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Chat History */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="flex flex-col items-center min-w-0"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`relative group transition-colors h-10 w-10 rounded-xl ${
                          chatHistoryModalOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                        }`}
                        onClick={handleChatHistoryClick}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          chatHistoryModalOpen 
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                            : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <History className={`relative h-6 w-6 ${
                          chatHistoryModalOpen 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Lịch sử</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Lịch sử trò chuyện</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Messages */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="flex flex-col items-center min-w-0"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`relative group transition-colors h-10 w-10 rounded-xl ${
                          !isAuthenticated 
                            ? "opacity-50 cursor-not-allowed" 
                            : messagesModalOpen 
                              ? "bg-orange-100 dark:bg-orange-900/30" 
                              : "hover:bg-muted"
                        }`}
                        onClick={handleMessageClick}
                        disabled={!isAuthenticated}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          !isAuthenticated 
                            ? "opacity-0" 
                            : messagesModalOpen 
                              ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                              : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <MessageSquare className={`relative h-6 w-6 ${
                          !isAuthenticated 
                            ? "text-gray-400" 
                            : messagesModalOpen 
                              ? "text-orange-600 dark:text-orange-400" 
                              : "text-gray-700 dark:text-gray-300"
                        }`} />
                        {isAuthenticated && totalUnreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                          </span>
                        )}
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Messages</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isAuthenticated ? "Messages" : "Login to access messages"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Vocabulary */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="flex flex-col items-center min-w-0"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`relative group transition-colors h-10 w-10 rounded-xl ${
                          vocabularyModalOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                        }`}
                        onClick={handleAIChatClick}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          vocabularyModalOpen 
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                            : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <BookOpen className={`relative h-6 w-6 ${
                          vocabularyModalOpen 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Vocab</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Vocabulary Manager</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Goals List */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      className="flex flex-col items-center min-w-0"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`relative group transition-colors h-10 w-10 rounded-xl ${
                          goalsListModalOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                        }`}
                        onClick={handleGoalsListClick}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          goalsListModalOpen 
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                            : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <Target className={`relative h-6 w-6 ${
                          goalsListModalOpen 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Goals</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Learning Goals</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Profile or Login */}
              {isAuthenticated ? (
                <DropdownMenu open={profileDropdownOpen} onOpenChange={setProfileDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <motion.div 
                      className="flex flex-col items-center min-w-0"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`relative group transition-colors h-10 w-10 rounded-xl ${
                          profileDropdownOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                        }`}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          profileDropdownOpen 
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                            : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Profile</span>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" side="top" className="w-48 mb-2">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div 
                        className="flex flex-col items-center min-w-0"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative group transition-colors h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                          onClick={handleLogin}
                        >
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 blur-sm opacity-70"></div>
                          <User className="relative h-6 w-6 text-white" />
                        </Button>
                        <span className="text-[9px] text-muted-foreground font-medium leading-tight">Login</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Login to access all features</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals and Chat */}
      <MessagesModal 
        isOpen={messagesModalOpen} 
        onClose={() => setMessagesModalOpen(false)} 
      />
      
      {/* AI Selection Modal */}
      <AISelectionModal
        isOpen={aiSelectionModalOpen}
        onClose={() => setAISelectionModalOpen(false)}
        onSelectAI={handleSelectAI}
        onStartChat={handleStartChat}
        selectedAIs={selectedAIs}
        onToggleAI={onToggleAI}
      />
      
      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={chatHistoryModalOpen}
        onClose={() => setChatHistoryModalOpen(false)}
        onSelectChat={handleSelectChat}
      />
      
      {/* Vocabulary Modal */}
      <VocabularyModal
        isOpen={vocabularyModalOpen}
        onClose={() => setVocabularyModalOpen(false)}
        darkMode={darkMode}
        onCreateNew={handleCreateNewVocabulary}
        vocabulary={vocabulary}
        loading={vocabularyLoading}
      />
      
      {/* Goals List Modal */}
      <GoalsListModal
        isOpen={goalsListModalOpen}
        onClose={() => setGoalsListModalOpen(false)}
        darkMode={darkMode}
        goals={goals}
        loading={goalsLoading}
        onCreateNew={handleCreateNewGoal}
        onGoalClick={handleGoalClick}
      />

      {/* Goal Create Modal */}
      <GoalModal
        isOpen={goalCreateModalOpen}
        onClose={() => setGoalCreateModalOpen(false)}
        onSave={handleSaveGoal}
        darkMode={darkMode}
      />

      {/* New Vocabulary Modal */}
      <NewVocabularyModal
        isOpen={newVocabularyModalOpen}
        onClose={() => setNewVocabularyModalOpen(false)}
        darkMode={darkMode}
        onSuccess={async () => {
          console.log('New vocabulary created successfully')
          // Refresh vocabulary data
          await refreshVocabulary()
          console.log('Vocabulary data refreshed')
          setNewVocabularyModalOpen(false)
        }}
      />

      {/* Goal Progress Modal */}
      <GoalProgressModal
        isOpen={goalProgressModalOpen}
        onClose={() => {
          setGoalProgressModalOpen(false)
          setSelectedGoal(null)
        }}
        darkMode={darkMode}
        goal={selectedGoal}
        onProgress={handleGoalProgress}
      />
    </>
  )
}
