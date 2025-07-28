"use client"
/* eslint-disable */

import { useState } from "react"
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
import { TrendingUp, Trophy, MessageSquare, User, LogOut, Settings, Bot } from "lucide-react"
import { ProgressModal } from "@/components/home/progress-modal"
import { LeaderboardModal } from "@/components/home/leaderboard-modal"
import { MessagesModal } from "@/components/messages/messages-modal"
import { AIChatBox } from "@/components/ai-helper/ai-chat-box"
import { useAuthState, useAuthActions } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context-realtime"
import { useRouter } from "next/navigation"

interface MobileBottomNavigationProps {
  isVisible?: boolean
}

export function MobileBottomNavigation({ isVisible = true }: MobileBottomNavigationProps) {
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false)
  const [messagesModalOpen, setMessagesModalOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { user, isAuthenticated } = useAuthState()
  const { logout } = useAuthActions()
  const { toggleDropdown, totalUnreadCount, isDropdownOpen } = useChat()
  const router = useRouter()
  
  const handleProgressClick = () => {
    if (!isAuthenticated) return
    setProgressModalOpen(true)
  }
  
  const handleLeaderboardClick = () => {
    setLeaderboardModalOpen(true)
  }

  const handleMessageClick = () => {
    if (!isAuthenticated) return
    setMessagesModalOpen(true)
  }

  const handleAIChatClick = () => {
    setIsAIChatOpen(true)
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
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-800/20 shadow-lg">
          <div className="px-4 py-1">
            <div className="flex items-center justify-around max-w-md mx-auto">
              
              {/* Your Progress */}
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
                            : progressModalOpen 
                              ? "bg-orange-100 dark:bg-orange-900/30" 
                              : "hover:bg-muted"
                        }`}
                        onClick={handleProgressClick}
                        disabled={!isAuthenticated}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          !isAuthenticated 
                            ? "opacity-0" 
                            : progressModalOpen 
                              ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                              : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <TrendingUp className={`relative h-6 w-6 ${
                          !isAuthenticated 
                            ? "text-gray-400" 
                            : progressModalOpen 
                              ? "text-orange-600 dark:text-orange-400" 
                              : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Progress</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isAuthenticated ? "Your Progress" : "Login to view your progress"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Global Leaderboard */}
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
                          leaderboardModalOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                        }`}
                        onClick={handleLeaderboardClick}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          leaderboardModalOpen 
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                            : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <Trophy className={`relative h-6 w-6 ${
                          leaderboardModalOpen 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Leaderboard</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Global Leaderboard</p>
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
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-[9px] text-white shadow-glow-sm">
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                          </span>
                        )}
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Messages</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isAuthenticated ? "Messages" : "Sign in to view messages"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* AI Chat */}
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
                          isAIChatOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                        }`}
                        onClick={handleAIChatClick}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          isAIChatOpen 
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                            : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <Bot className={`relative h-6 w-6 ${
                          isAIChatOpen 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">AI Chat</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>AI Assistant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Avatar Profile */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      
                      
                      className="flex flex-col items-center min-w-0"
                    >
                      {isAuthenticated && user ? (
                        <DropdownMenu open={profileDropdownOpen} onOpenChange={setProfileDropdownOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`relative group transition-colors h-10 w-10 rounded-xl p-1 ${
                                profileDropdownOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                              }`}
                            >
                              <div
                                className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                                  profileDropdownOpen
                                    ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70"
                                    : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                                }`}
                              />
                              <Avatar
                                className={`relative h-7 w-7 ring-2 transition-all ${
                                  profileDropdownOpen ? "ring-orange-500/50" : "ring-transparent group-hover:ring-gray-400/50"
                                }`}
                              >
                                <AvatarImage src={user.avatar} alt={user.name || "User"} />
                                <AvatarFallback
                                  className={`text-white text-sm ${
                                    profileDropdownOpen
                                      ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                      : "bg-gradient-to-br from-gray-500 to-gray-700"
                                  }`}
                                >
                                  {(user.name || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" side="top" className="w-56 mb-2">
                            <DropdownMenuLabel className="font-normal">
                              <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                              </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/profile") }>
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Profile Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Log out</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleLogin}
                          className="relative group transition-colors h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                        >
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 blur-sm opacity-70"></div>
                          <User className="relative h-6 w-6 text-white" />
                        </Button>
                      )}
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">
                        {isAuthenticated ? "Profile" : "Login"}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isAuthenticated ? "Profile Menu" : "Login"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Modal */}
      <MessagesModal 
        isOpen={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
      />

      {/* AI Chat Box */}
      {isAIChatOpen && (
        <AIChatBox 
          onClose={() => setIsAIChatOpen(false)} 
          onMinimize={() => setIsAIChatOpen(false)}
          buttonPosition={{ x: 0, y: 0 }}
          initialPosition={{ x: 10, y: 10 }}
        />
      )}

      {/* Progress Modal */}
      <ProgressModal 
        isOpen={progressModalOpen} 
        onClose={() => setProgressModalOpen(false)} 
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={leaderboardModalOpen}
        onClose={() => setLeaderboardModalOpen(false)}
      />
    </>
  )
}
