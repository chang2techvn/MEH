"use client"

import type React from "react"
import type { Message } from "@/hooks/use-gemini-ai"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Bot,
  X,
  Minimize2,
  Maximize2,
  Send,
  Loader2,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Zap,
  BookOpen,
  MessageSquare,
} from "lucide-react"
import { useGeminiAI } from "@/hooks/use-gemini-ai"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Badge } from "@/components/ui/badge"
import { OptimizedMessageAvatar } from "@/components/optimized/optimized-message-avatar"
import { singleChatService } from "@/lib/single-chat-service"

interface AIChatBoxProps {
  onClose: () => void
  onMinimize: () => void
  buttonPosition: { x: number; y: number }
  initialPosition?: { x: number; y: number }
}

export function AIChatBox({ onClose, onMinimize, buttonPosition, initialPosition }: AIChatBoxProps) {
  // Get dynamic AI config from service
  const helperAI = singleChatService.getAssistantCharacter()

  // Calculate position based on button position
  const calculateInitialPosition = () => {
    // Check if mobile/small screen
    const isMobile = window.innerWidth < 768
    
    if (isMobile) {
      // On mobile, use full screen positioning
      return {
        x: 10,
        y: 10
      }
    }
    
    // Desktop positioning
    const x = Math.max(0, buttonPosition.x - 300) // Align right edge with button
    const y = Math.max(0, buttonPosition.y - 450) // Position above the button

    // Make sure it stays within viewport
    const maxX = window.innerWidth - 350
    const maxY = window.innerHeight - 450

    return {
      x: Math.min(x, maxX),
      y: Math.min(y, maxY),
    }
  }

  const defaultPosition = initialPosition || calculateInitialPosition()
  const [position, setPosition] = useState(defaultPosition)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { messages, input, setInput, handleSubmit, isLoading, isTyping, handleQuickResponse } = useGeminiAI()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const chatBoxRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [theme, setTheme] = useState<"light" | "dark" | "gradient">("gradient")
  const [avatarSize, setAvatarSize] = useState<'sm' | 'md'>('md')
  
  // Detect dark mode
  const darkMode = theme === 'dark'

  // Check mobile state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setAvatarSize(window.innerWidth < 640 ? 'sm' : 'md')
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Only scroll if there are actual messages (not welcome screen)
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Auto-resize textarea based on content with debounce
  useEffect(() => {
    const resizeTextarea = () => {
      if (textareaRef.current) {
        // On mobile when maximized, maintain fixed height to prevent layout jumps
        if (isMobile && isMaximized) {
          textareaRef.current.style.height = "60px"
          return
        }
        
        // Store current scroll position to prevent jumping
        const scrollTop = textareaRef.current.scrollTop
        
        // Reset height to calculate correct scrollHeight
        textareaRef.current.style.height = "auto"
        
        // Calculate new height with constraints
        const scrollHeight = textareaRef.current.scrollHeight
        const minHeight = 60
        const maxHeight = 120
        const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight))
        
        // Set the new height smoothly
        textareaRef.current.style.height = `${newHeight}px`
        
        // Restore scroll position if needed
        if (newHeight === maxHeight && scrollTop > 0) {
          textareaRef.current.scrollTop = scrollTop
        }
      }
    }

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(resizeTextarea, 0)
    return () => clearTimeout(timeoutId)
  }, [input, isMaximized, isMobile])

  // Draggable functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't allow dragging when maximized
    if (isMaximized) return
    
    // Only start dragging if clicking on the header (not the buttons)
    if ((e.target as HTMLElement).closest("button")) return

    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })

    // Prevent text selection during drag
    e.preventDefault()
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      // Calculate new position
      let newX = e.clientX - dragOffset.x
      let newY = e.clientY - dragOffset.y

      // Ensure the element stays within the viewport
      const maxX = window.innerWidth - 350
      const maxY = window.innerHeight - 450

      newX = Math.max(0, Math.min(newX, maxX))
      newY = Math.max(0, Math.min(newY, maxY))

      setPosition({ x: newX, y: newY })
    },
    [isDragging, dragOffset],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    // Add global event listeners for mouse move and up
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Submit on Ctrl+Enter or Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSubmit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSubmit])

  // Handle maximize/minimize toggle
  const handleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  // Auto-maximize on small screens and handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768
      setIsMobile(newIsMobile)
      
      if (newIsMobile) {
        // On mobile, force maximized for better UX
        setIsMaximized(true)
      } else {
        // On desktop/tablet, update position if chat box is out of bounds
        if (!isMaximized) {
          setPosition(prevPosition => {
            const maxX = window.innerWidth - 350
            const maxY = window.innerHeight - 450
            
            return {
              x: Math.min(prevPosition.x, Math.max(0, maxX)),
              y: Math.min(prevPosition.y, Math.max(0, maxY))
            }
          })
        }
      }
    }

    // Check on mount
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMaximized])

  // Cycle through themes
  const cycleTheme = () => {
    setTheme((current) => {
      if (current === "light") return "dark"
      if (current === "dark") return "gradient"
      return "light"
    })
  }

  // Get header class based on theme
  const getHeaderClass = () => {
    switch (theme) {
      case "light":
        return "bg-white text-gray-800 border-b border-gray-200"
      case "dark":
        return "bg-gray-900 text-white border-b border-gray-700"
      case "gradient":
      default:
        return "bg-gradient-to-r from-neo-mint to-purist-blue text-white"
    }
  }

  // Get body class based on theme
  const getBodyClass = () => {
    switch (theme) {
      case "light":
        return "bg-gray-50"
      case "dark":
        return "bg-gray-900 border border-gray-800"
      case "gradient":
      default:
        return "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
    }
  }

  // Render message content with markdown support
  const renderMessageContent = (message: Message) => {
    const isUser = message.role === "user"
    
    if (message.type === "thinking") {
      return (
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          <span className="text-sm opacity-70">Thinking...</span>
        </div>
      )
    }

    if (message.type === "error") {
      return (
        <div className="text-red-500">
          <p className="text-sm">{message.content}</p>
        </div>
      )
    }

    if (isUser) {
      return (
        <div className="text-xs sm:text-sm break-words leading-relaxed">{message.content}</div>
      )
    }

    return (
      <div className="w-full min-w-0 overflow-hidden">
        <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none w-full break-words overflow-wrap-anywhere">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom styling for markdown elements with mobile-first responsive design
              strong: ({ children }) => (
                <strong className="text-orange-600 dark:text-orange-400 font-semibold break-words word-break-break-word">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="text-blue-600 dark:text-blue-400 break-words word-break-break-word">
                  {children}
                </em>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400 px-1 py-0.5 rounded text-[10px] sm:text-xs font-mono break-all word-break-break-all overflow-wrap-anywhere">
                  {children}
                </code>
              ),
              p: ({ children }) => (
                <p className="mb-1 sm:mb-2 leading-relaxed text-gray-700 dark:text-gray-300 text-xs sm:text-sm break-words word-break-break-word overflow-wrap-anywhere">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside space-y-1 ml-2 sm:ml-3 my-1 sm:my-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-normal break-words overflow-hidden">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside space-y-1 ml-2 sm:ml-3 my-1 sm:my-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-normal break-words overflow-hidden">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="break-words word-break-break-word overflow-wrap-anywhere">
                  {children}
                </li>
              ),
              h1: ({ children }) => (
                <h1 className="text-sm sm:text-base font-bold mb-1 sm:mb-2 text-gray-800 dark:text-gray-200 break-words">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xs sm:text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200 break-words">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs sm:text-sm font-medium mb-1 text-gray-800 dark:text-gray-200 break-words">
                  {children}
                </h3>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-orange-500 pl-2 my-1 sm:my-2 text-gray-600 dark:text-gray-400 italic break-words text-xs sm:text-sm">
                  {children}
                </blockquote>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-100 dark:bg-gray-800 p-1 sm:p-2 rounded my-1 sm:my-2 overflow-x-auto text-[10px] sm:text-xs break-words whitespace-pre-wrap">
                  {children}
                </pre>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={chatBoxRef}
      className={`fixed z-50 shadow-xl overflow-hidden ${
        isMaximized ? "rounded-none" : "rounded-lg sm:rounded-xl"
      } ${isMobile && isMaximized ? "inset-0" : ""}`} // Use inset-0 for full mobile coverage
      style={{
        top: isMaximized ? "0px" : `${position.y}px`,
        left: isMaximized ? "0px" : `${position.x}px`,
        width: isMaximized ? "100vw" : "min(350px, calc(100vw - 20px))",
        height: isMaximized ? "100vh" : "auto",
        maxHeight: isMaximized ? "100vh" : "min(80vh, 600px)",
      }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        width: isMaximized ? "100vw" : "min(350px, calc(100vw - 20px))",
        height: isMaximized ? "100vh" : "auto",
      }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
    >
      <div
        className={`p-3 flex items-center justify-between ${
          isMaximized ? "cursor-default" : "cursor-move"
        } ${getHeaderClass()}`}
        onMouseDown={isMaximized ? undefined : handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="relative"
          >
            <Sparkles className="h-5 w-5 text-yellow-300 absolute top-0 left-0 opacity-70" />
            <Bot className="h-5 w-5 text-white relative z-10" />
          </motion.div>
          <h3 className="font-medium">{helperAI.name} Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-current hover:bg-white/20 dark:hover:bg-black/20"
            onClick={cycleTheme}
            title="Change theme"
          >
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-current hover:bg-white/20 dark:hover:bg-black/20"
            onClick={handleMaximize}
            title={isMaximized ? "Restore window" : "Maximize window"}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-current hover:bg-white/20 dark:hover:bg-black/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className={getBodyClass()}>
        <ScrollArea 
          className={`${
            isMaximized 
              ? isMobile 
                ? "h-[calc(100vh-160px)] p-3" // Reduced height and moved padding here
                : "h-[calc(100vh-140px)] p-3"
              : "h-[min(350px,calc(80vh-140px))] p-3"
          }`}
        >
          <div className="space-y-4">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.02, 1],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                    className="relative inline-block mb-3"
                  >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={helperAI.avatar}
                        alt={`${helperAI.name} Assistant`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                      >
                        <Sparkles className="absolute top-1 right-1 h-3 w-3 text-yellow-400 opacity-70" />
                        <Sparkles className="absolute bottom-1 left-1 h-2 w-2 text-blue-400 opacity-50" />
                      </motion.div>
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-medium mb-2">Welcome to {helperAI.name} Assistant</h3>
                  <p className="text-muted-foreground mb-4">
                    I'm your AI language assistant powered by Gemini. How can I help with your English learning today?
                  </p>
                  <div className="grid grid-cols-1 gap-2 mt-6 max-w-xs mx-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-left justify-start hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all"
                      onClick={() => handleQuickResponse("Can you help me practice a job interview conversation?")}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 text-neo-mint dark:text-purist-blue" />
                      Practice a job interview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-left justify-start hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all"
                      onClick={() =>
                        handleQuickResponse("Can you explain the difference between 'affect' and 'effect'?")
                      }
                    >
                      <BookOpen className="h-4 w-4 mr-2 text-neo-mint dark:text-purist-blue" />
                      Explain affect vs. effect
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-left justify-start hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all"
                      onClick={() =>
                        handleQuickResponse("Give me feedback on this sentence: 'I have went to the store yesterday.'")
                      }
                    >
                      <Lightbulb className="h-4 w-4 mr-2 text-neo-mint dark:text-purist-blue" />
                      Check my grammar
                    </Button>
                  </div>
                </motion.div>
              ) : (
                messages.map((message, index) => {
                  const isUser = message.role === "user"
                  return (
                    <motion.div
                      key={message.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} message-slide-in px-1 sm:px-3 group mb-3 sm:mb-6`}
                      initial={{ opacity: 0, y: isMobile ? 0 : 10, scale: isMobile ? 1 : 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: isMobile ? 0 : 0.2, delay: isMobile ? 0 : 0.05 * index }}
                    >
                      {!isUser && (
                        <div className="mr-1 sm:mr-3 flex-shrink-0">
                          <OptimizedMessageAvatar
                            src={helperAI.avatar}
                            alt={helperAI.name}
                            size={avatarSize}
                            fallbackText={helperAI.name?.substring(0, 2) || 'AI'}
                            darkMode={darkMode}
                          />
                        </div>
                      )}
                      <div className={`${isUser ? 'max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%]' : 'min-w-0 flex-1 max-w-[85%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[75%]'}`}>
                        {!isUser && (
                          <div className="flex items-center mb-1 sm:mb-2 gap-2 min-w-0">
                            <span className={`text-sm font-medium truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{helperAI.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-[7px] h-5 px-2 py-0 max-w-[80px] sm:max-w-[120px] truncate leading-none flex-shrink-0 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50'}`}
                              title={helperAI.field}
                            >
                              {helperAI.field}
                            </Badge>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl p-2 sm:p-3 shadow-md min-h-fit ${
                            isUser 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white inline-block w-fit max-w-full'
                              : 'bg-gray-700 border border-gray-600 dark:bg-gray-700 dark:border-gray-600 bg-white border-gray-200 min-w-0 max-w-full overflow-hidden'
                          }`}
                        >
                          {renderMessageContent(message)}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={`resize-none bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-neo-mint dark:focus:ring-purist-blue rounded-3xl pr-16 pl-5 py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 ${
                  isMobile && isMaximized 
                    ? "h-[60px] min-h-[60px] max-h-[60px]" // Fixed height on mobile to prevent jumping
                    : "min-h-[60px] max-h-[120px]"
                }`}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent',
                  overflowY: 'auto',
                  lineHeight: '1.5'
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 bottom-3 h-9 w-9 rounded-full hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-40 shadow-xl border-2 border-white dark:border-gray-800"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
          </form>
          <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
            <span className="flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
              Powered by Gemini AI
            </span>
            <Link href="/resources" className="flex items-center hover:text-foreground transition-colors">
              Go to AI Hub <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
