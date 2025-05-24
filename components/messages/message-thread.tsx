"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import type { Conversation, User } from "./types"
import MessageBubble from "./message-bubble"
import MessageInput from "./message-input"
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-mobile"

interface MessageThreadProps {
  conversation: Conversation
  currentUser: User
  onSendMessage: (text: string, attachments?: any[]) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export default function MessageThread({
  conversation,
  currentUser,
  onSendMessage,
  messagesEndRef,
}: MessageThreadProps) {
  const [showDateDivider, setShowDateDivider] = useState<string[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")
  const containerRef = useRef<HTMLDivElement>(null)

  const otherParticipant =
    conversation.participants.find((p) => p.id !== currentUser.id) || conversation.participants[0]

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversation.messages, messagesEndRef])

  useEffect(() => {
    // Calculate which messages should show date dividers
    const dates = new Set<string>()
    const dividers: string[] = []

    conversation.messages.forEach((message, index) => {
      const messageDate = message.timestamp.toLocaleDateString()

      // If this is the first message with this date, add a divider
      if (!dates.has(messageDate)) {
        dates.add(messageDate)
        dividers.push(message.id)
      }
    })

    setShowDateDivider(dividers)
  }, [conversation.messages])

  const formatDateDivider = (date: Date): string => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case "online":
        return "Online"
      case "away":
        return "Away"
      case "offline":
        const lastActive = otherParticipant.lastActive
        return `Last seen ${lastActive}`
      default:
        return "Unknown"
        const now = new Date()
        const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))

        if (diffMinutes < 60) {
          return `Active ${diffMinutes} min ago`
        } else if (diffMinutes < 24 * 60) {
          return `Active ${Math.floor(diffMinutes / 60)} hr ago`
        } else {
          return `Active ${Math.floor(diffMinutes / (60 * 24))} days ago`
        }
    }
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-1" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="relative">
            <img
              src={otherParticipant.avatar || "/placeholder.svg"}
              alt={otherParticipant.name}
              className="h-10 w-10 rounded-full object-cover border"
            />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(
                otherParticipant.status,
              )}`}
            ></span>
          </div>
          <div>
            <h3 className="font-medium">{otherParticipant.name}</h3>
            <p className="text-xs text-muted-foreground">{getStatusText(otherParticipant.status)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-auto" ref={containerRef} style={{ scrollBehavior: "smooth" }}>
        <div className="space-y-4">
          <AnimatePresence>
            {conversation.messages.map((message, index) => {
              const showDivider = showDateDivider.includes(message.id)
              const isFromCurrentUser = message.senderId === currentUser.id
              const sender = conversation.participants.find((p) => p.id === message.senderId)

              return (
                <div key={message.id}>
                  {showDivider && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center my-6"
                    >
                      <div className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                        {formatDateDivider(message.timestamp)}
                      </div>
                    </motion.div>
                  )}

                  <MessageBubble
                    message={message}
                    isFromCurrentUser={isFromCurrentUser}
                    sender={sender}
                    showSender={index === 0 || conversation.messages[index - 1].senderId !== message.senderId}
                  />
                </div>
              )
            })}
          </AnimatePresence>

          {conversation.isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 max-w-[80%]"
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                <img
                  src={otherParticipant.avatar || "/placeholder.svg"}
                  alt={otherParticipant.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                <div className="flex space-x-1">
                  <motion.span
                    className="h-2 w-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                  />
                  <motion.span
                    className="h-2 w-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                  />
                  <motion.span
                    className="h-2 w-2 bg-muted-foreground rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput onSendMessage={onSendMessage} />
    </>
  )
}
