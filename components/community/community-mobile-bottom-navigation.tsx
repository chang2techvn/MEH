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
import { Bookmark, Calendar, MessageSquare, User, LogOut, Settings, Bot } from "lucide-react"
import { SavedPostsModal } from "@/components/community/saved-posts-modal"
import { EventsModal } from "@/components/community/events-modal"
import { MessagesModal } from "@/components/messages/messages-modal"
import { AIChatBox } from "@/components/ai-helper/ai-chat-box"
import { useAuthState, useAuthActions } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context-realtime"
import { useRouter } from "next/navigation"

interface CommunityMobileBottomNavigationProps {
  isVisible?: boolean
}

export function CommunityMobileBottomNavigation({ isVisible = true }: CommunityMobileBottomNavigationProps) {
  const [savedModalOpen, setSavedModalOpen] = useState(false)
  const [eventsModalOpen, setEventsModalOpen] = useState(false)
  const [messagesModalOpen, setMessagesModalOpen] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const { user, isAuthenticated } = useAuthState()
  const { logout } = useAuthActions()
  const { toggleDropdown, totalUnreadCount, isDropdownOpen } = useChat()
  const router = useRouter()
  
  const handleSavedClick = () => {
    if (!isAuthenticated) return
    setSavedModalOpen(true)
  }
  
  const handleEventsClick = () => {
    setEventsModalOpen(true)
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
              
              {/* Saved Posts */}
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
                            : savedModalOpen 
                              ? "bg-orange-100 dark:bg-orange-900/30" 
                              : "hover:bg-muted"
                        }`}
                        onClick={handleSavedClick}
                        disabled={!isAuthenticated}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          !isAuthenticated 
                            ? "opacity-0" 
                            : savedModalOpen 
                              ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                              : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <Bookmark className={`relative h-6 w-6 ${
                          !isAuthenticated 
                            ? "text-gray-400" 
                            : savedModalOpen 
                              ? "text-orange-600 dark:text-orange-400" 
                              : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Saved</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isAuthenticated ? "Saved Posts" : "Login to view saved posts"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Events */}
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
                          eventsModalOpen ? "bg-orange-100 dark:bg-orange-900/30" : "hover:bg-muted"
                        }`}
                        onClick={handleEventsClick}
                      >
                        <div className={`absolute -inset-1 rounded-xl blur-sm transition-opacity ${
                          eventsModalOpen 
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 opacity-70" 
                            : "bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-50"
                        }`}></div>
                        <Calendar className={`relative h-6 w-6 ${
                          eventsModalOpen 
                            ? "text-orange-600 dark:text-orange-400" 
                            : "text-gray-700 dark:text-gray-300"
                        }`} />
                      </Button>
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">Events</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Community Events</p>
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

              {/* AI Assistant */}
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
                      <span className="text-[9px] text-muted-foreground font-medium leading-tight">AI</span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>AI Assistant</p>
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
      <SavedPostsModal 
        isOpen={savedModalOpen} 
        onClose={() => setSavedModalOpen(false)} 
      />
      
      <EventsModal 
        isOpen={eventsModalOpen} 
        onClose={() => setEventsModalOpen(false)} 
      />
      
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
    </>
  )
}
