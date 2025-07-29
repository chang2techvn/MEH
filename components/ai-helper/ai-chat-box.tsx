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

interface AIChatBoxProps {
  onClose: () => void
  onMinimize: () => void
  buttonPosition: { x: number; y: number }
  initialPosition?: { x: number; y: number }
}

export function AIChatBox({ onClose, onMinimize, buttonPosition, initialPosition }: AIChatBoxProps) {
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

  // Check mobile state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
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

    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{message.content}</ReactMarkdown>
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
          <h3 className="font-medium">AI Language Assistant</h3>
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
                      y: [0, -10, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <Image
                      src="https://sdmntprukwest.oaiusercontent.com/files/00000000-6178-6243-a963-6830a6c5e8c2/raw?se=2025-07-28T23%3A23%3A17Z&sp=r&sv=2024-08-04&sr=b&scid=b32de84c-687b-5e0e-934d-3f0f487f65cc&skoid=04233560-0ad7-493e-8bf0-1347c317d021&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-28T19%3A07%3A47Z&ske=2025-07-29T19%3A07%3A47Z&sks=b&skv=2024-08-04&sig=RDvWMG8dCr2Yeg6CtLJEmMHPt8ZyNu5QwE5jLoPbZnQ%3D"
                      alt="AI Assistant"
                      width={64}
                      height={64}
                      className="h-16 w-16 mx-auto mb-3 rounded-full object-cover"
                    />
                  </motion.div>
                  <h3 className="text-lg font-medium mb-2">Welcome to AI Assistant</h3>
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
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    initial={{ opacity: 0, y: isMobile ? 0 : 10, scale: isMobile ? 1 : 0.95 }} // Disable animations on mobile
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: isMobile ? 0 : 0.2, delay: isMobile ? 0 : 0.05 * index }} // No delay on mobile
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 ${
                        message.role === "user"
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100 border border-orange-200 dark:border-orange-800"
                          : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {renderMessageContent(message)}
                    </div>
                  </motion.div>
                ))
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
