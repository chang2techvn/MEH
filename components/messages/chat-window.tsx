"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Maximize2, ArrowRightIcon as ArrowsMaximize, ArrowLeftIcon as ArrowsMinimize } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useChat } from "@/contexts/chat-context"
import { formatDistanceToNow } from "date-fns"
import { useDraggable } from "@/hooks/use-draggable"
import MessageInput from "./message-input"
import MessageBubble from "./message-bubble"

interface ChatWindowProps {
  conversationId: string
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const {
    closeChatWindow,
    minimizeChatWindow,
    getConversationById,
    sendMessage,
    currentUser,
    windowPositions,
    updateWindowPosition,
    setActiveConversation,
    activeConversation,
  } = useChat()

  const conversation = getConversationById(conversationId)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isActive = activeConversation === conversationId

  const initialPosition = windowPositions[conversationId] || {
    x: Math.max(80, Math.min(window.innerWidth - 380, window.innerWidth / 2 - 175)),
    y: Math.max(50, Math.min(window.innerHeight - 500, window.innerHeight / 2 - 225)),
  }

  const { position, elementRef, isDragging, zIndex, handleMouseDown } = useDraggable({
    initialPosition,
    bounds: { left: 0, top: 0 },
    onDragEnd: (newPosition) => {
      updateWindowPosition(conversationId, newPosition)
    },
    onDragStart: () => {
      setActiveConversation(conversationId)
    },
    snapToEdge: true,
    zIndex: isActive ? 50 : 40,
  })

  const otherParticipant = conversation?.participants.find((p) => p.id !== currentUser.id)

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (text: string, attachments?: any[]) => {
    if (text.trim() || (attachments && attachments.length > 0)) {
      sendMessage(conversationId, text, attachments)
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleWindowClick = () => {
    if (activeConversation !== conversationId) {
      setActiveConversation(conversationId)
    }
  }

  if (!conversation || !otherParticipant) return null

  // Determine window dimensions based on state
  let windowWidth = isExpanded ? "500px" : "350px"
  let windowHeight = isExpanded ? "80vh" : "450px"
  let windowPosition = { ...position }

  // Override for fullscreen mode
  if (isFullscreen) {
    windowWidth = "100vw"
    windowHeight = "100vh"
    windowPosition = { x: 0, y: 0 }
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof conversation.messages }[] = []
  let currentDate = ""

  conversation.messages.forEach((message) => {
    const messageDate = message.timestamp.toLocaleDateString()

    if (messageDate !== currentDate) {
      currentDate = messageDate
      groupedMessages.push({
        date: messageDate,
        messages: [message],
      })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message)
    }
  })

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`fixed ${isFullscreen ? "top-0 left-0 rounded-none" : "rounded-lg"} bg-white dark:bg-gray-900 shadow-lg border ${
        isActive ? "border-neo-mint/50 dark:border-purist-blue/50" : "border-white/20 dark:border-gray-800/20"
      } flex flex-col overflow-hidden`}
      style={{
        height: windowHeight,
        width: windowWidth,
        left: isFullscreen ? 0 : `${windowPosition.x}px`,
        top: isFullscreen ? 0 : `${windowPosition.y}px`,
        transform: "none",
        cursor: isDragging ? "grabbing" : "auto",
        zIndex: isFullscreen ? 1000 : zIndex,
        transition: isDragging ? "none" : "height 0.3s ease, width 0.3s ease",
      }}
      onClick={handleWindowClick}
    >
      {/* Header */}
      <div
        className={`py-2.5 px-3 border-b drag-handle ${
          isActive
            ? "border-neo-mint/30 dark:border-purist-blue/30 bg-gradient-to-r from-neo-mint/10 to-purist-blue/10"
            : "border-white/20 dark:border-gray-800/20 bg-white/80 dark:bg-gray-900/80"
        } backdrop-blur-sm flex items-center justify-between ${isFullscreen ? "" : "cursor-grab"}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Avatar className="h-9 w-9 border border-white/20 dark:border-gray-800/20">
              <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
              <AvatarFallback>{otherParticipant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
                otherParticipant.status === "online"
                  ? "bg-green-500"
                  : otherParticipant.status === "away"
                    ? "bg-yellow-500"
                    : "bg-gray-400"
              }`}
            ></span>
          </div>
          <div>
            <h3 className="font-medium text-sm">{otherParticipant.name}</h3>
            <p className="text-xs text-muted-foreground">
              {otherParticipant.status === "online"
                ? "Active now"
                : otherParticipant.status === "away"
                  ? "Away"
                  : `Last active ${formatDistanceToNow(otherParticipant.lastActive, { addSuffix: true })}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
              onClick={() => minimizeChatWindow(conversationId)}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Minimize</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
            onClick={toggleExpand}
          >
            {isExpanded ? <ArrowsMinimize className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="sr-only">{isExpanded ? "Collapse" : "Expand"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <ArrowsMinimize className="h-4 w-4" /> : <ArrowsMaximize className="h-4 w-4" />}
            <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-white/20 dark:hover:bg-gray-800/20"
            onClick={() => closeChatWindow(conversationId)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            {/* Date separator */}
            <div className="flex items-center justify-center">
              <div className="bg-muted px-3 py-1 rounded-full">
                <span className="text-xs font-medium text-muted-foreground">
                  {new Date(group.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            <AnimatePresence initial={false}>
              {group.messages.map((message, index) => {
                const isFromCurrentUser = message.senderId === currentUser.id
                const showSender = index === 0 || group.messages[index - 1].senderId !== message.senderId
                const sender = conversation.participants.find((p) => p.id === message.senderId)

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isFromCurrentUser={isFromCurrentUser}
                    sender={sender}
                    showSender={showSender}
                    compact={false}
                  />
                )
              })}
            </AnimatePresence>
          </div>
        ))}

        {conversation.isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.name} />
                <AvatarFallback>{otherParticipant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 bg-white/20 dark:bg-gray-800/20">
                <div className="flex space-x-1">
                  <motion.div
                    className="h-2 w-2 rounded-full bg-muted-foreground"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0 }}
                  />
                  <motion.div
                    className="h-2 w-2 rounded-full bg-muted-foreground"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2 }}
                  />
                  <motion.div
                    className="h-2 w-2 rounded-full bg-muted-foreground"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/20 dark:border-gray-800/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <MessageInput onSendMessage={handleSendMessage} compact={!isExpanded && !isFullscreen} />
      </div>
    </motion.div>
  )
}
